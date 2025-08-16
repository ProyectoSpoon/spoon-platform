/**
 * HOOK ESPECIALIZADO PARA CONFIGURACIÓN DE MESAS
 * Responsabilidad única: configurar y reconfigurar mesas
 * Generado automáticamente por refactoring
 */

import { useState } from 'react';
import { ActionResult } from '../../../types/mesas';
import { validarConfiguracionMesa } from '../../../utils/mesas';

export interface DistribucionZonas {
  [zona: string]: number;
}

export interface ConfiguracionMesaData {
  totalMesas: number;
  distribucion?: DistribucionZonas;
}

export interface MesaConfigHook {
  // Estados
  configurando: boolean;
  limpiando: boolean;
  
  // Funciones
  configurarMesas: (data: ConfiguracionMesaData) => Promise<ActionResult>;
  reconfigurarMesas: (data: ConfiguracionMesaData) => Promise<ActionResult>;
  limpiarConfiguracion: () => Promise<ActionResult>;
  crearMesaIndividual: (
    numero: number, 
    nombre: string, 
    zona: string | undefined, 
    capacidad: number
  ) => Promise<ActionResult>;
}

export const useMesaConfig = (
  restaurantId: string | null,
  onSuccess?: () => void
): MesaConfigHook => {
  
  // Estados
  const [configurando, setConfigurando] = useState(false);
  const [limpiando, setLimpiando] = useState(false);

  // Función auxiliar para manejar errores
  const manejarError = (error: unknown, accion: string): ActionResult => {
    console.error(`Error en ${accion}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  };

  // Configurar mesas iniciales
  const configurarMesas = async (data: ConfiguracionMesaData): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    if (data.totalMesas < 1 || data.totalMesas > 100) {
      return { success: false, error: 'El número de mesas debe estar entre 1 y 100' };
    }

    setConfigurando(true);
    try {
      const { configurarMesas: configurarMesasApi } = await import('../../../lib/supabase');
      await configurarMesasApi(restaurantId, data.totalMesas, data.distribucion);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `${data.totalMesas} mesas configuradas exitosamente`
      };
      
    } catch (error) {
      return manejarError(error, 'configurar mesas');
    } finally {
      setConfigurando(false);
    }
  };

  // Reconfigurar mesas existentes
  const reconfigurarMesas = async (data: ConfiguracionMesaData): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setConfigurando(true);
    try {
      const { reconfigurarMesas: reconfigurarMesasApi } = await import('../../../lib/supabase');
      await reconfigurarMesasApi(restaurantId, data.totalMesas);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesas reconfiguradas a ${data.totalMesas} exitosamente`
      };
      
    } catch (error) {
      return manejarError(error, 'reconfigurar mesas');
    } finally {
      setConfigurando(false);
    }
  };

  // Limpiar configuración
  const limpiarConfiguracion = async (): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setLimpiando(true);
    try {
      const { limpiarConfiguracionMesas } = await import('../../../lib/supabase');
      await limpiarConfiguracionMesas(restaurantId);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: 'Configuración de mesas limpiada exitosamente'
      };
      
    } catch (error) {
      return manejarError(error, 'limpiar configuración');
    } finally {
      setLimpiando(false);
    }
  };

  // Crear mesa individual
  const crearMesaIndividual = async (
    numero: number,
    nombre: string,
    zona: string | undefined,
    capacidad: number
  ): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

  const validacion = validarConfiguracionMesa(numero, nombre, zona as any, capacidad);
    if (!validacion.valid) {
      return { success: false, error: validacion.errors.join(', ') };
    }

    setConfigurando(true);
    try {
      const { crearMesa } = await import('../../../lib/supabase');
      await crearMesa({
        restaurantId,
        numero,
        nombre: nombre || undefined,
        // zona eliminada del modelo
        capacidad
      });
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${numero} creada exitosamente`
      };
      
    } catch (error) {
      return manejarError(error, 'crear mesa individual');
    } finally {
      setConfigurando(false);
    }
  };

  return {
    configurando,
    limpiando,
    configurarMesas,
    reconfigurarMesas,
    limpiarConfiguracion,
    crearMesaIndividual
  };
};
