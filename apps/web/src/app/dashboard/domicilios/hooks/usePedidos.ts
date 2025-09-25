'use client';

import { useState, useEffect, useCallback } from 'react';
// Import directly from the shared supabase module to avoid barrel resolution issues
import { supabase, getUserRestaurant } from '@spoon/shared/lib/supabase';
import { useNotifications } from '@spoon/shared/Context/notification-context';
import {
  PedidoDomicilio,
  NuevoPedido,
  ActualizarEstadoPedido,
  RegistrarPago,
  EstadisticasDomicilios,
  FiltrosPedidos,
  LoadingStates,
  EstadoPedidos
} from '../types/domiciliosTypes';
import { ESTADOS_PEDIDO, DEFAULT_DELIVERY_FEE, MESSAGES } from '../constants/domiciliosConstants';

export const usePedidos = () => {
  const DEBUG = process.env.NODE_ENV !== 'production';
  const [estado, setEstado] = useState<EstadoPedidos>({
    pedidos: [],
    loading: true,
    error: null,
  filtros: { estado: 'todos', domiciliario: 'todos', fecha: 'hoy' }, // fecha: hoy|ayer|semana|mes|custom
    estadisticas: null
  });

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    creando_pedido: false,
    actualizando_estado: false,
    asignando_domiciliario: false,
    registrando_pago: false,
    cargando_datos: false
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(150); // limite inicial para historial / vista
  const [hasOpenCajaSession, setHasOpenCajaSession] = useState(false);

  // ✅ NOTIFICACIONES CENTRALIZADAS
  const { addNotification } = useNotifications();

  // Utilidad para refrescar el estado de "caja abierta" (usada en efectos y subscripciones)
  const refreshCajaSessionOpen = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const { data: sesionCheck } = await supabase
        .from('caja_sesiones')
        .select('id')
        .eq('restaurant_id', restaurantId as string)
        .eq('estado', 'abierta')
        .order('abierta_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setHasOpenCajaSession(!!sesionCheck);
    } catch (e) {
      // En caso de error o RLS, marcar como cerrada para mostrar CTA de abrir
      setHasOpenCajaSession(false);
    }
  }, [restaurantId]);

  // Cargar ID del restaurante
  useEffect(() => {
    let isMounted = true;
    const loadRestaurant = async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (restaurant && isMounted) {
          setRestaurantId(restaurant.id);
        }
      } catch (error) {
        console.error('Error cargando restaurante:', error);
      }
    };
    loadRestaurant();
    return () => {
      isMounted = false;
    };
  }, []);

  // Chequeo inicial de sesión de caja abierta cuando tengamos restaurantId
  useEffect(() => {
    if (!restaurantId) return;
    refreshCajaSessionOpen();
  }, [restaurantId, refreshCajaSessionOpen]);

  // Suscripción en tiempo real a cambios en caja_sesiones para este restaurante
  useEffect(() => {
    if (!restaurantId) return;
    // Evitar crear la subscripción en SSR
    const channel = supabase
      .channel(`caja_sesiones_${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'caja_sesiones', filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          // Revalidar estado cuando haya cambios (apertura/cierre)
          refreshCajaSessionOpen();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        /* no-op */
      }
    };
  }, [restaurantId, refreshCajaSessionOpen]);

  // Utilidad para rango de fechas según filtro rápido
  const obtenerRangoFechas = useCallback((filtroFecha: string) => {
    const hoy = new Date();
    const inicio = new Date();
    const fin = new Date();
    switch (filtroFecha) {
      case 'ayer':
        inicio.setDate(hoy.getDate() - 1);
        fin.setDate(hoy.getDate() - 1);
        break;
      case 'semana':
        inicio.setDate(hoy.getDate() - 6); // últimos 7 días incluyendo hoy
        break;
      case 'mes':
        inicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'hoy':
      default:
        // inicio = hoy
        break;
    }
    // Normalizar a inicio y fin de día
    inicio.setHours(0,0,0,0);
    fin.setHours(23,59,59,999);
    return { desde: inicio.toISOString(), hasta: fin.toISOString() };
  }, []);

  const cargarPedidos = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoadingStates(prev => ({ ...prev, cargando_datos: true }));

      const filtros = estado.filtros;
      const { desde, hasta } = obtenerRangoFechas(filtros.fecha || 'hoy');

  let query = supabase
        .from('delivery_orders')
        .select(`
          * ,
          assigned_delivery_person:delivery_personnel(*)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', desde)
        .lte('created_at', hasta)
        .order('created_at', { ascending: false });

      if (filtros.estado && filtros.estado !== 'todos') {
        query = query.eq('status', filtros.estado);
      }
      if (filtros.domiciliario && filtros.domiciliario !== 'todos') {
        query = query.eq('assigned_delivery_person_id', filtros.domiciliario);
      }
      if ((filtros as any).buscar) {
        const term = (filtros as any).buscar;
        query = query.or(`customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`);
      }

  const { data: pedidos, error } = await query.limit(limit);

      if (error) throw error;

      setEstado(prev => ({
        ...prev,
        pedidos: pedidos || [],
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setEstado(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los pedidos'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, cargando_datos: false }));
    }
  }, [restaurantId, estado.filtros, obtenerRangoFechas, limit]);

  const crearPedido = useCallback(async (nuevoPedido: NuevoPedido): Promise<boolean> => {
    if (!restaurantId) return false;

    try {
      setLoadingStates(prev => ({ ...prev, creando_pedido: true }));

      if (!nuevoPedido.order_items.length) {
        throw new Error('El pedido debe tener al menos un producto.');
      }

      const { data: menuHoy, error: menuHoyError } = await supabase
        .from('daily_menus')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('menu_date', require('@spoon/shared/utils/datetime').getBogotaDateISO())
        .eq('status', 'active')
        .maybeSingle(); // evita 406 si aún no existe menú

      if (menuHoyError) throw menuHoyError;
      if (!menuHoy?.id) {
        throw new Error('No hay menú configurado para hoy.');
      }

      const total = nuevoPedido.order_items.reduce((sum, item) => {
        const extrasTotal = item.extras.reduce((extSum, extra) => extSum + extra.precio, 0);
        return sum + ((item.unit_price + extrasTotal) * item.quantity);
      }, 0);

      const { error } = await supabase
        .from('delivery_orders')
        .insert({
          restaurant_id: restaurantId,
          daily_menu_id: menuHoy.id,
          customer_name: nuevoPedido.customer_name,
          customer_phone: nuevoPedido.customer_phone,
          delivery_address: nuevoPedido.delivery_address,
          order_items: nuevoPedido.order_items.map(item => ({
            ...item,
            subtotal: (item.unit_price + item.extras.reduce((sum, e) => sum + e.precio, 0)) * item.quantity
          })),
          total_amount: total,
          delivery_fee: DEFAULT_DELIVERY_FEE,
          special_notes: nuevoPedido.special_notes || null,
          status: ESTADOS_PEDIDO.RECIBIDO
        })
        .select()
        .single();

      if (error) throw error;

  await cargarPedidos();
  addNotification({
    type: 'success',
    title: 'Pedido creado',
    message: MESSAGES.PEDIDO_CREADO
  });
  return true;

    } catch (error) {
      console.error('Error creando pedido:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: MESSAGES.ERROR_CREAR_PEDIDO
      });
  return false;
    } finally {
      setLoadingStates(prev => ({ ...prev, creando_pedido: false }));
    }
  }, [restaurantId, cargarPedidos, addNotification]);

  const actualizarEstado = useCallback(async (data: ActualizarEstadoPedido) => {
    try {
      setLoadingStates(prev => ({ ...prev, actualizando_estado: true }));

      const updates: Partial<PedidoDomicilio> = {
        status: data.nuevo_estado
      };

      if (data.nuevo_estado === ESTADOS_PEDIDO.ENVIADO) {
        updates.sent_at = new Date().toISOString();
        updates.assigned_delivery_person_id = data.domiciliario_id;
      } else if (data.nuevo_estado === ESTADOS_PEDIDO.ENTREGADO) {
        updates.delivered_at = new Date().toISOString();
      } else if (data.nuevo_estado === ESTADOS_PEDIDO.PAGADO) {
        updates.paid_at = new Date().toISOString();
      } else if (data.nuevo_estado === ESTADOS_PEDIDO.COCINANDO) {
        updates.cooking_started_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('delivery_orders')
        .update(updates)
        .eq('id', data.pedido_id);

      if (error) throw error;

      if (data.domiciliario_id && data.nuevo_estado === ESTADOS_PEDIDO.ENVIADO) {
        await supabase
          .from('delivery_personnel')
          .update({ status: 'busy' })
          .eq('id', data.domiciliario_id);
      }

      await cargarPedidos();
      addNotification({
        type: 'success',
        title: 'Estado actualizado',
        message: MESSAGES.PEDIDO_ACTUALIZADO
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: MESSAGES.ERROR_ACTUALIZAR_ESTADO
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, actualizando_estado: false }));
    }
  }, [cargarPedidos, addNotification]);

  const registrarPago = useCallback(async (data: RegistrarPago) => {
    try {
      setLoadingStates(prev => ({ ...prev, registrando_pago: true }));

      // 1. Validar auth
      const { data: authSnapshot } = await supabase.auth.getUser();
      const user = authSnapshot?.user;
      if (!user) {
        addNotification({
          type: 'error',
          title: 'Sesión expirada',
          message: 'Inicia sesión nuevamente.'
        });
        DEBUG && console.warn('[PagoDelivery][AUTH] Usuario no encontrado (authSnapshot.user es null)');
        return;
      }
      DEBUG && console.log('[PagoDelivery][AUTH] User OK', { userId: user.id });

      // 1b. Exigir sesión de caja abierta
      const { data: sesionCheck } = await supabase
        .from('caja_sesiones')
        .select('id, cajero_id')
        .eq('restaurant_id', restaurantId as string)
        .eq('estado', 'abierta')
        .order('abierta_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!sesionCheck) {
        addNotification({
          type: 'error',
          title: 'Caja cerrada',
          message: 'No hay caja abierta. Abra caja para registrar el pago.'
        });
        setHasOpenCajaSession(false);
        DEBUG && console.warn('[PagoDelivery][CAJA] No hay sesión abierta para restaurant', restaurantId);
        return;
      }
      setHasOpenCajaSession(true);
      DEBUG && console.log('[PagoDelivery][CAJA] Sesión abierta detectada', { caja_sesion_id: sesionCheck.id, cajero_id: sesionCheck.cajero_id });

      // 2. Obtener pedido local
      const pedido = estado.pedidos.find(p => p.id === data.pedido_id);
      if (!pedido) {
        addNotification({
          type: 'error',
          title: 'Pedido no encontrado',
          message: 'Pedido no encontrado en memoria. Recarga.'
        });
        DEBUG && console.error('[PagoDelivery][PEDIDO] Pedido no encontrado en estado local', { pedido_id: data.pedido_id, pedidos_en_memoria: estado.pedidos.length });
        return;
      }
      DEBUG && console.log('[PagoDelivery][PEDIDO] Pedido localizado', { pedido_id: pedido.id, status: pedido.status, total_amount: pedido.total_amount, delivery_fee: pedido.delivery_fee });

      const ahoraISO = new Date().toISOString();
      const montoTotal = pedido.total_amount + pedido.delivery_fee;
      const montoRecibido = data.tipo_pago === 'efectivo' ? (data.monto_recibido || montoTotal) : montoTotal;

  // 3. Usar la sesión verificada
  const sesionAbierta = sesionCheck;

      let transaccionOk = false;
      let rpcIntentado = false;

      if (sesionAbierta) {
        // 4. Intento RPC primero (uniformidad con módulo caja)
        rpcIntentado = true;
        DEBUG && console.log('[PagoDelivery][RPC] Llamando procesar_pago_atomico', {
          p_caja_sesion_id: sesionAbierta.id,
          p_orden_id: pedido.id,
          p_tipo_orden: 'delivery',
          p_metodo_pago: data.tipo_pago,
          p_monto_total: montoTotal,
          p_monto_recibido: montoRecibido,
          p_cajero_id: user.id
        });
        const { data: rpcData, error: rpcError } = await supabase.rpc('procesar_pago_atomico', {
          p_caja_sesion_id: sesionAbierta.id,
          p_orden_id: pedido.id,
          p_tipo_orden: 'delivery',
          p_metodo_pago: data.tipo_pago,
          p_monto_total: montoTotal,
          p_monto_recibido: montoRecibido,
          p_cajero_id: user.id
        });
        if (!rpcError && rpcData && (rpcData as any).success) {
          transaccionOk = true;
          DEBUG && console.log('[PagoDelivery][RPC] Éxito', rpcData);
        } else if (rpcError) {
          const code = (rpcError as any).code;
            console.warn('[Domicilios] RPC fallo, intentando fallback directo:', rpcError);
          DEBUG && console.warn('[PagoDelivery][RPC] Error en RPC', { code, rpcError });
          // Fallback directo sólo si policy lo permite
          const { error: insertErr } = await supabase.from('transacciones_caja').insert({
            caja_sesion_id: sesionAbierta.id,
            orden_id: pedido.id,
            tipo_orden: 'delivery',
            metodo_pago: data.tipo_pago,
            monto_total: montoTotal,
            monto_recibido: montoRecibido,
            monto_cambio: data.tipo_pago === 'efectivo' ? Math.max(0, (data.monto_recibido || montoTotal) - montoTotal) : 0,
            cajero_id: user.id, // si RLS exige coincidencia y no es cajero real, fallará igual
            // Importante: timestamp usado por dashboard de ingresos
            procesada_at: new Date().toISOString()
          });
          if (!insertErr) {
            transaccionOk = true;
            DEBUG && console.log('[PagoDelivery][FALLBACK] Insert directo OK');
          } else {
            if ((insertErr as any).code === '23505') {
              addNotification({
                type: 'error',
                title: 'Pago duplicado',
                message: 'Pago ya registrado en la sesión abierta.'
              });
              transaccionOk = true; // ya existe, consideramos ok
              DEBUG && console.warn('[PagoDelivery][FALLBACK] Duplicado detectado (23505)');
            } else {
              console.error('[Domicilios] Fallback insert fallo:', insertErr);
              DEBUG && console.error('[PagoDelivery][FALLBACK] Error insert directo', insertErr);
            }
          }
        }
      }

      // 5. Actualizar pedido a pagado (independiente del estado de caja para no bloquear flujo)
      const { error: pedidoError } = await supabase
        .from('delivery_orders')
        .update({
          status: ESTADOS_PEDIDO.PAGADO,
          paid_at: ahoraISO,
          pagada_at: ahoraISO
        })
        .eq('id', data.pedido_id);
      if (pedidoError) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Error actualizando pedido como pagado'
        });
        throw pedidoError;
      }

      // 6. Liberar domiciliario
      if (data.domiciliario_id) {
        await supabase
          .from('delivery_personnel')
          .update({ status: 'available' })
          .eq('id', data.domiciliario_id);
      }

  if (transaccionOk) {
        addNotification({
          type: 'success',
          title: 'Pago registrado',
          message: 'Pago registrado y transacción en caja'
        });
      } else if (rpcIntentado) {
        addNotification({
          type: 'error',
          title: 'Pago parcial',
          message: 'Pago marcado. No se pudo registrar en caja (revisar permisos).'
        });
        DEBUG && console.warn('[PagoDelivery][RESULT] Pedido marcado pagado pero transacción NO registrada');
      }

      await cargarPedidos();
    } catch (e) {
      console.error('Error registrando pago delivery:', e);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al registrar el pago'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, registrando_pago: false }));
    }
  }, [estado.pedidos, restaurantId, addNotification, cargarPedidos]);

  useEffect(() => {
    if (restaurantId) {
      cargarPedidos();
    }
  }, [restaurantId, cargarPedidos]);

  // Detectar sesión de caja abierta (intervalo y on-mount)
  useEffect(() => {
    let interval: any;
    const checkOpen = async () => {
      if (!restaurantId) return;
      try {
        const { data: sesion } = await supabase
          .from('caja_sesiones')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('estado', 'abierta')
          .order('abierta_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setHasOpenCajaSession(!!sesion);
      } catch (e) {
        console.warn('[Domicilios] Error verificando caja abierta:', e);
        setHasOpenCajaSession(false);
      }
    };
    checkOpen();
    interval = setInterval(checkOpen, 30000); // refresco cada 30s
    return () => interval && clearInterval(interval);
  }, [restaurantId]);

  // Nota: Ya no recargamos automáticamente al cambiar filtros para evitar queries por cada cambio.
  // La recarga se realiza explícitamente vía "Aplicar" usando cargarPedidos() desde el controlador/página.

  const updateFiltros = useCallback((patch: Partial<FiltrosPedidos>) => {
    setEstado(prev => ({
      ...prev,
      filtros: { ...prev.filtros, ...patch }
    }));
    // Reset limit al cambiar filtros para evitar traer datos excesivos viejos
    setLimit(150);
  }, []);

  const loadMore = useCallback(() => {
    setLimit(prev => prev + 150);
  }, []);

  return {
    pedidos: estado.pedidos,
    loading: estado.loading,
    error: estado.error,
    estadisticas: estado.estadisticas,
    loadingStates,
    crearPedido,
    actualizarEstado,
    registrarPago,
    cargarPedidos,
    filtros: estado.filtros,
    updateFiltros,
    loadMore,
    limit,
    hasOpenCajaSession
  };
};
