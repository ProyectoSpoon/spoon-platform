/**
 * HOOK ESPECIALIZADO PARA ACCIONES DE MESA
 * Responsabilidad única: ejecutar acciones y manejar respuestas
 * Generado automáticamente por refactoring
 */

import { useState } from 'react';
import { ActionResult, CrearOrdenData, ReservarMesaParams, MantenimientoMesaParams } from '../../../types/mesas';
import { validarCrearOrden, validarReserva } from '../../../utils/mesas';

export interface MesaActionsHook {
  // Estados de acciones en progreso
  creandoOrden: boolean;
  procesandoCobro: boolean;
  cambiandoEstado: boolean;
  
  // Funciones de acción
  crearOrden: (data: CrearOrdenData) => Promise<ActionResult>;
  cobrarMesa: (mesaNumero: number) => Promise<ActionResult>;
  reservarMesa: (mesaNumero: number, params: ReservarMesaParams) => Promise<ActionResult>;
  liberarReserva: (mesaNumero: number) => Promise<ActionResult>;
  ponerMantenimiento: (mesaNumero: number, params: MantenimientoMesaParams) => Promise<ActionResult>;
  activarMesa: (mesaNumero: number) => Promise<ActionResult>;
  inactivarMesa: (mesaNumero: number, motivo: string) => Promise<ActionResult>;
  eliminarOrden: (mesaNumero: number) => Promise<ActionResult>;
}

export const useMesaActions = (
  restaurantId: string | null,
  onSuccess?: () => void
): MesaActionsHook => {
  
  // Estados de carga
  const [creandoOrden, setCreandoOrden] = useState(false);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  // Función auxiliar para manejar errores
  const manejarError = (error: unknown, accion: string): ActionResult => {
    console.error(`Error en ${accion}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  };

  // Crear orden
  const crearOrden = async (data: CrearOrdenData): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    const validacion = validarCrearOrden(data);
    if (!validacion.valid) {
      return { success: false, error: validacion.errors.join(', ') };
    }

    setCreandoOrden(true);
    try {
      const { crearOrdenMesa } = await import('../../../lib/supabase');
      
      const itemsParaOrden = data.items.map(item => ({
        combinacionId: item.tipo === 'menu_dia' ? item.combinacionId : undefined,
        combinacionEspecialId: item.tipo === 'especial' ? item.combinacionEspecialId : undefined,
        tipoItem: item.tipo,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        observacionesItem: item.observaciones
      }));

      const nuevaOrden = await crearOrdenMesa({
        restaurantId,
        numeroMesa: data.numeroMesa,
        nombreMesero: data.mesero || 'Administrador',
        observaciones: data.observaciones,
        items: itemsParaOrden
      });

      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Orden creada exitosamente para Mesa ${data.numeroMesa}`,
        data: nuevaOrden
      };
      
    } catch (error) {
      return manejarError(error, 'crear orden');
    } finally {
      setCreandoOrden(false);
    }
  };

  // Cobrar mesa
  const cobrarMesa = async (mesaNumero: number): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setProcesandoCobro(true);
    try {
  const { cobrarMesaConTransaccion } = await import('../../../lib/supabase');
  await cobrarMesaConTransaccion(restaurantId, mesaNumero);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${mesaNumero} cobrada exitosamente`
      };
      
    } catch (error) {
      return manejarError(error, 'cobrar mesa');
    } finally {
      setProcesandoCobro(false);
    }
  };

  // Reservar mesa
  const reservarMesa = async (mesaNumero: number, params: ReservarMesaParams): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    const validacion = validarReserva(params.nombreCliente, params.telefono, params.horaReserva);
    if (!validacion.valid) {
      return { success: false, error: validacion.errors.join(', ') };
    }

    setCambiandoEstado(true);
    try {
      const { reservarMesaManual } = await import('../../../lib/supabase');
      await reservarMesaManual(restaurantId, mesaNumero, params);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${mesaNumero} reservada para ${params.nombreCliente}`
      };
      
    } catch (error) {
      return manejarError(error, 'reservar mesa');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Liberar reserva
  const liberarReserva = async (mesaNumero: number): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setCambiandoEstado(true);
    try {
      const { liberarReservaManual } = await import('../../../lib/supabase');
      await liberarReservaManual(restaurantId, mesaNumero);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Reserva de Mesa ${mesaNumero} liberada`
      };
      
    } catch (error) {
      return manejarError(error, 'liberar reserva');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Poner en mantenimiento
  const ponerMantenimiento = async (mesaNumero: number, params: MantenimientoMesaParams): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setCambiandoEstado(true);
    try {
      const { ponerMesaMantenimiento } = await import('../../../lib/supabase');
      await ponerMesaMantenimiento(restaurantId, mesaNumero, params.motivo);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${mesaNumero} puesta en mantenimiento`
      };
      
    } catch (error) {
      return manejarError(error, 'poner en mantenimiento');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Activar mesa
  const activarMesa = async (mesaNumero: number): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setCambiandoEstado(true);
    try {
      const { activarMesaManual } = await import('../../../lib/supabase');
      await activarMesaManual(restaurantId, mesaNumero);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${mesaNumero} activada`
      };
      
    } catch (error) {
      return manejarError(error, 'activar mesa');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Inactivar mesa
  const inactivarMesa = async (mesaNumero: number, motivo: string): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setCambiandoEstado(true);
    try {
      const { inactivarMesaManual } = await import('../../../lib/supabase');
      await inactivarMesaManual(restaurantId, mesaNumero, motivo);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Mesa ${mesaNumero} inactivada`
      };
      
    } catch (error) {
      return manejarError(error, 'inactivar mesa');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Eliminar orden
  const eliminarOrden = async (mesaNumero: number): Promise<ActionResult> => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID no disponible' };
    }

    setCambiandoEstado(true);
    try {
      const { eliminarOrdenMesa } = await import('../../../lib/supabase');
      await eliminarOrdenMesa(restaurantId, mesaNumero);
      
      onSuccess?.();
      
      return {
        success: true,
        mensaje: `Orden de Mesa ${mesaNumero} eliminada`
      };
      
    } catch (error) {
      return manejarError(error, 'eliminar orden');
    } finally {
      setCambiandoEstado(false);
    }
  };

  return {
    creandoOrden,
    procesandoCobro,
    cambiandoEstado,
    crearOrden,
    cobrarMesa,
    reservarMesa,
    liberarReserva,
    ponerMantenimiento,
    activarMesa,
    inactivarMesa,
    eliminarOrden
  };
};
