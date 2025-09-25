/**
 * Sistema de Border Radius para Spoon Design System
 * Valores consistentes para esquinas redondeadas
 */

import { SpoonThemeRadii } from '../types';

// ============================================================================
// RADII BASE DEL SISTEMA
// ============================================================================

export const radii: SpoonThemeRadii = {
  none: 0,      // 0px  - Sin redondeo
  sm: 4,        // 4px  - Redondeo pequeño
  md: 8,        // 8px  - Redondeo medio (base)
  lg: 12,       // 12px - Redondeo grande
  xl: 16,       // 16px - Redondeo extra grande
  full: 9999,   // Completamente redondeado (circular)
};

// ============================================================================
// RADII EXTENDIDOS
// ============================================================================

export const extendedRadii = {
  ...radii,
  xs: 2,        // 2px  - Redondeo extra pequeño
  xxl: 24,      // 24px - Redondeo muy grande
  massive: 32,  // 32px - Redondeo masivo
} as const;

// ============================================================================
// RADII SEMÁNTICOS (para componentes específicos)
// ============================================================================

export const semanticRadii = {
  // Components
  button: radii.md,           // 8px  - Botones estándar
  buttonSmall: radii.sm,      // 4px  - Botones pequeños
  buttonLarge: radii.lg,      // 12px - Botones grandes
  
  card: radii.lg,             // 12px - Cards
  cardSmall: radii.md,        // 8px  - Cards pequeñas
  
  input: radii.md,            // 8px  - Campos de texto
  inputSmall: radii.sm,       // 4px  - Campos pequeños
  
  modal: radii.xl,            // 16px - Modales
  dialog: radii.lg,           // 12px - Diálogos
  
  // Food delivery específico
  restaurantCard: radii.lg,   // 12px - Restaurant cards
  foodCard: radii.md,         // 8px  - Food cards
  categoryCard: radii.lg,     // 12px - Category cards
  
  // Navigation
  tab: radii.sm,              // 4px  - Tabs
  bottomSheet: radii.xl,      // 16px - Bottom sheets (solo top corners)
  
  // Images
  avatar: radii.full,         // Circular - Avatars
  imageSmall: radii.sm,       // 4px  - Imágenes pequeñas
  imageMedium: radii.md,      // 8px  - Imágenes medianas
  imageLarge: radii.lg,       // 12px - Imágenes grandes
  
  // Status indicators
  badge: radii.full,          // Circular - Badges
  chip: radii.full,           // Circular - Chips
  statusDot: radii.full,      // Circular - Status dots
} as const;

// ============================================================================
// UTILIDADES DE RADII
// ============================================================================

/**
 * Obtiene un valor de radii por nombre
 */
export const getRadii = (size: keyof SpoonThemeRadii): number => {
  return radii[size];
};

/**
 * Obtiene un valor extendido de radii
 */
export const getExtendedRadii = (size: keyof typeof extendedRadii): number => {
  return extendedRadii[size];
};

/**
 * Crea border radius responsive basado en el tamaño del componente
 */
export const getResponsiveRadii = (
  baseSize: keyof SpoonThemeRadii,
  componentSize: number
): number => {
  const base = radii[baseSize];
  
  // Ajusta el radius basado en el tamaño del componente
  if (componentSize < 40) {
    return Math.max(2, base * 0.5); // Más pequeño para componentes pequeños
  } else if (componentSize > 100) {
    return base * 1.5; // Más grande para componentes grandes
  }
  
  return base;
};

/**
 * Crea configuración de border radius para cada esquina
 */
export const createBorderRadius = {
  all: (size: keyof SpoonThemeRadii) => ({
    borderRadius: radii[size],
  }),
  
  top: (size: keyof SpoonThemeRadii) => ({
    borderTopLeftRadius: radii[size],
    borderTopRightRadius: radii[size],
  }),
  
  bottom: (size: keyof SpoonThemeRadii) => ({
    borderBottomLeftRadius: radii[size],
    borderBottomRightRadius: radii[size],
  }),
  
  left: (size: keyof SpoonThemeRadii) => ({
    borderTopLeftRadius: radii[size],
    borderBottomLeftRadius: radii[size],
  }),
  
  right: (size: keyof SpoonThemeRadii) => ({
    borderTopRightRadius: radii[size],
    borderBottomRightRadius: radii[size],
  }),
  
  topLeft: (size: keyof SpoonThemeRadii) => ({
    borderTopLeftRadius: radii[size],
  }),
  
  topRight: (size: keyof SpoonThemeRadii) => ({
    borderTopRightRadius: radii[size],
  }),
  
  bottomLeft: (size: keyof SpoonThemeRadii) => ({
    borderBottomLeftRadius: radii[size],
  }),
  
  bottomRight: (size: keyof SpoonThemeRadii) => ({
    borderBottomRightRadius: radii[size],
  }),
  
  custom: (topLeft: number, topRight: number, bottomRight: number, bottomLeft: number) => ({
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight,
    borderBottomRightRadius: bottomRight,
    borderBottomLeftRadius: bottomLeft,
  }),
};

