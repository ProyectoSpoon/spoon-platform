"use client";

/**
 * HOOK TEMPORAL PARA CAJA SESION
 * API final corregida para coincidir exactamente con componentes
 */

import { useState } from 'react';

export interface CajaSesion {
  id: string;
  fechaApertura: string;
  montoInicial: number;
  montoActual: number;
  estado: 'abierta' | 'cerrada';
  notasApertura?: string;
  notasCierre?: string;
}

export interface ResultadoOperacion {
  success: boolean;
  mensaje?: string;
  error?: string;
}

export const useCajaSesion = () => {
  const [sesion, setSesion] = useState<CajaSesion | null>(null);
  const [loading, setLoading] = useState(false);

  // API corregida que coincide exactamente con componentes
  const abrirCaja = async (montoInicial: number, notasApertura?: string): Promise<ResultadoOperacion> => {
    setLoading(true);
    try {
      const nuevaSesion: CajaSesion = {
        id: `sesion-${Date.now()}`,
        fechaApertura: new Date().toISOString(),
        montoInicial,
        montoActual: montoInicial,
        estado: 'abierta',
        notasApertura
      };
      setSesion(nuevaSesion);
      return {
        success: true,
        mensaje: 'Caja abierta exitosamente'
      };
    } catch (error) {
      console.error('Error abriendo caja:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setLoading(false);
    }
  };

  const cerrarCaja = async (notasCierre?: string): Promise<ResultadoOperacion> => {
    setLoading(true);
    try {
      if (sesion) {
        setSesion({ 
          ...sesion, 
          estado: 'cerrada',
          notasCierre 
        });
        return {
          success: true,
          mensaje: 'Caja cerrada exitosamente'
        };
      }
      return {
        success: false,
        error: 'No hay sesión activa para cerrar'
      };
    } catch (error) {
      console.error('Error cerrando caja:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setLoading(false);
    }
  };

  // Calcular estado de caja basado en sesión
  const estadoCaja = sesion ? sesion.estado : 'cerrada';

  return {
    // API principal que coincide con componentes
    sesionActual: sesion,
    estadoCaja,
    loading,
    abrirCaja,
    cerrarCaja,
    
    // API adicional por compatibilidad
    sesion,
    abrirSesion: abrirCaja,
    cerrarSesion: cerrarCaja
  };
};
