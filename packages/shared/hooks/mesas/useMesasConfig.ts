/**
 * Hook especializado para configuración de mesas
 * Responsabilidad: Solo configuración inicial y gestión de mesas
 */

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface ConfiguracionMesasPayload {
  totalMesas: number;
  distribucion?: { [zona: string]: number };
}

export const useMesasConfig = (
  restaurantId: string | null,
  onConfigChanged?: () => void
) => {
  const [configurando, setConfigurando] = useState(false);

  // Configurar mesas iniciales
  const configurarMesas = useCallback(async (payload: ConfiguracionMesasPayload) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setConfigurando(true);
    try {
      // Verificar si ya existe configuración
      const { data: existingConfig } = await supabase
        .from('mesas_configuracion')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      // Crear o actualizar configuración
      const configData = {
        restaurant_id: restaurantId,
        total_mesas: payload.totalMesas,
        zonas: payload.distribucion ? Object.keys(payload.distribucion) : []
      };

      if (existingConfig) {
        // Actualizar
        const { error } = await supabase
          .from('mesas_configuracion')
          .update(configData)
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('mesas_configuracion')
          .insert(configData);

        if (error) throw error;
      }

      // Crear mesas individuales
      const mesasData = [];
      for (let i = 1; i <= payload.totalMesas; i++) {
        // Asignar zona basada en distribución (simplificado)
        const zona = payload.distribucion
          ? Object.keys(payload.distribucion).find(zona =>
              i <= payload.distribucion![zona]
            ) || 'General'
          : 'General';

        mesasData.push({
          restaurant_id: restaurantId,
          numero: i,
          nombre: `Mesa ${i}`,
          zona,
          capacidad: 4, // Default
          estado: 'libre'
        });
      }

      // Insertar mesas (usar upsert para evitar duplicados)
      const { error: mesasError } = await supabase
        .from('mesas')
        .upsert(mesasData, {
          onConflict: 'restaurant_id,numero',
          ignoreDuplicates: false
        });

      if (mesasError) throw mesasError;

      // Notificar cambio
      onConfigChanged?.();

      return { success: true };
    } catch (error: any) {
      console.error('Error configurando mesas:', error);
      return { success: false, error: error.message };
    } finally {
      setConfigurando(false);
    }
  }, [restaurantId, onConfigChanged]);

  // Actualizar configuración de mesa individual
  const actualizarMesa = useCallback(async (
    numeroMesa: number,
    updates: {
      nombre?: string;
      zona?: string;
      capacidad?: number;
    }
  ) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      const { error } = await supabase
        .from('mesas')
        .update(updates)
        .eq('restaurant_id', restaurantId)
        .eq('numero', numeroMesa);

      if (error) throw error;

      onConfigChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando mesa:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onConfigChanged]);

  // Eliminar todas las mesas (reset configuración)
  const resetConfiguracion = useCallback(async () => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    try {
      // Eliminar mesas
      const { error: mesasError } = await supabase
        .from('mesas')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (mesasError) throw mesasError;

      // Eliminar configuración
      const { error: configError } = await supabase
        .from('mesas_configuracion')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (configError) throw configError;

      onConfigChanged?.();
      return { success: true };
    } catch (error: any) {
      console.error('Error reseteando configuración:', error);
      return { success: false, error: error.message };
    }
  }, [restaurantId, onConfigChanged]);

  return {
    configurando,
    configurarMesas,
    actualizarMesa,
    resetConfiguracion
  };
};
