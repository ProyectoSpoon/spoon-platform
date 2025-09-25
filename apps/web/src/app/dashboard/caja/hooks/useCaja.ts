import { useState, useEffect, useCallback, useRef } from 'react';
import { OrdenPendiente, TransaccionCaja, MetodoPago } from '../../caja/types/cajaTypes';
import {
  supabase,
  getUserProfile,
  getTransaccionesDelDia,
  getGastosDelDia,
  getTransaccionesYGastosEnRango,
  getActiveRoles
} from '@spoon/shared/lib/supabase';
import { CAJA_CONFIG } from '../../caja/constants/cajaConstants';
import { useCajaSesion } from './useCajaSesion';
import {
  executeWithRetry,
  ERROR_CONFIGS,
  getCircuitBreakerStatus
} from '@spoon/shared/lib/errorHandling';
import { ensureCajaAbiertaYPermisos, validateMonto, validateMetodoPago } from '@spoon/shared/caja/utils/validations';
import { toCentavos, calcularCambio, formatCentavosToCOP } from '@spoon/shared/caja/utils/currency';
import { CAJA_ERROR_CODES, CAJA_MESSAGES } from '@spoon/shared/caja/constants/messages';

interface MetricasCaja {
  balance: number;
  ventasTotales: number;
  porCobrar: number;
  gastosTotales: number;
  transaccionesDelDia: TransaccionCaja[];
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
  gastosDelPeriodo?: any[];
  gastosPorCategoria?: Record<string, number>;
}

