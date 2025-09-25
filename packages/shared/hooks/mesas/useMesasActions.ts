/**
 * Hook especializado para acciones de mesas
 * Responsabilidad: Solo operaciones de escritura (crear, actualizar, eliminar)
 */

import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface CrearOrdenPayload {
  numeroMesa: number;
  mesero: string;
  items: {
    tipo: 'menu_dia' | 'especial';
    cantidad: number;
    precioUnitario: number;
    combinacionId?: string;
    combinacionEspecialId?: string;
  }[];
}

export const useMesasActions = (
  restaurantId: string | null,
  onMesasChanged?: () => void
) => {
  // Crear orden en mesa
  const crearOrden = useCallback(async (payload: CrearOrdenPayload) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      // Calcular total
      const total = payload.items.reduce(
        (sum, item) => sum + (item.precioUnitario * item.cantidad),
        0
      );

      // Crear orden
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes_mesa')
        .insert({
          restaurant_id: restaurantId,
          numero_mesa: payload.numeroMesa,
          mesero: payload.mesero,
          total,
          items: payload.items,
          estado: 'activa'
        })
        .select()
        .single();

      if (ordenError) throw ordenError;

      // Actualizar estado de mesa
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({ estado: 'ocupada' })
        .eq('restaurant_id', restaurantId)
        .eq('numero', payload.numeroMesa);

      if (mesaError) throw mesaError;

      // Notificar cambio
      onMesasChanged?.();

      return { success: true, data: orden };
    } catch (error: any) {
      console.error('Error creando orden:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  // Cobrar mesa
  const cobrarMesa = useCallback(async (numeroMesa: number) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      // Obtener orden activa
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes_mesa')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('numero_mesa', numeroMesa)
        .eq('estado', 'activa')
        .single();

      if (ordenError) throw ordenError;

      // Marcar orden como pagada
      const { error: updateError } = await supabase
        .from('ordenes_mesa')
        .update({
          estado: 'pagada',
          pagada_at: new Date().toISOString()
        })
        .eq('id', orden.id);

      if (updateError) throw updateError;

      // Liberar mesa
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({ estado: 'libre' })
        .eq('restaurant_id', restaurantId)
        .eq('numero', numeroMesa);

      if (mesaError) throw mesaError;

      // Notificar cambio
      onMesasChanged?.();

      return { success: true, data: orden };
    } catch (error: any) {
      console.error('Error cobrando mesa:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  // Reservar mesa
  const reservarMesa = useCallback(async (numeroMesa: number, cliente: string, comensales: number) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      const { error } = await supabase
        .from('mesas')
        .update({
          estado: 'reservada',
          reservada_para: cliente,
          comensales_reserva: comensales
        })
        .eq('restaurant_id', restaurantId)
        .eq('numero', numeroMesa);

      if (error) throw error;

      onMesasChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error reservando mesa:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  // Activar mesa (poner en servicio)
  const activarMesa = useCallback(async (numeroMesa: number) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      const { error } = await supabase
        .from('mesas')
        .update({ estado: 'libre' })
        .eq('restaurant_id', restaurantId)
        .eq('numero', numeroMesa);

      if (error) throw error;

      onMesasChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error activando mesa:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  // Inactivar mesa (fuera de servicio)
  const inactivarMesa = useCallback(async (numeroMesa: number) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      const { error } = await supabase
        .from('mesas')
        .update({ estado: 'inactiva' })
        .eq('restaurant_id', restaurantId)
        .eq('numero', numeroMesa);

      if (error) throw error;

      onMesasChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error inactivando mesa:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  // Eliminar orden activa
  const eliminarOrden = useCallback(async (ordenId: string) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      // Obtener orden para saber qué mesa liberar
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes_mesa')
        .select('numero_mesa')
        .eq('id', ordenId)
        .single();

      if (ordenError) throw ordenError;

      // Eliminar orden
      const { error: deleteError } = await supabase
        .from('ordenes_mesa')
        .delete()
        .eq('id', ordenId);

      if (deleteError) throw deleteError;

      // Liberar mesa
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({ estado: 'libre' })
        .eq('restaurant_id', restaurantId)
        .eq('numero', orden.numero_mesa);

      if (mesaError) throw mesaError;

      onMesasChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando orden:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onMesasChanged]);

  return {
    crearOrden,
    cobrarMesa,
    reservarMesa,
    activarMesa,
    inactivarMesa,
    eliminarOrden
  };
};
