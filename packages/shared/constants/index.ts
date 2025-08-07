// ========================================
// SPOON PLATFORM - Constantes
// ========================================

export const PRODUCT_CATEGORIES = {
  ENTRADAS: 'entradas',
  PRINCIPIOS: 'principios', 
  PROTEINAS: 'proteinas',
  ACOMPAÑAMIENTOS: 'acompañamientos',
  BEBIDAS: 'bebidas'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  STAFF: 'staff',
  VIEWER: 'viewer'
} as const;

export const RESTAURANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
} as const;

export const MENU_RESET_TIME = '22:00'; // 10 PM

export const SEARCH_RADIUS_KM = 5; // 5km radius search
