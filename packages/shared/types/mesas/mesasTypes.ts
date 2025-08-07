// ========================================
// TIPOS TYPESCRIPT PARA GESTIÓN DE MESAS
// File: packages/shared/types/mesas/mesasTypes.ts
// Actualizado para compatibilidad con nuevas tablas y estados completos
// ========================================

// ========================================
// INTERFACES PRINCIPALES
// ========================================

export interface Mesa {
  numero: number;
  estado: 'vacia' | 'ocupada'; // Estados para compatibilidad con lógica anterior
  total?: number;
  items?: ItemMesa[];
  tiempoOcupada?: number;
  mesero?: string; // Nombre del mesero asignado
  observaciones?: string; // Observaciones de la mesa
}

export interface ItemMesa {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  tipo?: 'menu_dia' | 'especial'; // Tipo de producto
  observaciones?: string; // Observaciones del item
  precio_unitario?: number; // Precio por unidad
}

export interface EstadoMesas {
  [numeroMesa: number]: {
    numero: number;
    total: number;
    items: ItemMesa[];
    mesero?: string;
    fecha_creacion?: string;
  };
}

// ========================================
// INTERFACES EXTENDIDAS PARA DETALLES
// ========================================

export interface DetalleMesa {
  mesa: number;
  items: ItemMesaDetallado[];
  total: number;
  ordenes: OrdenResumen[];
}

export interface ItemMesaDetallado extends ItemMesa {
  descripcion?: string;
  tipo: 'menu_dia' | 'especial';
  precio_unitario: number;
  precio_total: number;
  observaciones?: string;
}

export interface OrdenResumen {
  id: string;
  mesero?: string;
  observaciones?: string;
  fecha: string;
  total: number;
}

// ========================================
// INTERFACES PARA CREACIÓN DE ÓRDENES
// ========================================

export interface NuevaOrdenMesa {
  numeroMesa: number;
  nombreMesero?: string;
  observaciones?: string;
  items: NuevoItemOrden[];
}

export interface NuevoItemOrden {
  // Para menú del día
  combinacionId?: string;
  // Para platos especiales  
  combinacionEspecialId?: string;
  
  tipoItem: 'menu_dia' | 'especial';
  cantidad: number;
  precioUnitario: number;
  observacionesItem?: string;
}

// ========================================
// TIPOS DE ESTADO Y CONFIGURACIÓN ACTUALIZADOS
// ========================================

// Estados para la lógica de mesa (compatibilidad anterior)
export type EstadoMesa = 'vacia' | 'ocupada';

// Estados de la base de datos (tabla restaurant_mesas)
export type EstadoMesaDB = 'libre' | 'ocupada' | 'reservada' | 'inactiva' | 'mantenimiento';

// Estados de orden
export type EstadoOrden = 'activa' | 'pagada' | 'completada';

// Tipos de items
export type TipoItem = 'menu_dia' | 'especial';

// ========================================
// INTERFACES PARA RESPUESTAS DE API
// ========================================

export interface RespuestaMesasEstado {
  mesasOcupadas: EstadoMesas;
  totalMesasActivas: number;
  totalPendiente: number;
  ultimaActualizacion: string;
}

export interface RespuestaDetalleMesa {
  mesa: DetalleMesa;
  encontrada: boolean;
  mensaje?: string;
}

export interface RespuestaCobro {
  success: boolean;
  mensaje?: string;
  ordenesAfectadas?: string[];
}

// ========================================
// INTERFACES PARA TIEMPO REAL
// ========================================

export interface EventoMesaRealTime {
  tipo: 'orden_creada' | 'orden_actualizada' | 'orden_pagada' | 'item_agregado';
  mesa: number;
  orden_id?: string;
  item_id?: string;
  datos: any;
  timestamp: string;
}

// ========================================
// UTILIDADES Y HELPERS
// ========================================

export interface ConfiguracionMesas {
  totalMesas: number;
  mesasDisponibles: number[];
  autoRefreshInterval: number; // en milisegundos
  mostrarMesero: boolean;
  mostrarObservaciones: boolean;
}

export interface FiltrosMesas {
  estado?: EstadoMesa;
  mesero?: string;
  rangoFecha?: {
    inicio: string;
    fin: string;
  };
  montoMinimo?: number;
  montoMaximo?: number;
}

// ========================================
// INTERFACES PARA ESTADÍSTICAS
// ========================================

export interface EstadisticasMesas {
  mesasActivas: number;
  mesasLibres: number;
  totalPendiente: number;
  promedioTicket: number;
  tiempoPromedioOcupacion: number; // en minutos
  meseroMasActivo?: string;
  horasPico: {
    hora: number;
    mesasOcupadas: number;
  }[];
}

// ========================================
// CONSTANTES DE TIPOS ACTUALIZADAS
// ========================================

