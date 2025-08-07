'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getUserRestaurant } from '@spoon/shared';
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
  const [estado, setEstado] = useState<EstadoPedidos>({
    pedidos: [],
    loading: true,
    error: null,
    filtros: { estado: 'todos', domiciliario: 'todos', fecha: 'hoy' },
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

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const prefix = type === 'success' ? '✅' : '❌';
    console[type === 'success' ? 'log' : 'error'](`${prefix} ${message}`);
    // Reemplaza esto por una notificación visual si usas alguna librería
    // toast.success(message) o toast.error(message)
  }, []);

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

  const cargarPedidos = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoadingStates(prev => ({ ...prev, cargando_datos: true }));

      const { data: pedidos, error } = await supabase
        .from('delivery_orders')
        .select(`
          *,
          assigned_delivery_person:delivery_personnel(*)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

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
  }, [restaurantId]);

  const crearPedido = useCallback(async (nuevoPedido: NuevoPedido) => {
    if (!restaurantId) return;

    try {
      setLoadingStates(prev => ({ ...prev, creando_pedido: true }));

      if (!nuevoPedido.order_items.length) {
        throw new Error('El pedido debe tener al menos un producto.');
      }

      const { data: menuHoy } = await supabase
        .from('daily_menus')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('menu_date', new Date().toISOString().split('T')[0])
        .single();

      if (!menuHoy || !menuHoy.id) {
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
      showNotification(MESSAGES.PEDIDO_CREADO);

    } catch (error) {
      console.error('Error creando pedido:', error);
      showNotification(MESSAGES.ERROR_CREAR_PEDIDO, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, creando_pedido: false }));
    }
  }, [restaurantId, cargarPedidos, showNotification]);

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
      showNotification(MESSAGES.PEDIDO_ACTUALIZADO);

    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotification(MESSAGES.ERROR_ACTUALIZAR_ESTADO, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, actualizando_estado: false }));
    }
  }, [cargarPedidos, showNotification]);

  const registrarPago = useCallback(async (data: RegistrarPago) => {
    try {
      setLoadingStates(prev => ({ ...prev, registrando_pago: true }));

      const { error: pedidoError } = await supabase
        .from('delivery_orders')
        .update({
          status: ESTADOS_PEDIDO.PAGADO,
          paid_at: new Date().toISOString()
        })
        .eq('id', data.pedido_id);

      if (pedidoError) throw pedidoError;

      const { error: domiciliarioError } = await supabase
        .from('delivery_personnel')
        .update({ status: 'available' })
        .eq('id', data.domiciliario_id);

      if (domiciliarioError) throw domiciliarioError;

      await cargarPedidos();
      showNotification(MESSAGES.PAGO_REGISTRADO);

    } catch (error) {
      console.error('Error registrando pago:', error);
      showNotification('Error al registrar el pago', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, registrando_pago: false }));
    }
  }, [cargarPedidos, showNotification]);

  useEffect(() => {
    if (restaurantId) {
      cargarPedidos();
    }
  }, [restaurantId, cargarPedidos]);

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
    showNotification
  };
};

