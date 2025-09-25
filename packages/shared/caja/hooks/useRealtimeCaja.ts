import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { TransaccionCaja, GastoCaja } from '../types/cajaTypes';

interface RealtimeCajaData {
  balance: number;
  ventasTotales: number;
  porCobrar: number;
  gastosTotales: number;
  transaccionesDelDia: TransaccionCaja[];
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
  ultimaActualizacion: Date;
}

export const useRealtimeCaja = (restaurantId: string) => {
  const [datosCaja, setDatosCaja] = useState<RealtimeCajaData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // ✅ FUNCIÓN PARA RECALCULAR DATOS DE CAJA
  const recalcularDatosCaja = useCallback(async (): Promise<RealtimeCajaData> => {
    try {
      // Obtener sesión de caja activa
      const { data: sesionActiva } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('estado', 'abierta')
        .maybeSingle();

      if (!sesionActiva) {
        return {
          balance: 0,
          ventasTotales: 0,
          porCobrar: 0,
          gastosTotales: 0,
          transaccionesDelDia: [],
          totalEfectivo: 0,
          totalTarjeta: 0,
          totalDigital: 0,
          ultimaActualizacion: new Date()
        };
      }

      // Obtener transacciones del día
      const { data: transacciones } = await supabase
        .from('transacciones_caja')
        .select('*')
        .eq('caja_sesion_id', sesionActiva.id)
        .order('procesada_at', { ascending: false });

      // Obtener gastos del día
      const { data: gastos } = await supabase
        .from('gastos_caja')
        .select('*')
        .eq('caja_sesion_id', sesionActiva.id)
        .order('registrado_at', { ascending: false });

      // Calcular métricas
      const transaccionesData = transacciones || [];
      const gastosData = gastos || [];

      const ventasTotales = transaccionesData.reduce((sum, t) => sum + (t.monto_total || 0), 0);
      const gastosTotales = gastosData.reduce((sum, g) => sum + (g.monto || 0), 0);
      const balance = sesionActiva.monto_inicial + ventasTotales - gastosTotales;

      // Calcular por método de pago
      const totalEfectivo = transaccionesData
        .filter(t => t.metodo_pago === 'efectivo')
        .reduce((sum, t) => sum + (t.monto_total || 0), 0);

      const totalTarjeta = transaccionesData
        .filter(t => t.metodo_pago === 'tarjeta')
        .reduce((sum, t) => sum + (t.monto_total || 0), 0);

      const totalDigital = transaccionesData
        .filter(t => t.metodo_pago === 'digital')
        .reduce((sum, t) => sum + (t.monto_total || 0), 0);

      // Órdenes pendientes de cobro
      const { data: ordenesMesas } = await supabase
        .from('ordenes_mesa')
        .select('monto_total')
        .eq('restaurant_id', restaurantId)
        .eq('estado', 'activa');

      const { data: ordenesDelivery } = await supabase
        .from('delivery_orders')
        .select('total_amount')
        .eq('restaurant_id', restaurantId)
        .in('status', ['received', 'preparing', 'ready']);

      const porCobrarMesas = ordenesMesas?.reduce((sum, o) => sum + (o.monto_total || 0), 0) || 0;
      const porCobrarDelivery = ordenesDelivery?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const porCobrar = porCobrarMesas + porCobrarDelivery;

      return {
        balance,
        ventasTotales,
        porCobrar,
        gastosTotales,
        transaccionesDelDia: transaccionesData,
        totalEfectivo,
        totalTarjeta,
        totalDigital,
        ultimaActualizacion: new Date()
      };

    } catch (error) {
      console.error('Error recalculando datos de caja:', error);
      throw error;
    }
  }, [restaurantId]);

  // ✅ EFECTO PARA CONFIGURAR SUSCRIPCIONES REALTIME
  useEffect(() => {
    if (!restaurantId) return;

    setConnectionStatus('connecting');

    // 📡 SUSCRIPCIÓN A TRANSACCIONES
    const transaccionesChannel = supabase
      .channel(`caja-transacciones-${restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transacciones_caja',
        filter: `restaurant_id=eq.${restaurantId}`
      }, async (payload) => {
        console.log('🔔 Cambio en transacciones:', payload.eventType, (payload.new as any)?.id);
        try {
          const nuevosDatos = await recalcularDatosCaja();
          setDatosCaja(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando datos tras cambio en transacciones:', error);
        }
      })
      .subscribe((status) => {
        console.log('📡 Estado suscripción transacciones:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      });

    // 📡 SUSCRIPCIÓN A GASTOS
    const gastosChannel = supabase
      .channel(`caja-gastos-${restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gastos_caja',
        filter: `restaurant_id=eq.${restaurantId}`
      }, async (payload) => {
        console.log('🔔 Cambio en gastos:', payload.eventType, (payload.new as any)?.id);
        try {
          const nuevosDatos = await recalcularDatosCaja();
          setDatosCaja(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando datos tras cambio en gastos:', error);
        }
      })
      .subscribe((status) => {
        console.log('📡 Estado suscripción gastos:', status);
      });

    // 📡 SUSCRIPCIÓN A ÓRDENES (PARA ACTUALIZAR "POR COBRAR")
    const ordenesChannel = supabase
      .channel(`caja-ordenes-${restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ordenes_mesa',
        filter: `restaurant_id=eq.${restaurantId}`
      }, async (payload) => {
        console.log('🔔 Cambio en órdenes de mesa:', payload.eventType);
        try {
          const nuevosDatos = await recalcularDatosCaja();
          setDatosCaja(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando datos tras cambio en órdenes:', error);
        }
      })
      .subscribe();

    const deliveryChannel = supabase
      .channel(`caja-delivery-${restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'delivery_orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, async (payload) => {
        console.log('🔔 Cambio en órdenes de delivery:', payload.eventType);
        try {
          const nuevosDatos = await recalcularDatosCaja();
          setDatosCaja(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando datos tras cambio en delivery:', error);
        }
      })
      .subscribe();

    // 🧹 LIMPIEZA AL DESMONTAR
    return () => {
      console.log('🧹 Limpiando suscripciones realtime de caja');
      transaccionesChannel.unsubscribe();
      gastosChannel.unsubscribe();
      ordenesChannel.unsubscribe();
      deliveryChannel.unsubscribe();
    };
  }, [restaurantId, recalcularDatosCaja]);

  // ✅ EFECTO PARA CARGA INICIAL
  useEffect(() => {
    if (restaurantId) {
      recalcularDatosCaja().then(setDatosCaja).catch(console.error);
    }
  }, [restaurantId, recalcularDatosCaja]);

  return {
    datosCaja,
    isConnected,
    connectionStatus,
    recalcularDatosCaja
  };
};