// Estados para lógica de mesa (compatibilidad)
export const ESTADOS_MESA_TIPOS = {
  VACIA: 'vacia' as const,
  OCUPADA: 'ocupada' as const
};

// Estados de base de datos (restaurant_mesas)
export const ESTADOS_MESA_DB_TIPOS = {
  LIBRE: 'libre' as const,
  OCUPADA: 'ocupada' as const,
  RESERVADA: 'reservada' as const,
  INACTIVA: 'inactiva' as const,
  MANTENIMIENTO: 'mantenimiento' as const
};

export const TIPOS_ITEM_ORDEN = {
  MENU_DIA: 'menu_dia' as const,
  ESPECIAL: 'especial' as const
};

export const ESTADOS_ORDEN_TIPOS = {
  ACTIVA: 'activa' as const,
  PAGADA: 'pagada' as const,
  COMPLETADA: 'completada' as const
};

// ========================================
// VALIDADORES DE TIPOS ACTUALIZADOS
// ========================================

export const esEstadoMesaValido = (estado: string): estado is EstadoMesa => {
  return Object.values(ESTADOS_MESA_TIPOS).includes(estado as EstadoMesa);
};

export const esEstadoMesaDBValido = (estado: string): estado is EstadoMesaDB => {
  return Object.values(ESTADOS_MESA_DB_TIPOS).includes(estado as EstadoMesaDB);
};

export const esTipoItemValido = (tipo: string): tipo is TipoItem => {
  return Object.values(TIPOS_ITEM_ORDEN).includes(tipo as TipoItem);
};

export const esEstadoOrdenValido = (estado: string): estado is EstadoOrden => {
  return Object.values(ESTADOS_ORDEN_TIPOS).includes(estado as EstadoOrden);
};

// ========================================
// FUNCIONES DE CONVERSIÓN DE ESTADOS
// ========================================

/**
 * Convierte estado de BD a estado de lógica de mesa
 */
export const convertirEstadoDBaLogica = (estadoDB: EstadoMesaDB): EstadoMesa => {
  switch (estadoDB) {
    case 'ocupada':
      return 'ocupada';
    case 'libre':
    case 'reservada':
    case 'inactiva':
    case 'mantenimiento':
    default:
      return 'vacia';
  }
};

/**
 * Convierte estado de lógica a estado de BD (default 'libre')
 */
export const convertirEstadoLogicaADB = (estadoLogica: EstadoMesa): EstadoMesaDB => {
  switch (estadoLogica) {
    case 'ocupada':
      return 'ocupada';
    case 'vacia':
    default:
      return 'libre';
  }
};

// ========================================
// MAPAS DE COLORES Y TEXTOS PARA UI
// ========================================

export const COLORES_ESTADO_DB = {
  libre: '#10b981',      // green-500
  ocupada: '#ef4444',    // red-500
  reservada: '#f59e0b',  // amber-500
  inactiva: '#6b7280',   // gray-500
  mantenimiento: '#ea580c' // orange-600
};

export const TEXTOS_ESTADO_DB = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  inactiva: 'Inactiva',
  mantenimiento: 'Mantenimiento'
};

// Mantener compatibilidad con colores anteriores
export const COLORES_ESTADO = {
  vacia: '#10b981',   // green-500
  ocupada: '#ef4444'  // red-500
};

export const TEXTOS_ESTADO = {
  vacia: 'Libre',
  ocupada: 'Ocupada'
};

// ========================================
// INTERFACES PARA SISTEMA MAESTRO DE MESAS
// ========================================

/**
 * Interface para mesa completa del sistema maestro
 */
export interface MesaCompleta {
  id: string;
  numero: number;
  nombre?: string;
  zona: string;
  capacidad: number;
  estado: EstadoMesaDB;
  ocupada: boolean; // Calculado: estado === 'ocupada'
  notas?: string;
  detallesOrden?: {
    total: number;
    items: ItemMesa[];
  } | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Interface para configuración de mesas
 */
export interface ConfiguracionMesasCompleta {
  configuradas: boolean;
  totalMesas: number;
  zonas: string[];
  distribuciones?: {
    [zona: string]: number;
  };
}

// ========================================
// EXPORTACIONES POR DEFECTO
// ========================================

export default {
  // Estados
  ESTADOS_MESA_TIPOS,
  ESTADOS_MESA_DB_TIPOS,
  TIPOS_ITEM_ORDEN,
  ESTADOS_ORDEN_TIPOS,
  
  // Validadores
  esEstadoMesaValido,
  esEstadoMesaDBValido,
  esTipoItemValido,
  esEstadoOrdenValido,
  
  // Conversores
  convertirEstadoDBaLogica,
  convertirEstadoLogicaADB,
  
  // UI
  COLORES_ESTADO,
  COLORES_ESTADO_DB,
  TEXTOS_ESTADO,
  TEXTOS_ESTADO_DB
};