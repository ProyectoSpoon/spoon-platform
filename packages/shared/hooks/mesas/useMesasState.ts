/**
 * Hook especializado para estado de mesas
 * Responsabilidad: Solo estado de mesas (lectura)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface Mesa {
  id: string;
  numero: number;
  nombre: string;
  zona: string;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'inactiva';
  ordenActiva?: {
    id: string;
    total: number;
    items: any[];
    comensales: number;
    fechaCreacion: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ConfiguracionMesas {
  configuradas: boolean;
  totalMesas: number;
  zonas: string[];
}

export const useMesasState = (restaurantId: string | null) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionMesas>({
    configuradas: false,
    totalMesas: 0,
    zonas: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false);

  // Sincronizar mesas desde BD
  const sincronizarMesas = useCallback(async () => {
    if (!restaurantId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mesas')
        .select(`
          *,
          ordenes_mesa!inner(
            id,
            total,
            items,
            comensales,
            created_at
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('ordenes_mesa.estado', 'activa')
        .order('numero');

      if (error) throw error;

      const mesasFormateadas = (data || []).map((mesa: any) => ({
        id: mesa.id,
        numero: mesa.numero,
        nombre: mesa.nombre,
        zona: mesa.zona,
        capacidad: mesa.capacidad,
        estado: mesa.estado,
        ordenActiva: mesa.ordenes_mesa?.[0] ? {
          id: mesa.ordenes_mesa[0].id,
          total: mesa.ordenes_mesa[0].total,
          items: mesa.ordenes_mesa[0].items || [],
          comensales: mesa.ordenes_mesa[0].comensales,
          fechaCreacion: mesa.ordenes_mesa[0].created_at
        } : undefined,
        created_at: mesa.created_at,
        updated_at: mesa.updated_at
      }));

      setMesas(mesasFormateadas);
    } catch (error) {
      console.error('Error sincronizando mesas:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Sincronizar configuración
  const sincronizarConfiguracion = useCallback(async () => {
    if (!restaurantId) return;

    setLoadingConfiguracion(true);
    try {
      const { data, error } = await supabase
        .from('mesas_configuracion')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfiguracion({
          configuradas: true,
          totalMesas: data.total_mesas,
          zonas: data.zonas || []
        });
      } else {
        setConfiguracion({
          configuradas: false,
          totalMesas: 0,
          zonas: []
        });
      }
    } catch (error) {
      console.error('Error sincronizando configuración:', error);
    } finally {
      setLoadingConfiguracion(false);
    }
  }, [restaurantId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (restaurantId) {
      sincronizarMesas();
      sincronizarConfiguracion();
    }
  }, [restaurantId, sincronizarMesas, sincronizarConfiguracion]);

  return {
    mesas,
    configuracion,
    loading,
    loadingConfiguracion,
    sincronizarMesas,
    sincronizarConfiguracion
  };
};
