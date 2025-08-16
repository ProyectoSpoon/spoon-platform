// ========================================
// SPECIAL DISH CONSTANTS
// File: packages/shared/constants/special-dishes/specialDishConstants.ts
// ========================================

import { SpecialFilters, SpecialComboFilters } from '../../types/special-dishes/specialDishTypes';
import { CATEGORIAS_MENU_CONFIG } from '../menu-dia/menuConstants';

// ========================================
// CONFIGURACIÓN DE CATEGORÍAS PARA ESPECIALES
// (Reutilizamos la misma estructura del menú del día)
// ========================================

// Reglas de obligatoriedad específicas para especiales
const REQUIRED_BY_ID: Record<string, boolean> = {
  proteinas: true,
  entradas: false,
  principios: false,
  acompanamientos: false,
  bebidas: false,
};

export const CATEGORIAS_ESPECIALES_CONFIG = [
  { id: 'info', nombre: 'Información Básica', uuid: null, required: true },
  ...CATEGORIAS_MENU_CONFIG
    .filter((c) => c.id !== 'configuracion-final')
    .map((c) => ({ ...c, required: REQUIRED_BY_ID[c.id] ?? false })),
  { id: 'configuracion-final', nombre: 'Configuración Final', uuid: null, required: true }
];

// ========================================
// PRECIOS Y CONFIGURACIÓN
// ========================================

export const DEFAULT_SPECIAL_PRICE = 35000;
export const MIN_SPECIAL_PRICE = 15000;
export const MAX_SPECIAL_PRICE = 100000;
export const SPECIAL_PRICE_STEP = 1000;

// ========================================
// ICONOS PARA ESPECIALES
// ========================================

export const SPECIAL_CATEGORY_ICONS = {
  'Entradas': '🥗',
  'Principios': '🍚', 
  'Proteínas': '🦞', // Langosta para especiales
  'Acompañamientos': '🥔',
  'Bebidas': '🥤',
  'default': '✨'
};

export const SPECIAL_STATUS_ICONS = {
  'draft': '📝',
  'active': '✅',
  'inactive': '🚫'
};

// ========================================
// FILTROS POR DEFECTO
// ========================================

export const DEFAULT_SPECIAL_FILTERS: SpecialFilters = {
  favorites: false,
  featured: false,
  availability: 'all',
  status: 'all',
  sortBy: 'name'
};

export const DEFAULT_SPECIAL_COMBO_FILTERS: SpecialComboFilters = {
  favorites: false,
  featured: false,
  availability: 'all',
  sortBy: 'name'
};

// ========================================
// PASOS DEL WIZARD PARA ESPECIALES
// ========================================

export const SPECIAL_WIZARD_STEPS = [
  {
    id: 'info',
    nombre: 'Información Básica',
    descripcion: 'Nombre, descripción y precio del plato especial',
    icono: '📝',
    required: true,
    orden: 0
  },
  {
    id: 'entradas',
    nombre: 'Entradas',
    descripcion: 'Entradas disponibles (opcional)',
    icono: '🥗',
    required: false,
    orden: 1
  },
  {
    id: 'principios',
    nombre: 'Principios',
    descripcion: 'Principios o bases (opcional)',
    icono: '🍚',
    required: false,
    orden: 2
  },
  {
    id: 'proteinas',
    nombre: 'Proteínas',
    descripcion: 'Proteína principal (requerido)',
    icono: '🦞',
    required: true,
    orden: 3
  },
  {
    id: 'acompanamientos',
    nombre: 'Acompañamientos',
    descripcion: 'Guarniciones y acompañamientos (opcional)',
    icono: '🥔',
    required: false,
    orden: 4
  },
  {
    id: 'bebidas',
    nombre: 'Bebidas',
    descripcion: 'Bebidas incluidas (opcional)',
    icono: '🥤',
    required: false,
    orden: 5
  },
  {
    id: 'configuracion-final',
    nombre: 'Resumen',
    descripcion: 'Revisar y confirmar configuración',
    icono: '✅',
    required: true,
    orden: 6
  }
];

export const SPECIAL_WIZARD_STEPS_COUNT = SPECIAL_WIZARD_STEPS.length;

// ========================================
// MENSAJES DEL SISTEMA
// ========================================

export const SPECIAL_LOADING_MESSAGES = {
  saving: 'Guardando plato especial...',
  generating: 'Generando combinaciones...',
  loading: 'Cargando especiales...',
  deleting: 'Eliminando...',
  updating: 'Actualizando...',
  activating: 'Activando para hoy...',
  creating: 'Creando plato especial...'
};

export const SPECIAL_SUCCESS_MESSAGES = {
  created: 'Plato especial creado exitosamente',
  updated: 'Plato especial actualizado',
  deleted: 'Plato especial eliminado',
  activated: 'Especial activado para hoy',
  deactivated: 'Especial desactivado para hoy',
  combination_updated: 'Combinación actualizada',
  combination_deleted: 'Combinación eliminada'
};

