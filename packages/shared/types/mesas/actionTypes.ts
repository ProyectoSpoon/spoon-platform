// Removed circular import
/**
 * TIPOS PARA ACCIONES Y EVENTOS DEL MÓDULO DE MESAS
 * Generado automáticamente por refactoring
 */

import { MesaEstado } from './stateTypes';

// Acciones principales
export type MesaAction =
  | 'crear_orden'
  | 'cobrar_mesa'
  | 'reservar_mesa'
  | 'liberar_reserva'
  | 'activar_mesa'
  | 'inactivar_mesa'
  | 'poner_mantenimiento'
  | 'eliminar_orden';

// Resultados de acciones
export interface ActionResult {
  success: boolean;
  mensaje?: string;
  data?: any;
  error?: string;
}

// Eventos de tiempo real
export interface MesaEvent {
  tipo: 'estado_cambio' | 'orden_creada' | 'orden_cobrada';
  mesaId: string;
  mesaNumero: number;
  estadoAnterior?: MesaEstado;
  estadoNuevo: MesaEstado;
  datos?: any;
  timestamp: string;
}

// Parámetros para acciones específicas
export interface ReservarMesaParams {
  nombreCliente: string;
  telefono?: string;
  horaReserva?: string;
  observaciones?: string;
}

export interface MantenimientoMesaParams {
  motivo: string;
  tiempoEstimado?: string;
}

// Parámetros para crear orden
export interface CrearOrdenData {
  numeroMesa: number;
  mesero?: string;
  observaciones?: string;
  items: ItemOrdenInput[];
}

export interface NuevoItemOrden {
  combinacionId?: string;
  combinacionEspecialId?: string;
  tipo: 'menu_dia' | 'especial';
  cantidad: number;
  precioUnitario: number;
  observaciones?: string;
}

export interface ItemOrdenInput {
  tipo: 'menu_dia' | 'especial';
  cantidad: number;
  precioUnitario: number;
  combinacionId?: string;
  combinacionEspecialId?: string;
  observaciones?: string;
}
