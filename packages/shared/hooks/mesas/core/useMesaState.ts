/**
 * HOOK ESPECIALIZADO PARA MANEJO DE ESTADO DE MESAS
 * Responsabilidad única: gestión de estado local y sincronización
 * Generado automáticamente por refactoring
 */

import { useState, useEffect } from 'react';
import { Mesa, ConfiguracionMesas, EstadisticasMesas } from '../../../types/mesas';

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
  const calcularEstadisticas = (mesasArray: Mesa[]): EstadisticasMesas => {
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
  };

  // Función para sincronizar mesas desde API
  const sincronizarMesas = async (): Promise<void> => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Importar funciones de supabase dinámicamente
      const { getEstadoCompletoMesas } = await import('../../../lib/supabase');
      const estadoCompleto = await getEstadoCompletoMesas(restaurantId);
      
      // Convertir al formato unificado
      const mesasUnificadas: Mesa[] = estadoCompleto.mesas.map(mesa => ({
        id: mesa.id || `mesa-${mesa.numero}`,
        numero: mesa.numero,
        nombre: mesa.nombre,
        zona: mesa.zona,
        capacidad: mesa.capacidad,
        estado: mesa.estado,
        notas: mesa.notas,
        ordenActiva: mesa.detallesOrden ? {
          id: `orden-${mesa.numero}`,
          total: mesa.detallesOrden.total,
          items: mesa.detallesOrden.items.map(item => ({
            id: item.id || `item-${Date.now()}`,
            nombre: item.nombre || 'Sin nombre',
            cantidad: item.cantidad || 1,
            precioUnitario: item.precio_unitario || 0,
            precioTotal: item.precio_total || 0,
            tipo: item.tipo || 'menu_dia',
            observaciones: item.observaciones
          })),
          mesero: undefined,
          fechaCreacion: new Date().toISOString(),
          observaciones: undefined
        } : null,
        created_at: mesa.created_at || new Date().toISOString(),
        updated_at: mesa.updated_at || new Date().toISOString()
      }));
      
      setMesas(mesasUnificadas);
      setEstadisticas(calcularEstadisticas(mesasUnificadas));
      
    } catch (err) {
      console.error('Error sincronizando mesas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para sincronizar configuración
  const sincronizarConfiguracion = async (): Promise<void> => {
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
  };

  // Función para limpiar error
  const limpiarError = (): void => {
    setError(null);
  };

  // Efectos para sincronización inicial
  useEffect(() => {
    if (restaurantId) {
      sincronizarConfiguracion();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && configuracion.configuradas) {
      sincronizarMesas();
    }
  }, [restaurantId, configuracion.configuradas]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!restaurantId || !configuracion.configuradas) return;
    
    const interval = setInterval(sincronizarMesas, 30000);
    return () => clearInterval(interval);
  }, [restaurantId, configuracion.configuradas]);

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