export const SPECIAL_ERROR_MESSAGES = {
  create_failed: 'Error al crear plato especial',
  update_failed: 'Error al actualizar plato especial',
  delete_failed: 'Error al eliminar plato especial',
  load_failed: 'Error al cargar especiales',
  activate_failed: 'Error al activar especial',
  no_restaurant: 'No se pudo identificar el restaurante',
  invalid_data: 'Datos inválidos',
  insufficient_products: 'Debe seleccionar al menos una proteína'
};

// ========================================
// CONFIGURACIÓN DE VALIDACIÓN
// ========================================

export const SPECIAL_VALIDATION_RULES = {
  dish_name: {
    min_length: 3,
    max_length: 255,
    required: true
  },
  dish_description: {
    max_length: 500,
    required: false
  },
  dish_price: {
    min: MIN_SPECIAL_PRICE,
    max: MAX_SPECIAL_PRICE,
    required: true
  },
  required_categories: ['proteinas'], // Solo proteínas es obligatorio
  min_total_products: 2,
  max_products_per_category: 10
};

// ========================================
// CONFIGURACIÓN DE PRODUCTOS ESPECIALES
// ========================================

export const SPECIAL_PRODUCT_CONFIG = {
  langosta: {
    name: 'Langosta a la plancha',
    suggested_price: 45000,
    category: 'proteinas',
    is_premium: true
  },
  costillas: {
    name: 'Costillas BBQ',
    suggested_price: 38000,
    category: 'proteinas',
    is_premium: true
  },
  salmon: {
    name: 'Salmón al horno',
    suggested_price: 42000,
    category: 'proteinas',
    is_premium: true
  },
  churrasco: {
    name: 'Churrasco premium',
    suggested_price: 40000,
    category: 'proteinas',
    is_premium: true
  }
};

// ========================================
// COMBINACIONES SUGERIDAS
// ========================================

export const SPECIAL_COMBINATIONS_TEMPLATES = [
  {
    name: 'Especial Mariscos',
    price_range: [40000, 50000],
    required_categories: ['proteinas'],
    suggested_categories: ['entradas', 'acompanamientos', 'bebidas'],
    description: 'Perfecta para mariscos frescos'
  },
  {
    name: 'Especial Carnes',
    price_range: [35000, 45000],
    required_categories: ['proteinas'],
    suggested_categories: ['principios', 'acompanamientos', 'bebidas'],
    description: 'Ideal para cortes premium'
  },
  {
    name: 'Especial Vegetariano',
    price_range: [25000, 35000],
    required_categories: ['proteinas'],
    suggested_categories: ['entradas', 'principios', 'acompanamientos'],
    description: 'Opciones vegetarianas gourmet'
  }
];

// ========================================
// CONFIGURACIÓN DE ESTADOS
// ========================================

export const SPECIAL_STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    color: 'gray',
    description: 'En configuración',
    can_activate: false
  },
  active: {
    label: 'Activo',
    color: 'green', 
    description: 'Disponible para activar',
    can_activate: true
  },
  inactive: {
    label: 'Inactivo',
    color: 'red',
    description: 'No disponible',
    can_activate: false
  }
};

// ========================================
// CONFIGURACIÓN DE TIEMPO
// ========================================

export const SPECIAL_TIME_CONFIG = {
  default_preparation_time: 30, // minutos
  max_daily_quantity: 20,
  advance_order_hours: 2,
  expiry_time: '22:00' // Hora límite para ordenar
};

// ========================================
// EXPORT ALL CONSTANTS
// ========================================

export const SPECIAL_DISH_CONSTANTS = {
  CATEGORIAS_ESPECIALES_CONFIG,
  DEFAULT_SPECIAL_PRICE,
  MIN_SPECIAL_PRICE,
  MAX_SPECIAL_PRICE,
  SPECIAL_PRICE_STEP,
  SPECIAL_CATEGORY_ICONS,
  SPECIAL_STATUS_ICONS,
  DEFAULT_SPECIAL_FILTERS,
  DEFAULT_SPECIAL_COMBO_FILTERS,
  SPECIAL_WIZARD_STEPS,
  SPECIAL_WIZARD_STEPS_COUNT,
  SPECIAL_LOADING_MESSAGES,
  SPECIAL_SUCCESS_MESSAGES,
  SPECIAL_ERROR_MESSAGES,
  SPECIAL_VALIDATION_RULES,
  SPECIAL_PRODUCT_CONFIG,
  SPECIAL_COMBINATIONS_TEMPLATES,
  SPECIAL_STATUS_CONFIG,
  SPECIAL_TIME_CONFIG
};