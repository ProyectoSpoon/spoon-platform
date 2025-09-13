/**
 * HOOK ESPECIALIZADO PARA MANEJO DE ESTADO DE MESAS
 * Responsabilidad única: gestión de estado local y sincronización
 * Generado automáticamente por refactoring
 */

import { useState, useEffect, useCallback } from 'react';
import { Mesa, ConfiguracionMesas, EstadisticasMesas } from '../../../types/mesas';

// Tipo flexible para elementos provenientes de getEstadoCompletoMesas
type MesaApi = {
  id?: string;
  numero: number;
  nombre?: string;
  zona?: string; // opcional: la columna fue eliminada del esquema
  capacidad: number;
  estado: any;
  notas?: string;
  detallesOrden?: {
    total: number;
    items: any[];
  } | null;
  created_at?: string;
  updated_at?: string;
};

export interface MesaStateHook {
  // Estados principales
  mesas: Mesa[];
  configuracion: ConfiguracionMesas;
  estadisticas: EstadisticasMesas;
  
  // Estados de carga
  loading: boolean;
  loadingConfiguracion: boolean;
  error: string | null;
  
  // Funciones de sincronización
  sincronizarMesas: () => Promise<void>;
  sincronizarConfiguracion: () => Promise<void>;
  limpiarError: () => void;
}

export const useMesaState = (restaurantId: string | null): MesaStateHook => {
  // Estados principales
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionMesas>({
    configuradas: false,
    totalMesas: 0,
    zonas: [],
    distribuciones: {}
  });
  const [estadisticas, setEstadisticas] = useState<EstadisticasMesas>({
    totalMesas: 0,
    mesasLibres: 0,
    mesasOcupadas: 0,
    mesasReservadas: 0,
    mesasInactivas: 0,
    totalPendiente: 0,
    promedioTicket: 0
  });
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para calcular estadísticas desde mesas
  const calcularEstadisticas = useCallback((mesasArray: Mesa[]): EstadisticasMesas => {
    const totalMesas = mesasArray.length;
    const mesasLibres = mesasArray.filter(m => m.estado === 'libre').length;
    const mesasOcupadas = mesasArray.filter(m => m.estado === 'ocupada').length;
    const mesasReservadas = mesasArray.filter(m => m.estado === 'reservada').length;
    const mesasInactivas = mesasArray.filter(m => m.estado === 'inactiva').length;
    
    const totalPendiente = mesasArray
      .filter(m => m.ordenActiva)
      .reduce((sum, m) => sum + (m.ordenActiva?.total || 0), 0);
    
    const promedioTicket = mesasOcupadas > 0 ? totalPendiente / mesasOcupadas : 0;
    
    return {
      totalMesas,
      mesasLibres,
      mesasOcupadas,
      mesasReservadas,
      mesasInactivas,
      totalPendiente,
      promedioTicket
    };
  }, []);

  // Función para sincronizar mesas desde API
  const sincronizarMesas = useCallback(async (): Promise<void> => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Importar funciones de supabase dinámicamente
      const { getEstadoCompletoMesas } = await import('../../../lib/supabase');
  const estadoCompleto = await getEstadoCompletoMesas(restaurantId);
      
      // Convertir al formato unificado
      const mesasUnificadas: Mesa[] = (estadoCompleto.mesas as MesaApi[]).map((mesa: MesaApi) => {
        const ordenActiva = mesa.detallesOrden ? {
          id: `orden-${mesa.numero}`,
          total: mesa.detallesOrden.total,
          items: (mesa.detallesOrden.items || []).map((item: any) => {
            const cantidad = item.cantidad || 1;
            const precioDerivado = item.precio_unitario
              || item.precioUnitario
              || item.generated_combinations?.combination_price
              || item.generated_special_combinations?.combination_price
              || (item.precio_total && cantidad ? (item.precio_total / cantidad) : 0);
            const precioUnitario = precioDerivado || 0;
            const precioTotal = item.precio_total || (precioUnitario * cantidad);
            return {
              id: item.id || `item-${Date.now()}-${Math.random()}`,
              nombre: item.nombre || item.generated_combinations?.combination_name || item.generated_special_combinations?.combination_name || 'Sin nombre',
              cantidad,
              precioUnitario,
              precioTotal,
              tipo: item.tipo || item.tipo_item || 'menu_dia',
              observaciones: item.observaciones || item.observaciones_item || null
            };
          }),
          mesero: undefined,
          fechaCreacion: new Date().toISOString(),
          observaciones: undefined
        } : null;
        const estadoNormalizado = ordenActiva && ordenActiva.items.length > 0 && mesa.estado === 'libre'
          ? 'ocupada'
          : mesa.estado;
        return {
          id: mesa.id || `mesa-${mesa.numero}`,
          numero: mesa.numero,
          nombre: mesa.nombre,
          zona: mesa.zona,
          capacidad: mesa.capacidad,
          estado: estadoNormalizado,
          notas: mesa.notas,
          ordenActiva,
          created_at: mesa.created_at || new Date().toISOString(),
          updated_at: mesa.updated_at || new Date().toISOString()
        } as Mesa;
      });
      
      setMesas(mesasUnificadas);
      setEstadisticas(calcularEstadisticas(mesasUnificadas));
      
    } catch (err) {
      console.error('Error sincronizando mesas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, calcularEstadisticas]);

  // Función para sincronizar configuración
  const sincronizarConfiguracion = useCallback(async (): Promise<void> => {
    if (!restaurantId) return;
    
    try {
      setLoadingConfiguracion(true);
      
      const { verificarMesasConfiguradas } = await import('../../../lib/supabase');
      const config = await verificarMesasConfiguradas(restaurantId);
      
      setConfiguracion({
        configuradas: config.configuradas,
        totalMesas: config.totalMesas,
        zonas: config.zonas,
        distribuciones: {}
      });
      
    } catch (err) {
      console.error('Error sincronizando configuración:', err);
      setError(err instanceof Error ? err.message : 'Error en configuración');
    } finally {
      setLoadingConfiguracion(false);
    }
  }, [restaurantId]);

  // Función para limpiar error
  const limpiarError = useCallback((): void => {
    setError(null);
  }, []);

  // Efectos para sincronización inicial
  useEffect(() => {
    if (restaurantId) {
      sincronizarConfiguracion();
    }
  }, [restaurantId, sincronizarConfiguracion]);

  useEffect(() => {
    if (restaurantId && configuracion.configuradas) {
      sincronizarMesas();
    }
  }, [restaurantId, configuracion.configuradas, sincronizarMesas]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!restaurantId || !configuracion.configuradas) return;
    
    const interval = setInterval(sincronizarMesas, 30000);
    return () => clearInterval(interval);
  }, [restaurantId, configuracion.configuradas, sincronizarMesas]);

  return {
    mesas,
    configuracion,
    estadisticas,
    loading,
    loadingConfiguracion,
    error,
    sincronizarMesas,
    sincronizarConfiguracion,
    limpiarError
  };
};
