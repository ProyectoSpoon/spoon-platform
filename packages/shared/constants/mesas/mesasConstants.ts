/**
 * CONSTANTES ESENCIALES PARA MÓDULO DE MESAS
 * Reducido de 459 a 150 líneas - solo lo necesario
 * Generado automáticamente por refactoring
 */

import { MesaEstado } from '@spoon/shared/types/mesas/stateTypes'; 

// ESTADOS Y COLORES (UNIFICADOS)
export const ESTADOS_MESA: Record<MesaEstado, string> = {
  libre: 'Libre',
  ocupada: 'Ocupada', 
  en_cocina: 'En Cocina',
  servida: 'Servida',
  por_cobrar: 'Por Cobrar',
  reservada: 'Reservada',
  inactiva: 'Inactiva',
  mantenimiento: 'Mantenimiento'
} as const;

export const COLORES_ESTADO: Record<MesaEstado, string> = {
  libre: '#10b981',        // green-500
  ocupada: '#3b82f6',      // blue-500 (ocupada en servicio)
  en_cocina: '#3b82f6',    // blue-500
  servida: '#7c3aed',      // purple-600
  por_cobrar: '#ef4444',   // red-500
  reservada: '#f59e0b',    // amber-500
  inactiva: '#6b7280',     // gray-500
  mantenimiento: '#ea580c' // orange-600
} as const;

// CONFIGURACIÓN BÁSICA
export const CONFIG_MESAS = {
  MESAS_MINIMAS: 1,
  MESAS_MAXIMAS: 100,
  CAPACIDAD_MINIMA: 1,
  CAPACIDAD_MAXIMA: 20,
  ZONA_DEFAULT: 'Principal',
  CAPACIDAD_DEFAULT: 4,
  REFRESH_INTERVAL: 30000, // 30 segundos
} as const;

// FORMATO DE MONEDA
export const FORMATO_MONEDA = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
} as const;

// ZONAS PREDEFINIDAS (SIMPLIFICADO - 3 en lugar de 8)
export const ZONAS_BASICAS = [
  { id: 'principal', nombre: 'Principal', descripcion: 'Área principal del restaurante' },
  { id: 'terraza', nombre: 'Terraza', descripcion: 'Área exterior' },
  { id: 'vip', nombre: 'VIP', descripcion: 'Área exclusiva' }
] as const;

// CAPACIDADES ESTÁNDAR (SIMPLIFICADO)
export const CAPACIDADES_COMUNES = [2, 4, 6, 8] as const;

// MENSAJES DE VALIDACIÓN
export const MENSAJES_VALIDACION = {
  MESA_NUMERO_REQUERIDO: 'El número de mesa es requerido',
  CAPACIDAD_INVALIDA: 'La capacidad debe estar entre 1 y 20 personas',
  ZONA_REQUERIDA: 'La zona es requerida',
  NOMBRE_MUY_LARGO: 'El nombre no puede exceder 50 caracteres'
} as const;

// MENSAJES DE ÉXITO/ERROR
export const MENSAJES_SISTEMA = {
  ORDEN_CREADA: 'Orden creada exitosamente',
  MESA_COBRADA: 'Mesa cobrada exitosamente',
  MESA_RESERVADA: 'Mesa reservada exitosamente',
  ERROR_GENERICO: 'Ha ocurrido un error. Intenta nuevamente.'
} as const;

// Estados para compatibilidad (DEPRECATED - usar ESTADOS_MESA)
export const ESTADOS_MESA_LEGACY = {
  VACIA: 'vacia' as const,
  OCUPADA: 'ocupada' as const
};

export const COLORES_ESTADO_LEGACY = {
  vacia: '#10b981',   // green-500
  ocupada: '#ef4444'  // red-500
};

// Configuración de tiempo real
export const TIEMPO_REAL = {
  INTERVALO_REFRESH: 30000, // 30 segundos
  TIMEOUT_INACTIVIDAD: 300000 // 5 minutos
} as const;

export const TEXTOS_ESTADO = {
  libre: 'Libre',
  ocupada: 'Ocupada', 
  en_cocina: 'En Cocina',
  servida: 'Servida',
  por_cobrar: 'Por Cobrar',
  reservada: 'Reservada',
  inactiva: 'Inactiva',
  mantenimiento: 'Mantenimiento'
} as const;

