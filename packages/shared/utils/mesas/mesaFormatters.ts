/**
 * FORMATEADORES PARA DATOS DE MESA
 * Generado automáticamente por refactoring
 */

import { FORMATO_MONEDA } from '@spoon/shared/constants/mesas';

/**
 * Formatea monto en pesos colombianos
 */
export const formatearMoneda = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', FORMATO_MONEDA).format(amount);
};

/**
 * Formatea tiempo de ocupación
 */
export const formatearTiempoOcupacion = (minutos: number | null): string => {
  if (!minutos) return '-';
  
  if (minutos < 60) {
    return `${minutos}m`;
  }
  
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`;
};

/**
 * Formatea nombre de mesa con fallback
 */
export const formatearNombreMesa = (numero: number, nombre?: string): string => {
  return nombre && nombre.trim() ? `${nombre} (#${numero})` : `Mesa ${numero}`;
};

/**
 * Formatea información de capacidad
 */
export const formatearCapacidad = (capacidad: number): string => {
  if (capacidad === 1) return '1 persona';
  return `${capacidad} personas`;
};

/**
 * Formatea lista de items de orden para display
 */
export const formatearResumenOrden = (items: any[]): string => {
  if (items.length === 0) return 'Sin productos';
  if (items.length === 1) return `1 producto`;
  return `${items.length} productos`;
};

/**
 * Formatea nota con timestamp
 */
import { formatInBogota } from '@spoon/shared/utils/datetime';

export const formatearNotaConFecha = (nota: string): string => {
  const fecha = formatInBogota(new Date());
  return `${nota} - ${fecha}`;
};

/**
 * Formatea porcentaje con decimales
 */
export const formatearPorcentaje = (valor: number, decimales: number = 1): string => {
  return `${valor.toFixed(decimales)}%`;
};



