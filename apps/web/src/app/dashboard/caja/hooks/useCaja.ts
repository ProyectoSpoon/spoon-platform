import { useState, useEffect, useCallback, useRef } from 'react';
import { OrdenPendiente, TransaccionCaja, MetodoPago } from '../../caja/types/cajaTypes';
import { 
  supabase, 
  getUserProfile, 
  getTransaccionesDelDia,
  getGastosDelDia,
  getTransaccionesYGastosEnRango
} from '@spoon/shared/lib/supabase';
import { CAJA_CONFIG, CAJA_MESSAGES } from '../../caja/constants/cajaConstants';
import { useCajaSesion } from './useCajaSesion';
import { 
  executeWithRetry, 
  ERROR_CONFIGS,
  getCircuitBreakerStatus 
} from '@spoon/shared/lib/errorHandling';

interface MetricasCaja {
  balance: number;
  ventasTotales: number;
  porCobrar: number;
  gastosTotales: number;
  transaccionesDelDia: TransaccionCaja[];
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
}

export const useCaja = () => {
  const { sesionActual, estadoCaja } = useCajaSesion();
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

  // ===============================
  // FUNCIÓN ROBUSTA PARA OBTENER DATOS
  // ===============================
  const sesionId = sesionActual?.id;
  const sesionMontoInicial = sesionActual?.monto_inicial ?? 0;

  const obtenerDatosCaja = useCallback(async () => {
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

      console.log('📊 Obteniendo datos de caja con retry automático...');

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
            return executeWithRetry(
              () => getTransaccionesDelDia(profile.restaurant_id!, fechaFiltro),
              ERROR_CONFIGS.DATABASE
            );
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

        // placeholder para gastos cuando periodo === 'hoy'; cuando no es hoy, lo trae el paquete rango
        Promise.resolve(null)
      ]);

      // TRANSFORMAR Y COMBINAR DATOS
      const mesasTransformadas: OrdenPendiente[] = mesasData.map((mesa: any) => ({
        id: mesa.id,
        tipo: 'mesa',
        identificador: `Mesa ${mesa.numero_mesa}`,
        monto_total: mesa.monto_total,
        fecha_creacion: mesa.fecha_creacion,
        detalles: mesa.nombre_mesero ? `Mesero: ${mesa.nombre_mesero}` : undefined
      }));

      const deliveryTransformadas: OrdenPendiente[] = deliveryData.map((orden: any) => ({
        id: orden.id,
        tipo: 'delivery',
        identificador: orden.customer_name,
        monto_total: orden.total_amount,
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
            totalGastos: (gastosData as any)?.totalGastos ?? 0
          }
        : {
            totalVentas: (transaccionesData as any).totalVentas,
            totalEfectivo: (transaccionesData as any).totalEfectivo,
            totalTarjeta: (transaccionesData as any).totalTarjeta,
            totalDigital: (transaccionesData as any).totalDigital,
            transacciones: (transaccionesData as any).transacciones,
            totalGastos: (transaccionesData as any).totalGastos
          };

      const balance = sesionId 
        ? sesionMontoInicial + totales.totalVentas - totales.totalGastos
        : 0;

      // ACTUALIZAR ESTADO
      setOrdenesMesas(mesasTransformadas);
      setOrdenesDelivery(deliveryTransformadas);
      setMetricas({
        balance,
        ventasTotales: totales.totalVentas,
        porCobrar: porCobrarTotal,
        gastosTotales: totales.totalGastos,
        transaccionesDelDia: totales.transacciones,
        totalEfectivo: totales.totalEfectivo,
        totalTarjeta: totales.totalTarjeta,
        totalDigital: totales.totalDigital
      });

      setError(null);
      console.log('✅ Datos de caja obtenidos exitosamente');

    } catch (err: any) {
      console.error('⚠️ Error obteniendo datos de caja:', err);
      setError(err.message);
      
      // Para datos no críticos, mostrar estado del circuit breaker
      const breakerStatus = getCircuitBreakerStatus();
      console.log('🔧 Estado Circuit Breaker:', breakerStatus);
    } finally {
      setLoading(false);
    }
  }, [sesionId, sesionMontoInicial, fechaFiltro, periodo, fechaFinFiltro]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Mantener una referencia estable a la función para evitar re-suscripciones
  const obtenerDatosCajaRef = useRef(obtenerDatosCaja);
  useEffect(() => {
    obtenerDatosCajaRef.current = obtenerDatosCaja;
  }, [obtenerDatosCaja]);

  

  // ===============================
  // WEBSOCKETS EN TIEMPO REAL (REEMPLAZA AUTO-REFRESH)
  // ===============================
  const restaurantId = (sesionActual as any)?.restaurant_id as string | undefined;

  useEffect(() => {
    if (estadoCaja === 'abierta' && sesionId) {
      console.log('🔄 Configurando WebSockets para caja abierta');
      
      // Obtener datos iniciales UNA VEZ
      obtenerDatosCajaRef.current();

      // WEBSOCKET 1: Escuchar nuevas transacciones
      const subscriptionTransacciones = supabase
        .channel(`transacciones-${sesionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transacciones_caja',
          filter: `caja_sesion_id=eq.${sesionId}`
        }, (payload) => {
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
            balance: prev.balance + nuevaTransaccion.monto_total // Actualizar balance también
          }));
        })
        .subscribe();

      // WEBSOCKET 2: Escuchar nuevos gastos
      const subscriptionGastos = supabase
        .channel(`gastos-${sesionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'gastos_caja',
          filter: `caja_sesion_id=eq.${sesionId}`
        }, (payload) => {
          console.log('💸 Nuevo gasto detectado:', payload.new);
          
          const nuevoGasto = payload.new as any;
          
          // Update incremental
          setMetricas(prev => ({
            ...prev, // Mantener todas las propiedades
            gastosTotales: prev.gastosTotales + nuevoGasto.monto,
            balance: prev.balance - nuevoGasto.monto // Restar del balance
          }));
        })
        .subscribe();

      // WEBSOCKET 3: Escuchar cambios en órdenes (cuando se pagan)
      const subscriptionOrdenes = supabase
        .channel(`ordenes-caja-${restaurantId || 'global'}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes_mesa',
          filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined
        }, (payload) => {
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
  })
        .subscribe();

      // Cleanup function
    return () => {
        console.log('🔌 Desconectando WebSockets');
        subscriptionTransacciones.unsubscribe();
        subscriptionGastos.unsubscribe();
        subscriptionOrdenes.unsubscribe();
      };
    } else {
      console.log('⏸️ Caja cerrada: sin WebSockets activos');
    }
  }, [estadoCaja, sesionId, restaurantId]);
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
    if (!sesionActual) {
      throw new Error('No hay sesión de caja abierta');
    }

    setLoading(true);
    const profile = await getUserProfile();
    if (!profile) throw new Error('Usuario no autenticado');

    console.log('💳 Procesando pago atómico con retry automático:', { 
      orden: orden.identificador, 
      metodo: metodoPago, 
      monto: orden.monto_total 
    });

    const data = await executeWithRetry(
      async () => {
        const { data, error } = await supabase.rpc('procesar_pago_atomico', {
          p_caja_sesion_id: sesionActual.id,
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
    return {
      success: false,
      error: error.message
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