// ============================================================================
// FOOD DELIVERY RADII (contextos específicos)
// ============================================================================

export const foodDeliveryRadii = {
  // Restaurant cards
  restaurantCard: {
    container: semanticRadii.restaurantCard,
    image: semanticRadii.imageLarge,
    badge: semanticRadii.badge,
  },
  
  // Food cards
  foodCard: {
    container: semanticRadii.foodCard,
    image: semanticRadii.imageMedium,
    priceTag: semanticRadii.chip,
  },
  
  // Category cards
  categoryCard: {
    container: semanticRadii.categoryCard,
    image: semanticRadii.imageLarge,
    icon: semanticRadii.chip,
  },
  
  // Search
  searchField: {
    container: semanticRadii.input,
    suggestions: semanticRadii.card,
  },
  
  // Filters
  filterChip: {
    container: semanticRadii.chip,
    selected: semanticRadii.chip,
  },
} as const;

// ============================================================================
// CLASE SPOONRADII PARA MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Clase SpoonRadii para crear border radius con sintaxis similar a Flutter
 */
export class SpoonRadii {
  private constructor() {}

  /**
   * Sin redondeo
   */
  static none() {
    return { borderRadius: radii.none };
  }

  /**
   * Redondeo pequeño
   */
  static small() {
    return { borderRadius: radii.sm };
  }

  /**
   * Redondeo medio
   */
  static medium() {
    return { borderRadius: radii.md };
  }

  /**
   * Redondeo grande
   */
  static large() {
    return { borderRadius: radii.lg };
  }

  /**
   * Redondeo extra grande
   */
  static extraLarge() {
    return { borderRadius: radii.xl };
  }

  /**
   * Completamente circular
   */
  static circular() {
    return { borderRadius: radii.full };
  }

  /**
   * Redondeo personalizado
   */
  static custom(value: number) {
    return { borderRadius: value };
  }

  /**
   * Solo esquinas superiores
   */
  static topOnly(size: keyof SpoonThemeRadii = 'md') {
    return createBorderRadius.top(size);
  }

  /**
   * Solo esquinas inferiores
   */
  static bottomOnly(size: keyof SpoonThemeRadii = 'md') {
    return createBorderRadius.bottom(size);
  }

  /**
   * Solo esquinas izquierdas
   */
  static leftOnly(size: keyof SpoonThemeRadii = 'md') {
    return createBorderRadius.left(size);
  }

  /**
   * Solo esquinas derechas
   */
  static rightOnly(size: keyof SpoonThemeRadii = 'md') {
    return createBorderRadius.right(size);
  }

  /**
   * Redondeo para botones según su tamaño
   */
  static button(size: 'small' | 'medium' | 'large' = 'medium') {
    switch (size) {
      case 'small':
        return { borderRadius: semanticRadii.buttonSmall };
      case 'large':
        return { borderRadius: semanticRadii.buttonLarge };
      default:
        return { borderRadius: semanticRadii.button };
    }
  }

  /**
   * Redondeo para cards
   */
  static card(size: 'small' | 'medium' | 'large' = 'medium') {
    switch (size) {
      case 'small':
        return { borderRadius: semanticRadii.cardSmall };
      case 'large':
        return { borderRadius: radii.xl };
      default:
        return { borderRadius: semanticRadii.card };
    }
  }

  /**
   * Redondeo para food cards
   */
  static foodCard() {
    return { borderRadius: semanticRadii.foodCard };
  }

  /**
   * Redondeo para restaurant cards
   */
  static restaurantCard() {
    return { borderRadius: semanticRadii.restaurantCard };
  }

  /**
   * Redondeo para category cards
   */
  static categoryCard() {
    return { borderRadius: semanticRadii.categoryCard };
  }

  /**
   * Redondeo condicional
   */
  static conditional(condition: boolean, size: keyof SpoonThemeRadii = 'md') {
    return condition ? { borderRadius: radii[size] } : { borderRadius: radii.none };
  }
}

// ============================================================================
// CONSTANTES DE COMPONENTES
// ============================================================================

export const componentRadii = {
  // Buttons
  button: {
    small: semanticRadii.buttonSmall,
    medium: semanticRadii.button,
    large: semanticRadii.buttonLarge,
  },
  
  // Cards
  card: {
    small: semanticRadii.cardSmall,
    medium: semanticRadii.card,
    large: radii.xl,
  },
  
  // Inputs
  input: {
    small: semanticRadii.inputSmall,
    medium: semanticRadii.input,
    large: radii.lg,
  },
  
  // Navigation
  navigation: {
    tab: semanticRadii.tab,
    bottomSheet: semanticRadii.bottomSheet,
    modal: semanticRadii.modal,
  },
  
  // Images
  image: {
    small: semanticRadii.imageSmall,
    medium: semanticRadii.imageMedium,
    large: semanticRadii.imageLarge,
    avatar: semanticRadii.avatar,
  },
} as const;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default radii;
