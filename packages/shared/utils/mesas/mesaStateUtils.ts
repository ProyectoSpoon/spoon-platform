/**
 * UTILIDADES PARA MANEJO DE ESTADOS DE MESA
 * Generado automáticamente por refactoring
 */

import { Mesa, MesaEstado } from '@spoon/shared/types/mesas/stateTypes';
import { 
  ESTADOS_PERMITEN_ORDEN, 
  ESTADOS_DISPONIBLES, 
  TRANSICIONES_VALIDAS,
  ACCIONES_POR_ESTADO
} from '@spoon/shared/constants/mesas/stateConstants';

/**
 * Determina si una mesa puede recibir una nueva orden
 */
export const puedeCrearOrden = (mesa: Mesa): boolean => {
  return ESTADOS_PERMITEN_ORDEN.includes(mesa.estado);
};

/**
 * Determina si una mesa está disponible para clientes
 */
export const estaDisponible = (mesa: Mesa): boolean => {
  return ESTADOS_DISPONIBLES.includes(mesa.estado);
};

/**
 * Valida si una transición de estado es válida
 */
export const esTransicionValida = (estadoActual: MesaEstado, estadoNuevo: MesaEstado): boolean => {
  return TRANSICIONES_VALIDAS[estadoActual]?.includes(estadoNuevo) ?? false;
};

/**
 * Obtiene el estado display para UI
 */
export const getEstadoDisplay = (mesa: Mesa) => {
  const config = {
    libre: { color: 'green', texto: 'Libre', descripcion: 'Disponible para nuevos clientes' },
    ocupada: { color: 'red', texto: 'Ocupada', descripcion: 'Mesa con orden activa' },
  en_cocina: { color: 'yellow', texto: 'En cocina', descripcion: 'Pedido en preparación' },
  servida: { color: 'yellow', texto: 'Servida', descripcion: 'Comida servida' },
  por_cobrar: { color: 'yellow', texto: 'Por cobrar', descripcion: 'Cuenta solicitada' },
    reservada: { color: 'yellow', texto: 'Reservada', descripcion: 'Mesa reservada' },
    inactiva: { color: 'gray', texto: 'Inactiva', descripcion: 'Fuera de servicio' },
    mantenimiento: { color: 'orange', texto: 'Mantenimiento', descripcion: 'En mantenimiento' }
  };
  
  return config[mesa.estado] || config.libre;
};

/**
 * Calcula tiempo de ocupación si aplica
 */
export const calcularTiempoOcupacion = (mesa: Mesa): number | null => {
  if (mesa.estado !== 'ocupada' || !mesa.ordenActiva?.fechaCreacion) {
    return null;
  }
  
  const fechaCreacion = new Date(mesa.ordenActiva.fechaCreacion);
  const ahora = new Date();
  return Math.floor((ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60)); // minutos
};

/**
 * Obtiene las acciones disponibles para una mesa según su estado
 */
export const getAccionesDisponibles = (mesa: Mesa): string[] => {
  return ACCIONES_POR_ESTADO[mesa.estado] || [];
};

/**
 * Determina si una mesa necesita atención (tiempo ocupación alto)
 */
export const necesitaAtencion = (mesa: Mesa): boolean => {
  const tiempo = calcularTiempoOcupacion(mesa);
  return tiempo !== null && tiempo > 90; // Más de 90 minutos
};