export const useCaja = () => {
  const { sesionActual, estadoCaja, requiereSaneamiento } = useCajaSesion();
  const [ordenesMesas, setOrdenesMesas] = useState<OrdenPendiente[]>([]);
  const [ordenesDelivery, setOrdenesDelivery] = useState<OrdenPendiente[]>([]);
  // Filtro de fecha (Bogotá day string: YYYY-MM-DD)
  const [fechaFiltro, setFechaFiltro] = useState<string>(new Date().toISOString().slice(0, 10));
  const [metricas, setMetricas] = useState<MetricasCaja>({
    balance: 0,
    ventasTotales: 0,
    porCobrar: 0,
    gastosTotales: 0,
    transaccionesDelDia: [],
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalDigital: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes' | 'personalizado'>('hoy');
  const [fechaFinFiltro, setFechaFinFiltro] = useState<string | null>(null);
  // Secuenciador de fetch para evitar condiciones de carrera (solo aplica el último resultado)
  const fetchSeqRef = useRef(0);

  // Helper: convertir un ISO a YYYY-MM-DD en zona America/Bogota
  const isoToBogotaDateString = (iso?: string | null): string | null => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      const bogota = new Date(d.getTime() - 5 * 60 * 60 * 1000);
      return bogota.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  };

  // Ajuste automático del filtro diario al “business day” de la sesión (una vez por cambio de sesión)
  const fechaAutoAjustadaParaSesionRef = useRef<string | null>(null);
  useEffect(() => {
    if (periodo !== 'hoy') return;
    if (!sesionActual?.id) return;
    const sessionBusinessDay = (sesionActual as any)?.business_day as string | undefined;
    const target = sessionBusinessDay || isoToBogotaDateString(sesionActual.abierta_at);
    if (!target) return;
    // Calcular hoy Bogotá para detectar el caso de default del navegador
    const now = new Date();
    const todayBogota = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const sessionChanged = fechaAutoAjustadaParaSesionRef.current !== sesionActual.id;
    const looksLikeDefaultToday = fechaFiltro === todayBogota; // usuario no ha cambiado manualmente
    const shouldAdjust = sessionChanged || looksLikeDefaultToday;
    if (shouldAdjust && target !== fechaFiltro) {
      setFechaFiltro(target);
      fechaAutoAjustadaParaSesionRef.current = sesionActual.id;
      console.log('[useCaja][fecha] Ajuste automático del filtro diario a business_day', { target, sesion: sesionActual.id });
    }
  }, [periodo, sesionActual?.id, sesionActual?.abierta_at, sesionActual, fechaFiltro]);

  // ===============================
  // FUNCIÓN ROBUSTA PARA OBTENER DATOS
  // ===============================
  const sesionId = sesionActual?.id;
  const sesionMontoInicial = sesionActual?.monto_inicial ?? 0;

  const obtenerDatosCaja = useCallback(async () => {
    // Asignar número de secuencia a esta ejecución
    const mySeq = ++fetchSeqRef.current;
    try {
      setLoading(true);
      
      const profile = await executeWithRetry(
        async () => {
          const profile = await getUserProfile();
          if (!profile?.restaurant_id) {
            throw new Error('Usuario no tiene restaurante asignado');
          }
          return profile;
        },
        ERROR_CONFIGS.DATABASE
      );

  console.log('📊 Obteniendo datos de caja con retry automático... seq=', mySeq);

      // EJECUTAR TODAS LAS QUERIES CON ERROR HANDLING
  const [mesasData, deliveryData, transaccionesData, gastosData] = await Promise.all([
        // 1. Órdenes de mesas pendientes
        executeWithRetry(
          async () => {
            const { data, error } = await supabase
              .from('ordenes_mesa')
              .select(`
                id,
                numero_mesa,
                monto_total,
                fecha_creacion,
                nombre_mesero,
                observaciones
              `)
              .eq('restaurant_id', profile.restaurant_id)
              .eq('estado', 'activa')
              .is('pagada_at', null)
              .order('fecha_creacion', { ascending: true });

            if (error) throw error;
            return data || [];
          },
          ERROR_CONFIGS.DATABASE
        ),

        // 2. Órdenes delivery pendientes
        executeWithRetry(
          async () => {
            const { data, error } = await supabase
              .from('delivery_orders')
              .select(`
                id,
                customer_name,
                customer_phone,
                total_amount,
                created_at,
                delivery_address
              `)
              .eq('restaurant_id', profile.restaurant_id)
              .eq('status', 'delivered')
              .is('pagada_at', null)
              .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
          },
          ERROR_CONFIGS.DATABASE
        ),

        // 3 y 4. Métricas dependiendo del periodo seleccionado
        (async () => {
          if (periodo === 'hoy') {
            const resultadoHoy = await executeWithRetry(
              () => getTransaccionesDelDia(profile.restaurant_id!, fechaFiltro),
              ERROR_CONFIGS.DATABASE
            );
            // 🔍 DEBUG: Ver qué retorna la función para diagnosticar forma/propiedades
            try {
              console.log('[useCaja][debug] getTransaccionesDelDia resultado', {
                tipo: typeof resultadoHoy,
                keys: resultadoHoy ? Object.keys(resultadoHoy as any) : [],
                transaccionesLen: (resultadoHoy as any)?.transacciones?.length ?? 'no-existe',
                sample: (resultadoHoy as any)?.transacciones?.[0] ?? null
              });
            } catch { /* no-op */ }
            return resultadoHoy;
          }
          // Calcular rango Bogotá según periodo
          const start = new Date(`${fechaFiltro}T00:00:00.000-05:00`);
          let end: Date;
          if (periodo === 'semana') {
            // Semana: desde lunes de la semana de fechaFiltro hasta domingo
            const day = start.getUTCDay(); // 0 dom .. 6 sab, en UTC del -05 fijo funciona para comparativa aproximada
            const offsetToMonday = ((day + 6) % 7); // días desde lunes
            const monday = new Date(start);
            monday.setUTCDate(start.getUTCDate() - offsetToMonday);
            const sunday = new Date(monday);
            sunday.setUTCDate(monday.getUTCDate() + 6);
            const sStr = monday.toISOString().slice(0,10);
            const eStr = sunday.toISOString().slice(0,10);
            const rango = await executeWithRetry(
              () => getTransaccionesYGastosEnRango(profile.restaurant_id!, sStr, eStr),
              ERROR_CONFIGS.DATABASE
            );
            return rango;
          }
          if (periodo === 'mes') {
            const y = start.getUTCFullYear();
            const m = start.getUTCMonth();
            const first = new Date(Date.UTC(y, m, 1));
            const last = new Date(Date.UTC(y, m + 1, 0));
            const sStr = first.toISOString().slice(0,10);
            const eStr = last.toISOString().slice(0,10);
            const rango = await executeWithRetry(
              () => getTransaccionesYGastosEnRango(profile.restaurant_id!, sStr, eStr),
              ERROR_CONFIGS.DATABASE
            );
            return rango;
          }
          // personalizado
          const sStr = fechaFiltro;
          const eStr = (fechaFinFiltro || fechaFiltro);
          const rango = await executeWithRetry(
            () => getTransaccionesYGastosEnRango(profile.restaurant_id!, sStr, eStr),
            ERROR_CONFIGS.DATABASE
          );
          return rango;
        })(),

        // gastos del día si es 'hoy', de lo contrario null (ya viene en rango)
        periodo === 'hoy'
          ? executeWithRetry(
              () => getGastosDelDia(profile.restaurant_id!, fechaFiltro),
              ERROR_CONFIGS.DATABASE
            )
          : Promise.resolve(null)
      ]);

      // Si otra ejecución más reciente ya inició, descartar este resultado
      if (mySeq !== fetchSeqRef.current) {
        console.log('[useCaja][race] Descartando resultado obsoleto (seq', mySeq, '≠', fetchSeqRef.current, ')');
        return;
      }

      // TRANSFORMAR Y COMBINAR DATOS
      const mesasTransformadas: OrdenPendiente[] = mesasData.map((mesa: any) => ({
        id: mesa.id,
        tipo: 'mesa',
        identificador: `Mesa ${mesa.numero_mesa}`,
        // Ahora montos en pesos directamente
        monto_total: Math.round(mesa.monto_total || 0),
        fecha_creacion: mesa.fecha_creacion,
        detalles: mesa.nombre_mesero ? `Mesero: ${mesa.nombre_mesero}` : undefined
      }));

      const deliveryTransformadas: OrdenPendiente[] = deliveryData.map((orden: any) => ({
        id: orden.id,
        tipo: 'delivery',
        identificador: orden.customer_name,
        // Montos en pesos
        monto_total: Math.round(orden.total_amount || 0),
        fecha_creacion: orden.created_at,
        detalles: orden.customer_phone
      }));

      // CALCULAR MÉTRICAS
      const porCobrarTotal = [...mesasTransformadas, ...deliveryTransformadas]
        .reduce((sum, orden) => sum + orden.monto_total, 0);

      // Unificar forma de métricas según la rama tomada
  const totales = periodo === 'hoy'
        ? {
            totalVentas: (transaccionesData as any).totalVentas,
            totalEfectivo: (transaccionesData as any).totalEfectivo,
            totalTarjeta: (transaccionesData as any).totalTarjeta,
            totalDigital: (transaccionesData as any).totalDigital,
            transacciones: (transaccionesData as any).transacciones,
            totalGastos: (gastosData as any)?.totalGastos ?? 0,
            gastos: (gastosData as any)?.gastos ?? [],
            gastosPorCategoria: (gastosData as any)?.gastosPorCategoria
          }
        : {
            totalVentas: (transaccionesData as any).totalVentas,
            totalEfectivo: (transaccionesData as any).totalEfectivo,
            totalTarjeta: (transaccionesData as any).totalTarjeta,
            totalDigital: (transaccionesData as any).totalDigital,
            transacciones: (transaccionesData as any).transacciones,
            totalGastos: (transaccionesData as any).totalGastos,
            gastos: (transaccionesData as any).gastos || [],
            gastosPorCategoria: (transaccionesData as any).gastosPorCategoria
          };

      // Efectivo teórico en caja física: solo efectivo entra/sale de la caja
      const efectivoTeorico = sesionId 
        ? sesionMontoInicial + totales.totalEfectivo - totales.totalGastos
        : 0;

      // ACTUALIZAR ESTADO
  setOrdenesMesas(mesasTransformadas);
  setOrdenesDelivery(deliveryTransformadas);
      // Recalcular total de gastos si el reportado es 0 pero hay elementos
      let gastosTotalesFinal = typeof totales.totalGastos === 'number' ? totales.totalGastos : 0;
      if (gastosTotalesFinal === 0 && Array.isArray(totales.gastos) && totales.gastos.length > 0) {
        const suma = totales.gastos.reduce((s: number, g: any) => {
          // Soportar diferentes claves potenciales
            const v = g.monto ?? g.monto_total ?? g.total ?? 0;
            const num = typeof v === 'string' ? parseFloat(v) : Number(v);
            return s + (isNaN(num) ? 0 : num);
        }, 0);
        if (suma > 0) {
          console.warn('[useCaja][debug] Recalculando gastosTotales. Valor API=0, suma items=', suma);
          gastosTotalesFinal = suma;
        }
      }

      console.log('[useCaja][debug] totales antes de setMetricas', {
        totalVentas: totales.totalVentas,
        totalGastos: totales.totalGastos,
        gastosLength: Array.isArray(totales.gastos) ? totales.gastos.length : 'no-array',
        sampleGasto: Array.isArray(totales.gastos) && totales.gastos.length > 0 ? totales.gastos[0] : null,
        gastosTotalesFinal
      });

      // Verificar nuevamente antes de aplicar estado costoso
      if (mySeq !== fetchSeqRef.current) {
        console.log('[useCaja][race] Descartando setMetricas obsoleto (seq', mySeq, '≠', fetchSeqRef.current, ')');
        return;
      }
      setMetricas({
        balance: efectivoTeorico,
        ventasTotales: totales.totalVentas,
        porCobrar: porCobrarTotal,
        gastosTotales: gastosTotalesFinal,
        transaccionesDelDia: totales.transacciones,
        totalEfectivo: totales.totalEfectivo,
        totalTarjeta: totales.totalTarjeta,
        totalDigital: totales.totalDigital,
        gastosDelPeriodo: totales.gastos,
        gastosPorCategoria: totales.gastosPorCategoria
      });

      setError(null);
      console.log('✅ Datos de caja obtenidos exitosamente (seq=', mySeq, ')');

    } catch (err: any) {
      console.error('⚠️ Error obteniendo datos de caja (seq=', mySeq, '):', err);
      if (mySeq === fetchSeqRef.current) {
        setError(err.message);
      } else {
        console.log('[useCaja][race] Error ignorado por obsoleto (seq', mySeq, '≠', fetchSeqRef.current, ')');
      }
      
      // Para datos no críticos, mostrar estado del circuit breaker
      const breakerStatus = getCircuitBreakerStatus();
      console.log('🔧 Estado Circuit Breaker:', breakerStatus);
    } finally {
      if (mySeq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, [sesionId, sesionMontoInicial, fechaFiltro, periodo, fechaFinFiltro]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Mantener una referencia estable a la función para evitar re-suscripciones
  const obtenerDatosCajaRef = useRef(obtenerDatosCaja);
  useEffect(() => {
    obtenerDatosCajaRef.current = obtenerDatosCaja;
  }, [obtenerDatosCaja]);

  // Cargar datos iniciales y cuando cambien filtros/periodo, incluso si los WebSockets no están activos
  useEffect(() => {
    try { obtenerDatosCajaRef.current(); } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, fechaFiltro, fechaFinFiltro]);

  

  // ===============================
  // WEBSOCKETS EN TIEMPO REAL (REEMPLAZA AUTO-REFRESH)
  // ===============================
  const restaurantId = (sesionActual as any)?.restaurant_id as string | undefined;

  useEffect(() => {
    // Activar realtime solo en vista 'hoy' para evitar desalineación en otros periodos
    if (estadoCaja === 'abierta' && sesionId && periodo === 'hoy') {
      console.log('🔄 Configurando WebSockets para caja abierta');
      
      // Obtener datos iniciales UNA VEZ
      obtenerDatosCajaRef.current();

      // Utilidad para suscribirse de forma segura y obtener un unsubscribe estable
      const unsubscribes: Array<() => void> = [];

      // WEBSOCKET 1: Escuchar nuevas transacciones SOLO de la sesión actual (update incremental)
      const chTransacciones: any = supabase
        .channel(`transacciones-${sesionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transacciones_caja',
          filter: `caja_sesion_id=eq.${sesionId}`
  }, (payload: any) => {
          console.log('💰 Nueva transacción detectada:', payload.new);
          
          const nuevaTransaccion = payload.new as TransaccionCaja;
          
          // Update incremental - NO refresh completo
          setMetricas(prev => ({
            ...prev, // Mantener todas las propiedades existentes
            ventasTotales: prev.ventasTotales + nuevaTransaccion.monto_total,
            totalEfectivo: nuevaTransaccion.metodo_pago === 'efectivo' 
              ? prev.totalEfectivo + nuevaTransaccion.monto_total 
              : prev.totalEfectivo,
            totalTarjeta: nuevaTransaccion.metodo_pago === 'tarjeta'
              ? prev.totalTarjeta + nuevaTransaccion.monto_total
              : prev.totalTarjeta,
            totalDigital: nuevaTransaccion.metodo_pago === 'digital'
              ? prev.totalDigital + nuevaTransaccion.monto_total
              : prev.totalDigital,
            transaccionesDelDia: [nuevaTransaccion, ...prev.transaccionesDelDia],
            // Actualizar balance solo si la transacción fue en efectivo
            balance: nuevaTransaccion.metodo_pago === 'efectivo'
              ? prev.balance + nuevaTransaccion.monto_total
              : prev.balance
          }));
        });
      const subTrans = typeof chTransacciones?.subscribe === 'function' ? chTransacciones.subscribe() : null;
      unsubscribes.push(() => {
        if (subTrans && typeof subTrans.unsubscribe === 'function') subTrans.unsubscribe();
        else if (chTransacciones && typeof chTransacciones.unsubscribe === 'function') chTransacciones.unsubscribe();
      });

      // WEBSOCKET 1b: Escuchar transacciones del mismo restaurante (otras sesiones del día)
      // Si llega una transacción de otra sesión del restaurante, hacemos un refresh completo para que Ingresos incluya todo el día.
      const chTransaccionesRest: any = supabase
        .channel(`transacciones-restaurante-${restaurantId || 'global'}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transacciones_caja'
  }, (payload: any) => {
          const nueva = payload.new as any;
          const mismaSesion = nueva?.caja_sesion_id === sesionId;
          // Solo reaccionar si no es de la misma sesión pero sí es del mismo restaurante y estamos viendo 'hoy'
          const esMismoRest = (nueva as any)?.restaurant_id ? ((nueva as any).restaurant_id === restaurantId) : true;
          if (!mismaSesion && esMismoRest) {
            console.log('🔁 Transacción en otra sesión del mismo restaurante. Refrescando métricas del día...');
            try { obtenerDatosCajaRef.current(); } catch { /* noop */ }
          }
        });
      const subTransRest = typeof chTransaccionesRest?.subscribe === 'function' ? chTransaccionesRest.subscribe() : null;
      unsubscribes.push(() => {
        if (subTransRest && typeof subTransRest.unsubscribe === 'function') subTransRest.unsubscribe();
        else if (chTransaccionesRest && typeof chTransaccionesRest.unsubscribe === 'function') chTransaccionesRest.unsubscribe();
      });

      // WEBSOCKET 2: Escuchar nuevos gastos
      const chGastos: any = supabase
        .channel(`gastos-${sesionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'gastos_caja',
          filter: `caja_sesion_id=eq.${sesionId}`
  }, (payload: any) => {
          console.log('💸 Nuevo gasto detectado:', payload.new);
          
          const nuevoGasto = payload.new as any;
          
          // Update incremental
          setMetricas(prev => ({
            ...prev, // Mantener todas las propiedades
            gastosTotales: prev.gastosTotales + nuevoGasto.monto,
            balance: prev.balance - nuevoGasto.monto // Restar del balance
          }));
        });
      const subGastos = typeof chGastos?.subscribe === 'function' ? chGastos.subscribe() : null;
      unsubscribes.push(() => {
        if (subGastos && typeof subGastos.unsubscribe === 'function') subGastos.unsubscribe();
        else if (chGastos && typeof chGastos.unsubscribe === 'function') chGastos.unsubscribe();
      });

      // WEBSOCKET 3: Escuchar cambios en órdenes (cuando se pagan)
      const chOrdenes: any = supabase
        .channel(`ordenes-caja-${restaurantId || 'global'}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes_mesa',
          filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined
  }, (payload: any) => {
          if (payload.new.estado === 'pagada' && payload.old.estado === 'activa') {
            console.log('🍽️ Orden de mesa pagada:', payload.new);
            
            // Remover de órdenes pendientes
            setOrdenesMesas(prev => prev.filter(orden => orden.id !== payload.new.id));
            
            // Actualizar monto por cobrar
            setMetricas(prev => ({
              ...prev,
              porCobrar: prev.porCobrar - payload.new.monto_total
            }));
          }
        });
      const subOrdenes = typeof chOrdenes?.subscribe === 'function' ? chOrdenes.subscribe() : null;
      unsubscribes.push(() => {
        if (subOrdenes && typeof subOrdenes.unsubscribe === 'function') subOrdenes.unsubscribe();
        else if (chOrdenes && typeof chOrdenes.unsubscribe === 'function') chOrdenes.unsubscribe();
      });

      // Cleanup function
      return () => {
        console.log('🔌 Desconectando WebSockets');
        unsubscribes.forEach(u => {
          try { u(); } catch { /* noop */ }
        });
      };
    } else {
      console.log('⏸️ Caja cerrada: sin WebSockets activos');
    }
  }, [estadoCaja, sesionId, restaurantId, periodo]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  

  // ===============================
  // FUNCIÓN CRÍTICA: PROCESAR PAGOS CON MÁXIMO RETRY
  // ===============================
const procesarPago = async (
  orden: OrdenPendiente,
  metodoPago: MetodoPago,
  montoRecibido?: number
) => {
  try {
    if (requiereSaneamiento) {
      throw new Error('Operación bloqueada: hay una sesión previa pendiente de cierre.');
    }

    // Validar permisos (si roles están disponibles)
    try {
      const roles = await getActiveRoles();
      if (Array.isArray(roles) && roles.length > 0) {
        const allowed = roles.some((r: any) => ['cajero','admin','administrador','propietario'].includes(String(r).toLowerCase()));
        if (!allowed) {
          throw new Error('No tienes permisos para procesar pagos');
        }
      }
    } catch { /* continuar si no hay contexto de roles (tests/offline) */ }

    // Validación de montos: efectivo requiere monto recibido suficiente
    if (metodoPago === 'efectivo') {
      const total = Number(orden?.monto_total ?? 0);
      const recibido = typeof montoRecibido === 'number' ? Number(montoRecibido) : total;
      if (recibido < total) {
        throw new Error('Monto recibido insuficiente');
      }
    }

    setLoading(true);
    const profile = await getUserProfile();
    if (!profile) throw new Error('Usuario no autenticado');

    // Resolver id de sesión de forma robusta para evitar falsos negativos por desincronización
    let cajaSesionId = sesionActual?.id as string | undefined;
    if (!cajaSesionId && estadoCaja === 'abierta' && profile.restaurant_id) {
      try {
        const { data: abierta } = await supabase
          .from('caja_sesiones')
          .select('id, estado')
          .eq('restaurant_id', profile.restaurant_id)
          .eq('estado', 'abierta')
          .order('abierta_at', { ascending: false })
          .maybeSingle();
        if (abierta?.id) {
          cajaSesionId = abierta.id as any;
          // Nota: no actualizamos estado global aquí para no interferir con el hook fuente; usamos el id resuelto localmente.
        }
      } catch {/* ignore lookup errors */}
    }
    if (!cajaSesionId) {
      throw new Error('No hay sesión de caja abierta');
    }

    console.log('💳 Procesando pago atómico con retry automático:', { 
      orden: orden.identificador, 
      metodo: metodoPago, 
      monto: orden.monto_total 
    });

    const data = await executeWithRetry(
      async () => {
        const { data, error } = await supabase.rpc('procesar_pago_atomico', {
          p_caja_sesion_id: cajaSesionId,
          p_orden_id: orden.id,
          p_tipo_orden: orden.tipo,
          p_metodo_pago: metodoPago,
          p_monto_total: orden.monto_total,
          p_monto_recibido: montoRecibido || orden.monto_total,
          p_cajero_id: profile.id
        });

        if (error) {
          console.error('💥 Error en RPC procesar_pago_atomico:', error);
          throw error;
        }

        return data;
      },
      ERROR_CONFIGS.NETWORK
    );

    // Validar respuesta
    if (!data || !data.success) {
      console.error('💥 Error en procesamiento:', data);
      
      if (data?.error_code === 'VALIDACION_SEGURIDAD_FALLIDA') {
        const securityDetails = data.security_details;
        const blocks = securityDetails?.blocks || [];
        throw new Error(`Transacción bloqueada: ${blocks.join(', ')}`);
      }
      
      if (data?.error_code === 'REQUIERE_AUTORIZACION') {
        const securityDetails = data.security_details;
        const warnings = securityDetails?.warnings || [];
        throw new Error(`Autorización requerida: ${warnings.join(', ')}`);
      }
      
      throw new Error(data?.mensaje || 'Error desconocido procesando pago');
    }

    console.log('✅ Pago procesado exitosamente:', data);

    if (data.security_info?.warnings?.length > 0) {
      console.warn('⚠️ Advertencias de seguridad:', data.security_info.warnings);
    }

    // Return exitoso
    return {
      success: true,
      transaccion: { id: data.transaccion_id },
      cambio: data.cambio,
      securityInfo: data.security_info
    };

  } catch (error: any) {
    // Return con error
    console.error('❌ Error procesando pago:', error);
    const msg = String(error?.message || 'Error desconocido');
    const lower = msg.toLowerCase();
    // Guía accionable si el esquema no tiene columnas requeridas
    if (lower.includes('column "orden_id"') && lower.includes('does not exist')) {
      return {
        success: false,
        error: 'Esquema desalineado: falta la columna orden_id en transacciones_caja. Ejecuta el script scripts/fix/add_orden_id_to_transacciones_caja.sql en Supabase y vuelve a intentar.'
      };
    }
    return {
      success: false,
      error: msg
    };
  } finally {
    setLoading(false);
  }
};

  // ===============================
  // UTILIDADES
  // ===============================
  const calcularCambio = (montoTotal: number, montoRecibido: number): number => {
    return Math.max(0, montoRecibido - montoTotal);
  };

  const totalOrdenesPendientes = ordenesMesas.length + ordenesDelivery.length;

  // ===============================
  // REGISTRAR VENTA DIRECTA (SIN ORDEN)
  // ===============================
  const registrarVentaDirecta = async (venta: { total: number; metodoPago: MetodoPago; montoRecibido?: number }) => {
    // Guard de permisos: si roles disponibles, exigir cajero/admin/propietario
    try {
      const { getActiveRoles } = await import('@spoon/shared/lib/supabase');
      const roles = await getActiveRoles();
      if (Array.isArray(roles) && roles.length > 0) {
        const allowed = roles.some((r: any) => ['cajero','admin','administrador','propietario'].includes(String(r).toLowerCase()));
        if (!allowed) {
          setError('No tienes permisos para registrar ventas');
          return { success: false, error: 'No tienes permisos para registrar ventas' } as const;
        }
      }
    } catch { /* ignore si utilidades no disponibles en ciertos tests */ }
    try {
      if (requiereSaneamiento) {
        return { success: false, error: 'Sesión previa detectada. Debes cerrar la sesión anterior antes de registrar ventas.' };
      }
      if (!sesionActual?.id) {
        return { success: false, error: 'No hay sesión de caja abierta' };
      }

      // Validación de monto para efectivo
      if (venta.metodoPago === 'efectivo') {
        const total = Number(venta.total ?? 0);
        const recibido = typeof venta.montoRecibido === 'number' ? Number(venta.montoRecibido) : total;
        if (recibido < total) {
          return { success: false, error: 'Monto recibido insuficiente' } as const;
        }
      }

      setLoading(true);
      const profile = await getUserProfile();
      if (!profile?.id) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const montoRecibido = venta.metodoPago === 'efectivo'
        ? (venta.montoRecibido ?? venta.total)
        : venta.total;
      const cambio = venta.metodoPago === 'efectivo' ? Math.max(0, montoRecibido - venta.total) : 0;

      // Inserción directa de transacción tipo 'directa' (centralizada en el hook)
      const { error: errIns } = await supabase
        .from('transacciones_caja')
        .insert({
          caja_sesion_id: sesionActual.id,
          orden_id: null,
          tipo_orden: 'directa',
          metodo_pago: venta.metodoPago,
          monto_total: venta.total,
          monto_recibido: montoRecibido,
          monto_cambio: cambio,
          cajero_id: (profile as any).id,
          procesada_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (errIns) {
        return { success: false, error: (errIns as any).message || 'Error registrando la transacción' };
      }

      return { success: true, cambio };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error inesperado' };
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // INFORMACIÓN DE DEBUG
  // ===============================
  const getDebugInfo = () => {
    const breakerStatus = getCircuitBreakerStatus();
    return {
      circuitBreakerState: breakerStatus,
      webSocketsActive: estadoCaja === 'abierta' && sesionActual,
      ordenesPendientes: totalOrdenesPendientes,
      lastError: error,
      sesionActual: sesionActual ? {
        id: sesionActual.id,
        estado: estadoCaja,
        montoInicial: sesionActual.monto_inicial
      } : null
    };
  };

  // ===============================
  // RETURN DEL HOOK
  // ===============================
  return {
    // Estados principales
    ordenesMesas,
    ordenesDelivery,
    loading,
    error,
    sesionActual,
    estadoCaja,
    
    // Métricas en tiempo real
    metricas,
    
    // Métricas legacy (compatibilidad)
    totalOrdenesPendientes,
    montoTotalPendiente: metricas.porCobrar,
    
    // Acciones principales
    obtenerOrdenesPendientes: obtenerDatosCaja,
    procesarPago,
    calcularCambio,
  registrarVentaDirecta,
    
    // Utilidades
  refrescar: obtenerDatosCaja,
  // filtros de fecha/periodo
  setFechaFiltro,
  fechaFiltro,
  periodo,
  setPeriodo,
  fechaFinFiltro,
  setFechaFinFiltro,
    
    // Debug y monitoreo
    getDebugInfo
  };
};
