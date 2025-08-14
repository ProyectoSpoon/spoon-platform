/**
 * CONSTANTES ESPECÍFICAS PARA MANEJO DE ESTADOS
 * Generado automáticamente por refactoring
 */

import { MesaEstado } from '@spoon/shared/types/mesas/stateTypes'; 

// Estados que permiten crear orden
export const ESTADOS_PERMITEN_ORDEN: MesaEstado[] = ['libre', 'reservada'];

// Estados que requieren confirmación para cambios
export const ESTADOS_REQUIEREN_CONFIRMACION: MesaEstado[] = ['ocupada', 'reservada'];

// Estados que se consideran "disponibles" para clientes
export const ESTADOS_DISPONIBLES: MesaEstado[] = ['libre', 'reservada'];

// Estados que están fuera de servicio
export const ESTADOS_FUERA_SERVICIO: MesaEstado[] = ['inactiva', 'mantenimiento'];

// Transiciones válidas de estado
export const TRANSICIONES_VALIDAS: Record<MesaEstado, MesaEstado[]> = {
  libre: ['ocupada', 'reservada', 'inactiva', 'mantenimiento'],
  ocupada: ['en_cocina', 'por_cobrar', 'libre'],
  en_cocina: ['servida', 'por_cobrar', 'ocupada'],
  servida: ['por_cobrar', 'ocupada'],
  por_cobrar: ['libre'],
  reservada: ['ocupada', 'libre', 'inactiva'],
  inactiva: ['libre'],
  mantenimiento: ['libre']
};

// Iconos para cada estado
export const ICONOS_ESTADO: Record<MesaEstado, string> = {
  libre: '✅',
  ocupada: '🔴',
  en_cocina: '👨‍🍳',
  servida: '🍽️',
  por_cobrar: '💵',
  reservada: '📅',
  inactiva: '❌',
  mantenimiento: '�️'
};

// Acciones disponibles por estado
export const ACCIONES_POR_ESTADO: Record<MesaEstado, string[]> = {
  libre: ['crear_orden', 'reservar', 'inactivar', 'mantenimiento'],
  ocupada: ['enviar_a_cocina', 'editar_orden', 'eliminar_orden', 'cobrar'],
  en_cocina: ['marcar_servida', 'cobrar'],
  servida: ['cobrar'],
  por_cobrar: ['cobrar', 'cancelar_cuenta'],
  reservada: ['crear_orden', 'liberar_reserva', 'inactivar'],
  inactiva: ['activar'],
  mantenimiento: ['activar', 'actualizar_notas']
};
