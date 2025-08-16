/**
 * Hook maestro de Mesas (sin dualidad)
 * Expone una sola fuente de verdad alineada a DB y separa estado de mesa vs estado de orden.
 */

import { useMemo } from 'react';
import { useMesaState } from './useMesaState';
import { useMesaActions } from './useMesaActions';
import { useMesaConfig } from './useMesaConfig';

// Estados válidos en DB para mesa
export type EstadoMesaDb = 'libre' | 'ocupada' | 'reservada' | 'inactiva';

// Estados de la orden activos visibles en UI
export type EstadoOrdenUi = 'en_cocina' | 'servida' | 'por_cobrar' | 'activa';

export interface OrdenActivaMaestro {
  id?: string;
  total: number;
  items: any[];
  comensales?: number;
  created_at?: string;
  estado_orden?: EstadoOrdenUi; // derivado, no viene de DB de mesas
}

export interface MesaCompletaMaestro {
  id: string;
  numero: number;
  nombre?: string;
  capacidad_personas: number; // nombre alineado a DB
  estado_mesa: EstadoMesaDb;  // solo estados válidos en DB
  zona?: string;               // opcional, removida en DB; puede ser undefined
  notas?: string;
  orden_activa: OrdenActivaMaestro | null; // orden separada de estado de mesa
  created_at?: string;
  updated_at?: string;
}

export interface UseMesasMaestroReturn {
  mesas: MesaCompletaMaestro[];
  configuracion: { configuradas: boolean; totalMesas: number } | null;
  loading: boolean;
  actions: {
    cargarMesas: () => Promise<void>;
    configurarMesas: (args: { totalMesas: number; distribucion?: any }) => Promise<{ success: boolean; message?: string }>;
    cambiarEstadoMesa: (numeroMesa: number, nuevoEstado: EstadoMesaDb) => Promise<{ success: boolean; message?: string }>;
    cambiarEstadoOrden: (numeroMesa: number, nuevoEstado: EstadoOrdenUi) => Promise<{ success: boolean; message?: string }>;
  }
}

/**
 * Normaliza estado UI extendido al par (estado_mesa, estado_orden)
 */
function splitEstados(estadoUi: string): { estado_mesa: EstadoMesaDb; estado_orden?: EstadoOrdenUi } {
  switch (estadoUi) {
    case 'en_cocina':
      return { estado_mesa: 'ocupada', estado_orden: 'en_cocina' };
    case 'servida':
      return { estado_mesa: 'ocupada', estado_orden: 'servida' };
    case 'por_cobrar':
      return { estado_mesa: 'ocupada', estado_orden: 'por_cobrar' };
    case 'libre':
    case 'ocupada':
    case 'reservada':
    case 'inactiva':
    default:
      // Si no es un estado extendido, asumimos que es un estado de mesa válido o lo coercionamos a 'libre'
      const e = ['libre', 'ocupada', 'reservada', 'inactiva'].includes(estadoUi) ? (estadoUi as EstadoMesaDb) : 'libre';
      return { estado_mesa: e };
  }
}

/**
 * Hook maestro: reutiliza la fuente de datos actual pero entrega un modelo limpio y estable.
 */
export const useMesasMaestro = (restaurantId: string | null): UseMesasMaestroReturn => {
  const state = useMesaState(restaurantId);
  const actions = useMesaActions(restaurantId, state.sincronizarMesas);
  const config = useMesaConfig(restaurantId, () => {
    state.sincronizarConfiguracion();
    state.sincronizarMesas();
  });

  // Mapear a modelo maestro
  const mesas = useMemo<MesaCompletaMaestro[]>(() => {
    return state.mesas.map((m) => {
      const { estado_mesa, estado_orden } = splitEstados(m.estado as string);
      return {
        id: m.id,
        numero: m.numero,
        nombre: m.nombre,
        zona: m.zona, // puede venir undefined según schema
        capacidad_personas: m.capacidad ?? 0,
        estado_mesa,
        notas: m.notas,
        orden_activa: m.ordenActiva
          ? {
              id: (m.ordenActiva as any).id,
              total: m.ordenActiva.total,
              items: m.ordenActiva.items,
              comensales: (m.ordenActiva as any).comensales,
              created_at: (m.ordenActiva as any).fechaCreacion || (m.ordenActiva as any).created_at,
              estado_orden: estado_orden || 'activa',
            }
          : null,
        created_at: m.created_at,
        updated_at: m.updated_at,
      };
    });
  }, [state.mesas]);

  return {
    mesas,
    configuracion: state.configuracion ? { configuradas: state.configuracion.configuradas, totalMesas: state.configuracion.totalMesas } : null,
    loading: state.loading || config.configurando,
    actions: {
      cargarMesas: state.sincronizarMesas,
      configurarMesas: config.configurarMesas,
  cambiarEstadoMesa: async (numeroMesa, nuevoEstado) => {
        // proxy simple a activar/inactivar/reservar/crear/editar orden según caso
        switch (nuevoEstado) {
          case 'libre':
            // si hay orden, eliminar; si estaba inactiva, activar
            await actions.eliminarOrden(numeroMesa);
            return { success: true };
          case 'ocupada':
            // crear orden vacía si no existe
            await actions.crearOrden({ numeroMesa, items: [] });
            return { success: true };
          case 'reservada':
    await actions.reservarMesa(numeroMesa, { nombreCliente: 'Reserva', telefono: '', horaReserva: new Date().toISOString() });
            return { success: true };
          case 'inactiva':
    await actions.inactivarMesa(numeroMesa, 'Inactivada desde panel maestro');
            return { success: true };
        }
      },
      cambiarEstadoOrden: async (numeroMesa, nuevoEstado) => {
        // Por ahora, usar crearOrden/eliminarOrden como placeholders y dejar TODO para estados finos
        // TODO: implementar endpoints específicos para estados de orden
        switch (nuevoEstado) {
          case 'en_cocina':
          case 'servida':
          case 'activa':
            // Asegurar que exista orden
            await actions.crearOrden({ numeroMesa, items: [] });
            return { success: true };
          case 'por_cobrar':
            // No hay endpoint específico aún; mantener como no-op
            return { success: true };
        }
      },
    },
  };
};

export default useMesasMaestro;
