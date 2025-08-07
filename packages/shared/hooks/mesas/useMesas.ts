'use client';

import { useState, useEffect } from 'react';
import { 
  getUserRestaurant,
  verificarMesasConfiguradas,
  getEstadoCompletoMesas,
  getMesasRestaurante,
  configurarMesas,
  updateEstadoMesa,
  crearMesa,
  inactivarMesa,
  limpiarConfiguracionMesas,
  cobrarMesa,
  type RestaurantMesa
} from '@spoon/shared/lib/supabase';
import type { EstadoMesas } from '@spoon/shared/types/mesas/mesasTypes';

// ========================================
// INTERFACES
// ========================================

export interface EstadoMesaCompleto {
  numero: number;
  nombre?: string;
  zona: string;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'inactiva';
  ocupada: boolean;
  detallesOrden?: {
    total: number;
    items: any[];
  } | null;
}

export interface ConfiguracionMesas {
  configuradas: boolean;
  totalMesas: number;
  zonas: string[];
}

export interface DistribucionZonas {
  [zona: string]: number;
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useMesas = () => {
  // Estados principales
  const [mesasOcupadas, setMesasOcupadas] = useState<EstadoMesas>({});
  const [mesasCompletas, setMesasCompletas] = useState<EstadoMesaCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Estados del sistema maestro
  const [configuracion, setConfiguracion] = useState<ConfiguracionMesas>({
    configuradas: false,
    totalMesas: 0,
    zonas: []
  });
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false);

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  useEffect(() => {
    const getRestaurantId = async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (restaurant) {
          setRestaurantId(restaurant.id);
        }
      } catch (error) {
        console.error('Error obteniendo restaurante:', error);
      }
    };
    getRestaurantId();
  }, []);

  // ========================================
  // FUNCIONES DE VERIFICACIÓN
  // ========================================

  const verificarConfiguracion = async (): Promise<ConfiguracionMesas> => {
    if (!restaurantId) {
      return { configuradas: false, totalMesas: 0, zonas: [] };
    }
    
    try {
      const config = await verificarMesasConfiguradas(restaurantId);
      setConfiguracion(config);
      return config;
    } catch (error) {
      console.error('Error verificando configuración:', error);
      return { configuradas: false, totalMesas: 0, zonas: [] };
    }
  };

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarMesasCompletas = async () => {
    if (!restaurantId) return;
    
    try {
      const estadoCompleto = await getEstadoCompletoMesas(restaurantId);
      setMesasCompletas(estadoCompleto.mesas);
      
      // Mantener compatibilidad con formato anterior
      const mesasOcupadasFormato: EstadoMesas = {};
      estadoCompleto.mesas.forEach(mesa => {
        if (mesa.ocupada && mesa.detallesOrden) {
          mesasOcupadasFormato[mesa.numero] = {
            numero: mesa.numero,
            total: mesa.detallesOrden.total,
            items: mesa.detallesOrden.items
          };
        }
      });
      
      setMesasOcupadas(mesasOcupadasFormato);
    } catch (error) {
      console.error('Error cargando mesas completas:', error);
    }
  };

  const cargarMesas = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const config = await verificarConfiguracion();
      
      if (config.configuradas) {
        await cargarMesasCompletas();
      } else {
        setMesasOcupadas({});
        setMesasCompletas([]);
      }
    } catch (error) {
      console.error('Error cargando mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNCIONES DE CONFIGURACIÓN
  // ========================================

  const configurarMesasIniciales = async (
    totalMesas: number,
    distribucion?: DistribucionZonas
  ): Promise<boolean> => {
    if (!restaurantId) return false;
    
    setLoadingConfiguracion(true);
    try {
      await configurarMesas(restaurantId, totalMesas, distribucion);
      await verificarConfiguracion();
      await cargarMesasCompletas();
      return true;
    } catch (error) {
      console.error('Error configurando mesas:', error);
      return false;
    } finally {
      setLoadingConfiguracion(false);
    }
  };

  const limpiarConfiguracion = async (): Promise<boolean> => {
    if (!restaurantId) return false;
    
    setLoadingConfiguracion(true);
    try {
      await limpiarConfiguracionMesas(restaurantId);
      setConfiguracion({ configuradas: false, totalMesas: 0, zonas: [] });
      setMesasCompletas([]);
      setMesasOcupadas({});
      return true;
    } catch (error) {
      console.error('Error limpiando configuración:', error);
      return false;
    } finally {
      setLoadingConfiguracion(false);
    }
  };

  // ========================================
  // FUNCIONES DE GESTIÓN INDIVIDUAL
  // ========================================

  const actualizarEstadoMesa = async (
    mesaId: string, 
    nuevoEstado: 'libre' | 'ocupada' | 'reservada' | 'inactiva'
  ): Promise<boolean> => {
    try {
      await updateEstadoMesa(mesaId, nuevoEstado);
      await cargarMesasCompletas();
      return true;
    } catch (error) {
      console.error('Error actualizando estado de mesa:', error);
      return false;
    }
  };

  const crearMesaIndividual = async (mesaData: {
    numero: number;
    nombre?: string;
    zona?: string;
    capacidad?: number;
  }): Promise<boolean> => {
    if (!restaurantId) return false;
    
    try {
      await crearMesa({
        restaurantId,
        ...mesaData
      });
      await verificarConfiguracion();
      await cargarMesasCompletas();
      return true;
    } catch (error) {
      console.error('Error creando mesa:', error);
      return false;
    }
  };

  const inactivarMesaIndividual = async (mesaId: string): Promise<boolean> => {
    try {
      await inactivarMesa(mesaId);
      await verificarConfiguracion();
      await cargarMesasCompletas();
      return true;
    } catch (error) {
      console.error('Error inactivando mesa:', error);
      return false;
    }
  };

  // ========================================
  // FUNCIONES DE ÓRDENES
  // ========================================

  const procesarCobro = async (numeroMesa: number): Promise<boolean> => {
    if (!restaurantId) return false;
    
    try {
      await cobrarMesa(restaurantId, numeroMesa);
      
      if (configuracion.configuradas) {
        await cargarMesasCompletas();
      } else {
        await cargarMesas();
      }
      
      return true;
    } catch (error) {
      console.error('Error procesando cobro:', error);
      return false;
    }
  };

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (restaurantId) {
      cargarMesas();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && configuracion.configuradas) {
      const interval = setInterval(() => {
        cargarMesasCompletas();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [restaurantId, configuracion.configuradas]);

  // ========================================
  // VALORES CALCULADOS
  // ========================================

  const totalPendiente = Object.values(mesasOcupadas).reduce(
    (sum, mesa) => sum + mesa.total, 0
  );
  
  const mesasActivas = Object.keys(mesasOcupadas).length;
  
  const estadisticas = {
    totalMesas: configuracion.totalMesas,
    mesasLibres: mesasCompletas.filter(m => !m.ocupada && m.estado !== 'inactiva').length,
    mesasOcupadas: mesasActivas,
    mesasInactivas: mesasCompletas.filter(m => m.estado === 'inactiva').length,
    totalPendiente,
    zonas: configuracion.zonas
  };

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estados principales (compatibilidad)
    mesasOcupadas,
    loading,
    restaurantId,
    
    // Estados del sistema maestro
    mesasCompletas,
    configuracion,
    loadingConfiguracion,
    estadisticas,
    
    // Funciones principales (compatibilidad)
    cargarMesas,
    procesarCobro,
    
    // Funciones del sistema maestro
    verificarConfiguracion,
    configurarMesasIniciales,
    limpiarConfiguracion,
    actualizarEstadoMesa,
    crearMesaIndividual,
    inactivarMesaIndividual,
    cargarMesasCompletas
  };
};

// ========================================
// HOOK SIMPLIFICADO PARA COMPATIBILIDAD
// ========================================

export const useMesasSimple = () => {
  const {
    mesasOcupadas,
    loading,
    restaurantId,
    cargarMesas,
    procesarCobro
  } = useMesas();

  return {
    mesasOcupadas,
    loading,
    restaurantId,
    cargarMesas,
    procesarCobro
  };
};

// Export por defecto
export default useMesas;
