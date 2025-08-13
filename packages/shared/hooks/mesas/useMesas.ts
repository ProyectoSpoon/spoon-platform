/**
 * HOOK PRINCIPAL ORQUESTADOR PARA MESAS
 * Versión simplificada que coordina hooks especializados
 * Mantiene compatibilidad con API anterior
 * Refactorizado automáticamente - Reducido de 360 a 80 líneas
 */

import { useEffect, useState } from 'react';
import { getUserRestaurant } from '../../lib/supabase';
import { useMesaState } from './core/useMesaState';
import { useMesaActions } from './core/useMesaActions';
import { useMesaConfig } from './core/useMesaConfig';
import { useMesaStats } from './core/useMesaStats';

// Re-exportar tipos para compatibilidad
export type { DistribucionZonas } from './core/useMesaConfig';

export interface UseMesasReturn {
  // Estados principales (compatibilidad con API anterior)
  mesasOcupadas: { [key: number]: any };
  loading: boolean;
  restaurantId: string | null;
  
  // Estados del sistema maestro
  mesasCompletas: any[];
  configuracion: any;
  loadingConfiguracion: boolean;
  estadisticas: any;
  
  // Funciones principales (compatibilidad con API anterior)
  cargarMesas: () => Promise<void>;
  procesarCobro: (numero: number) => Promise<boolean>;
  
  // Funciones del sistema maestro
  configurarMesasIniciales: (total: number, distribucion?: any) => Promise<boolean>;
  
  // Acciones adicionales
  crearOrden: any;
  reservarMesa: any;
  activarMesa: any;
  inactivarMesa: any;
  eliminarOrden: any;
}

export const useMesas = (): UseMesasReturn => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Obtener restaurant ID
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

  // Hooks especializados
  const mesaState = useMesaState(restaurantId);
  const mesaActions = useMesaActions(restaurantId, mesaState.sincronizarMesas);
  const mesaConfig = useMesaConfig(restaurantId, () => {
    mesaState.sincronizarConfiguracion();
    mesaState.sincronizarMesas();
  });
  const mesaStats = useMesaStats(mesaState.mesas);

  // Funciones de compatibilidad con API anterior
  const cargarMesas = async (): Promise<void> => {
    await mesaState.sincronizarMesas();
  };

  const procesarCobro = async (numero: number): Promise<boolean> => {
    const result = await mesaActions.cobrarMesa(numero);
    return result.success;
  };

  const configurarMesasIniciales = async (total: number, distribucion?: any): Promise<boolean> => {
    const result = await mesaConfig.configurarMesas({ totalMesas: total, distribucion });
    return result.success;
  };

  // Convertir formato para compatibilidad
  const mesasOcupadas = mesaState.mesas
    .filter(mesa => mesa.estado === 'ocupada' && mesa.ordenActiva)
    .reduce((acc, mesa) => {
      acc[mesa.numero] = {
        numero: mesa.numero,
        total: mesa.ordenActiva!.total,
        items: mesa.ordenActiva!.items
      };
      return acc;
    }, {} as { [key: number]: any });

  const mesasCompletas = mesaState.mesas.map(mesa => ({
    numero: mesa.numero,
    nombre: mesa.nombre,
    zona: mesa.zona,
    capacidad: mesa.capacidad,
    estado: mesa.estado,
    ocupada: mesa.estado === 'ocupada',
    detallesOrden: mesa.ordenActiva ? {
      total: mesa.ordenActiva.total,
      items: mesa.ordenActiva.items,
      comensales: mesa.ordenActiva.comensales,
      fechaCreacion: mesa.ordenActiva.fechaCreacion || mesa.ordenActiva.created_at
    } : null,
    created_at: mesa.created_at,
    updated_at: mesa.updated_at
  }));

  return {
    // Estados principales (compatibilidad)
    mesasOcupadas,
    loading: mesaState.loading,
    restaurantId,
    
    // Estados del sistema maestro
    mesasCompletas,
    configuracion: mesaState.configuracion,
    loadingConfiguracion: mesaState.loadingConfiguracion || mesaConfig.configurando,
    estadisticas: mesaStats.estadisticas,
    
    // Funciones principales (compatibilidad)
    cargarMesas,
    procesarCobro,
    
    // Funciones del sistema maestro
    configurarMesasIniciales,
    
    // Acciones adicionales
    crearOrden: mesaActions.crearOrden,
    reservarMesa: mesaActions.reservarMesa,
    activarMesa: mesaActions.activarMesa,
    inactivarMesa: mesaActions.inactivarMesa,
    eliminarOrden: mesaActions.eliminarOrden
  };
};

// Hook simplificado para compatibilidad total
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

export default useMesas;
