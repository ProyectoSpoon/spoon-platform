/**
 * UTILIDADES PARA MANEJO DE ESTADOS DE MESA
 * Generado automáticamente por refactoring
 */

import { Mesa, MesaEstado } from '@spoon/shared/types/mesas/stateTypes';
import { TEXTOS_ESTADO } from '@spoon/shared/constants/mesas/mesasConstants';
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
// Tipos "duck-typed" para aceptar tanto legacy como maestro
type MesaLegacyLike = { estado?: string; detallesOrden?: { estado?: string } | null };
type MesaMaestroLike = { estado_mesa?: 'libre'|'ocupada'|'reservada'|'inactiva'; orden_activa?: { estado_orden?: 'en_cocina'|'servida'|'por_cobrar'|'activa' } | null };

/**
 * Devuelve un estado visual unificado para UI a partir de mesas legacy o maestro.
 * Prioriza el estado de la orden (en_cocina/servida/por_cobrar) si existe; si no, el estado de mesa.
 */
export const getEstadoDisplay = (mesa: Mesa | MesaLegacyLike | MesaMaestroLike):
  { estado: MesaEstado; color: 'green'|'red'|'yellow'|'gray'|'orange'; texto: string; descripcion?: string } => {
  // Determinar estado "display" unificado (string)
  let estado: MesaEstado = 'libre';
  const m = mesa as MesaMaestroLike;
  if (m?.orden_activa?.estado_orden && ['en_cocina','servida','por_cobrar'].includes(m.orden_activa.estado_orden)) {
    estado = m.orden_activa.estado_orden as MesaEstado;
  } else if (m?.estado_mesa) {
    estado = m.estado_mesa as MesaEstado;
  } else {
    const l = mesa as MesaLegacyLike & { estado?: MesaEstado };
    if (l?.estado) estado = l.estado as MesaEstado;
  }

  // Ajuste: si hay una orden_activa (aunque su estado_orden sea 'activa' o undefined) y la mesa figura 'libre', la consideramos 'ocupada'
  const ordenActivaGenerica = (mesa as any)?.orden_activa;
  const estadoOrden = ordenActivaGenerica?.estado_orden;
  if (estado === 'libre' && ordenActivaGenerica && (!estadoOrden || estadoOrden === 'activa')) {
    estado = 'ocupada';
  }

  // Mapear a color base
  const colorMap: Record<MesaEstado, 'green'|'red'|'yellow'|'gray'|'orange'> = {
    libre: 'green',
    ocupada: 'red',
    en_cocina: 'green', // usamos green como base (no hay blue en header actual)
    servida: 'green',
    por_cobrar: 'orange',
    reservada: 'yellow',
    inactiva: 'gray',
    mantenimiento: 'yellow'
  };

  const texto = TEXTOS_ESTADO[estado] || estado;
  const descripcion = estado === 'libre' ? 'Disponible para nuevos clientes' : undefined;

  return { estado, color: colorMap[estado], texto, descripcion };
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


