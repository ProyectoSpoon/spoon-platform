/**
 * Sistema de Sombras para Spoon Design System
 * Compatible con iOS y Android, basado en Material Design 3
 */

import { SpoonThemeShadows, ViewStyle } from '../types';

// ============================================================================
// COLORES BASE PARA SOMBRAS
// ============================================================================

const shadowColors = {
  primary: '#000000',        // Negro para sombras principales
  light: '#00000010',        // Negro con 6% opacity para sombras suaves
  medium: '#00000020',       // Negro con 12% opacity para sombras medias
  strong: '#00000040',       // Negro con 25% opacity para sombras fuertes
  card: '#00000015',         // Negro con 8% opacity específico para cards
} as const;

// ============================================================================
// SOMBRAS BASE DEL SISTEMA
// ============================================================================

export const shadows: SpoonThemeShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    // Sombra pequeña - Para elementos sutiles
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    // Sombra media - Para cards y botones
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  lg: {
    // Sombra grande - Para modals y elementos flotantes
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  xl: {
    // Sombra extra grande - Para elementos muy elevados
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ============================================================================
// SOMBRAS ESPECIALIZADAS PARA COMPONENTES
// ============================================================================

export const componentShadows = {
  // Cards
  card: {
    shadowColor: shadowColors.card,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardElevated: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  
  // Buttons
  button: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  buttonPressed: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Navigation
  header: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  bottomSheet: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  
  modal: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  
  // Floating elements
  fab: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
  },
  
  toast: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ============================================================================
// SOMBRAS ESPECÍFICAS PARA FOOD DELIVERY
// ============================================================================

export const foodDeliveryShadows = {
  // Restaurant cards
  restaurantCard: {
    shadowColor: shadowColors.card,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  restaurantCardHover: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Food cards
  foodCard: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  
  foodCardActive: {
    shadowColor: shadowColors.medium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // Category items
  categoryCard: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Search suggestions
  searchSuggestions: {
    shadowColor: shadowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Filters
  filterChip: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  
  filterChipSelected: {
    shadowColor: shadowColors.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

// ============================================================================
// UTILIDADES PARA SOMBRAS
// ============================================================================

/**
 * Crea una sombra personalizada
 */
export const createShadow = (
  elevation: number,
  color: string = shadowColors.primary,
  opacity: number = 0.1
): ViewStyle => {
  const shadowRadius = elevation * 0.5;
  const shadowOffset = { width: 0, height: elevation * 0.25 };
  
  return {
    shadowColor: color,
    shadowOffset: shadowOffset,
    shadowOpacity: opacity,
    shadowRadius: shadowRadius,
    elevation: elevation,
  };
};

/**
 * Obtiene sombra por nombre
 */
export const getShadow = (shadowName: keyof SpoonThemeShadows): ViewStyle => {
  return shadows[shadowName];
};

/**
 * Combina múltiples sombras (solo funciona en iOS)
 */
export const combineShadows = (...shadowStyles: ViewStyle[]): ViewStyle => {
  // En Android solo se puede usar una sombra, así que tomamos la más fuerte
  const strongestShadow = shadowStyles.reduce((strongest, current) => {
    const currentElevation = current.elevation || 0;
    const strongestElevation = strongest.elevation || 0;
    return currentElevation > strongestElevation ? current : strongest;
  }, shadowStyles[0]);
  
  return strongestShadow;
};

/**
 * Crea sombra con color personalizado
 */
export const createColoredShadow = (
  shadowLevel: keyof SpoonThemeShadows,
  color: string,
  opacity?: number
): ViewStyle => {
  const baseShadow = shadows[shadowLevel];
  return {
    ...baseShadow,
    shadowColor: color,
    shadowOpacity: opacity || baseShadow.shadowOpacity,
  };
};

/**
 * Sombra para estados interactivos
 */
export const interactiveShadows = {
  default: componentShadows.button,
  hover: componentShadows.cardElevated,
  pressed: componentShadows.buttonPressed,
  disabled: shadows.none,
} as const;

/**
 * Obtiene sombra según el estado
 */
export const getInteractiveShadow = (
  isPressed: boolean,
  isHovered: boolean,
  isDisabled: boolean
): ViewStyle => {
  if (isDisabled) return interactiveShadows.disabled;
  if (isPressed) return interactiveShadows.pressed;
  if (isHovered) return interactiveShadows.hover;
  return interactiveShadows.default;
};

// ============================================================================
// SOMBRAS POR TEMA (DARK/LIGHT)
// ============================================================================

export const lightThemeShadows = shadows;

export const darkThemeShadows: SpoonThemeShadows = {
  none: shadows.none,
  sm: {
    ...shadows.sm,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  md: {
    ...shadows.md,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  lg: {
    ...shadows.lg,
    shadowOpacity: 0.5,
    elevation: 12,
  },
  xl: {
    ...shadows.xl,
    shadowOpacity: 0.6,
    elevation: 18,
  },
};

/**
 * Obtiene sombras según el tema
 */
export const getThemeShadows = (isDark: boolean): SpoonThemeShadows => {
  return isDark ? darkThemeShadows : lightThemeShadows;
};

// ============================================================================
// CONSTANTES DE ELEVATION (Material Design)
// ============================================================================

export const materialElevations = {
  surface: 0,           // Superficie base
  raised: 1,            // Elementos ligeramente elevados
  overlay: 3,           // Overlays y chips
  appBar: 4,           // App bars y tabs
  card: 6,             // Cards estándar
  floatingButton: 6,   // FAB en reposo
  drawer: 16,          // Navigation drawer
  modal: 24,           // Modals y dialogs
} as const;

// ============================================================================
// CLASE SPOONSHADOWS PARA MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Clase SpoonShadows para crear sombras con sintaxis similar a Flutter
 */
export class SpoonShadows {
  private constructor() {}

  /**
   * Sombra básica para cards
   */
  static card(): ViewStyle {
    return componentShadows.card;
  }

  /**
   * Sombra elevada para cards
   */
  static cardElevated(): ViewStyle {
    return componentShadows.cardElevated;
  }

  /**
   * Sombra para botones
   */
  static button(): ViewStyle {
    return componentShadows.button;
  }

  /**
   * Sombra para botones presionados
   */
  static buttonPressed(): ViewStyle {
    return componentShadows.buttonPressed;
  }

  /**
   * Sombra para modales
   */
  static modal(): ViewStyle {
    return componentShadows.modal;
  }

  /**
   * Sombra para floating action button
   */
  static fab(): ViewStyle {
    return componentShadows.fab;
  }

  /**
   * Sombra para headers
   */
  static header(): ViewStyle {
    return componentShadows.header;
  }

  /**
   * Sombra personalizada con elevation
   */
  static elevation(level: number): ViewStyle {
    return createShadow(level);
  }

  /**
   * Sin sombra
   */
  static none(): ViewStyle {
    return shadows.none;
  }

  /**
   * Sombra pequeña
   */
  static small(): ViewStyle {
    return shadows.sm;
  }

  /**
   * Sombra mediana
   */
  static medium(): ViewStyle {
    return shadows.md;
  }

  /**
   * Sombra grande
   */
  static large(): ViewStyle {
    return shadows.lg;
  }

  /**
   * Sombra extra grande
   */
  static extraLarge(): ViewStyle {
    return shadows.xl;
  }

  /**
   * Sombra para food cards
   */
  static foodCard(): ViewStyle {
    return foodDeliveryShadows.foodCard;
  }

  /**
   * Sombra para restaurant cards
   */
  static restaurantCard(): ViewStyle {
    return foodDeliveryShadows.restaurantCard;
  }

  /**
   * Sombra para category cards
   */
  static categoryCard(): ViewStyle {
    return foodDeliveryShadows.categoryCard;
  }

  /**
   * Sombra condicional basada en estado
   */
  static conditional(condition: boolean, shadowType: keyof SpoonThemeShadows = 'md'): ViewStyle {
    return condition ? shadows[shadowType] : shadows.none;
  }

  /**
   * Sombra con color personalizado
   */
  static colored(color: string, elevation: number = 4, opacity: number = 0.1): ViewStyle {
    return createShadow(elevation, color, opacity);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default shadows;
