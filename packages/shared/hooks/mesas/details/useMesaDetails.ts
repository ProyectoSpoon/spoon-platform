/**
 * HOOK ESPECIALIZADO PARA DETALLES DE MESA INDIVIDUAL
 * Para usar en componentes de detalles/modal de mesa
 * Generado automáticamente por refactoring
 */

import { useState, useEffect } from 'react';
import { Mesa, ItemOrden } from '../../../types/mesas';

export interface MesaDetails {
  mesa: number;
  items: ItemOrden[];
  total: number;
  ordenes: any[];
  mesero?: string;
  observaciones?: string;
  fechaCreacion?: string;
}

export interface UseMesaDetailsReturn {
  detalles: MesaDetails | null;
  loading: boolean;
  error: string | null;
  cargarDetalles: () => Promise<void>;
  limpiarDetalles: () => void;
}

export const useMesaDetails = (
  restaurantId: string | null,
  mesaNumero: number | null
): UseMesaDetailsReturn => {
  
  const [detalles, setDetalles] = useState<MesaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDetalles = async (): Promise<void> => {
    if (!restaurantId || !mesaNumero) {
      setDetalles(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { getDetallesMesa } = await import('../../../lib/supabase');
      const data = await getDetallesMesa(restaurantId, mesaNumero);
      
      // Convertir al formato unificado
      const detallesUnificados: MesaDetails = {
        mesa: data.mesa,
        items: data.items.map((item: any) => ({
          id: item.id || `item-${Date.now()}`,
          nombre: item.nombre || 'Sin nombre',
          cantidad: item.cantidad || 1,
          precioUnitario: item.precio_unitario || 0,
          precioTotal: item.precio_total || 0,
          tipo: item.tipo || 'menu_dia',
          observaciones: item.observaciones
        })),
        total: data.total,
        ordenes: data.ordenes || [],
      };
      
      setDetalles(detallesUnificados);
      
    } catch (err) {
      console.error('Error cargando detalles de mesa:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDetalles(null);
    } finally {
      setLoading(false);
    }
  };

  const limpiarDetalles = (): void => {
    setDetalles(null);
    setError(null);
  };

  // Cargar detalles cuando cambian los parámetros
  useEffect(() => {
    cargarDetalles();
  }, [restaurantId, mesaNumero]);

  return {
    detalles,
    loading,
    error,
    cargarDetalles,
    limpiarDetalles
  };
};
