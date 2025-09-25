/**
 * Sistema de Espaciado para Spoon Design System
 * Basado en una escala de 4px para consistencia visual
 */

import { SpoonThemeSpacing, ViewStyle } from '../types';

// ============================================================================
// ESPACIADO BASE
// ============================================================================

export const spacing: SpoonThemeSpacing = {
  xs: 4,    // 4px  - Espaciado mínimo
  sm: 8,    // 8px  - Espaciado pequeño
  md: 16,   // 16px - Espaciado medio (base)
  lg: 24,   // 24px - Espaciado grande
  xl: 32,   // 32px - Espaciado extra grande
  xxl: 48,  // 48px - Espaciado máximo
};

// ============================================================================
// ESPACIADO EXTENDIDO (valores adicionales)
// ============================================================================

const extendedSpacing = {
  ...spacing,
  none: 0,       // 0px   - Sin espaciado
  micro: 2,      // 2px   - Micro espaciado
  tiny: 6,       // 6px   - Muy pequeño
  base: 12,      // 12px  - Base alternativo
  huge: 56,      // 56px  - Muy grande
  massive: 64,   // 64px  - Masivo
  giant: 80,     // 80px  - Gigante
} as const;

// ============================================================================
// ESPACIADO SEMÁNTICO (para contextos específicos)
// ============================================================================

const semanticSpacing = {
  // Componentes
  cardPadding: spacing.md,           // 16px - Padding interno de cards
  cardMargin: spacing.sm,            // 8px  - Margen entre cards
  buttonPadding: spacing.md,         // 16px - Padding de botones
  inputPadding: spacing.md,          // 16px - Padding de inputs
  
  // Layout de pantalla
  screenPadding: spacing.md,         // 16px - Padding de pantallas
  screenMargin: spacing.lg,          // 24px - Margen de pantallas
  sectionSpacing: spacing.xl,        // 32px - Espaciado entre secciones
  
  // Navegación
  headerHeight: 56,                  // 56px - Altura de headers
  tabBarHeight: 60,                  // 60px - Altura de tab bars
  bottomNavHeight: 70,               // 70px - Altura de bottom navigation
  
  // Food delivery específico
  restaurantCardSpacing: spacing.sm, // 8px  - Entre restaurant cards
  foodItemSpacing: spacing.xs,       // 4px  - Entre food items
  categorySpacing: spacing.md,       // 16px - Entre categorías
  
  // Formularios
  fieldSpacing: spacing.md,          // 16px - Entre campos de formulario
  labelSpacing: spacing.sm,          // 8px  - Entre label y input
  errorSpacing: spacing.xs,          // 4px  - Entre input y mensaje error
  
  // Contenido
  textSpacing: spacing.xs,           // 4px  - Entre líneas de texto relacionado
  paragraphSpacing: spacing.md,      // 16px - Entre párrafos
  titleSpacing: spacing.lg,          // 24px - Espaciado de títulos
} as const;

// ============================================================================
// BREAKPOINTS PARA RESPONSIVE SPACING
// ============================================================================

const breakpoints = {
  xs: 0,     // 0px    - Extra small (todos los dispositivos)
  sm: 576,   // 576px  - Small tablets
  md: 768,   // 768px  - Tablets
  lg: 992,   // 992px  - Large tablets / Small desktops
  xl: 1200,  // 1200px - Desktops
} as const;

// ============================================================================
// UTILIDADES DE ESPACIADO
// ============================================================================

/**
 * Obtiene un valor de espaciado por nombre
 */
export const getSpacing = (size: keyof typeof extendedSpacing): number => {
  return extendedSpacing[size];
};

/**
 * Multiplica un valor de espaciado
 */
const multiplySpacing = (size: keyof SpoonThemeSpacing, multiplier: number): number => {
  return spacing[size] * multiplier;
};

/**
 * Crea espaciado responsive basado en breakpoints
 */
const getResponsiveSpacing = (
  baseSize: keyof SpoonThemeSpacing,
  screenWidth: number
): number => {
  const base = spacing[baseSize];
  
  if (screenWidth >= breakpoints.lg) {
    return base * 1.5; // 50% más grande en pantallas grandes
  } else if (screenWidth >= breakpoints.md) {
    return base * 1.25; // 25% más grande en tablets
  } else if (screenWidth < breakpoints.sm) {
    return base * 0.75; // 25% más pequeño en pantallas muy pequeñas
  }
  
  return base;
};

/**
 * Crea padding simétrico
 */
const createPadding = {
  all: (size: keyof SpoonThemeSpacing): ViewStyle => ({ padding: spacing[size] }),
  horizontal: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingHorizontal: spacing[size] }),
  vertical: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingVertical: spacing[size] }),
  top: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingTop: spacing[size] }),
  bottom: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingBottom: spacing[size] }),
  left: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingLeft: spacing[size] }),
  right: (size: keyof SpoonThemeSpacing): ViewStyle => ({ paddingRight: spacing[size] }),
  custom: (top: number, right: number, bottom: number, left: number): ViewStyle => ({
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  }),
};

/**
 * Crea margin simétrico
 */
const createMargin = {
  all: (size: keyof SpoonThemeSpacing): ViewStyle => ({ margin: spacing[size] }),
  horizontal: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginHorizontal: spacing[size] }),
  vertical: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginVertical: spacing[size] }),
  top: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginTop: spacing[size] }),
  bottom: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginBottom: spacing[size] }),
  left: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginLeft: spacing[size] }),
  right: (size: keyof SpoonThemeSpacing): ViewStyle => ({ marginRight: spacing[size] }),
  custom: (top: number, right: number, bottom: number, left: number): ViewStyle => ({
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left,
  }),
};

// ============================================================================
// ESPACIADO PARA FOOD DELIVERY (contextos específicos)
// ============================================================================

const foodDeliverySpacing = {
  // Restaurant cards
  restaurantCard: {
    padding: semanticSpacing.cardPadding,
    margin: semanticSpacing.restaurantCardSpacing,
    imagePadding: spacing.sm,
    infoPadding: spacing.md,
  },
  
  // Food cards
  foodCard: {
    padding: spacing.sm,
    margin: spacing.xs,
    titleSpacing: spacing.xs,
    priceSpacing: spacing.sm,
  },
  
  // Category items
  category: {
    padding: spacing.sm,
    margin: spacing.md,
    iconSpacing: spacing.sm,
    textSpacing: spacing.xs,
  },
  
  // Search
  search: {
    padding: spacing.md,
    margin: spacing.sm,
    suggestionPadding: spacing.sm,
    resultSpacing: spacing.md,
  },
  
  // Forms
  form: {
    fieldSpacing: semanticSpacing.fieldSpacing,
    buttonSpacing: spacing.lg,
    sectionSpacing: spacing.xl,
  },
} as const;

// ============================================================================
// GRID SYSTEM
// ============================================================================

const gridSpacing = {
  gutter: spacing.md,           // 16px - Espaciado entre columnas
  containerPadding: spacing.md, // 16px - Padding del container
  rowSpacing: spacing.lg,       // 24px - Espaciado entre filas
} as const;

// ============================================================================
// CONSTANTES DE LAYOUT
// ============================================================================

const layoutConstants = {
  // Status bar y safe areas
  statusBarHeight: 44,       // Altura típica en iOS
  safeAreaTop: 44,          // Safe area superior
  safeAreaBottom: 34,       // Safe area inferior (iPhone X+)
  
  // Navigation
  headerMinHeight: 56,       // Altura mínima de header
  tabBarMinHeight: 60,       // Altura mínima de tab bar
  bottomSheetHandle: 4,      // Altura del handle de bottom sheet
  
  // Components
  buttonMinHeight: 44,       // Altura mínima de botones (accessibility)
  inputMinHeight: 48,        // Altura mínima de inputs
  cardMinPadding: spacing.md, // Padding mínimo de cards
  
  // Food delivery específico
  restaurantImageHeight: 120, // Altura de imágenes de restaurante
  foodImageHeight: 80,       // Altura de imágenes de comida
  categoryIconSize: 60,      // Tamaño de iconos de categoría
} as const;

// ============================================================================
// UTILIDADES PARA COMPONENTES
// ============================================================================

/**
 * Clase SpoonSpacing para métodos estáticos similares a Flutter
 */
export class SpoonSpacing {
  private constructor() {}

  /**
   * Crea espaciado uniforme en todas las direcciones
   */
  static all(size: keyof SpoonThemeSpacing): ViewStyle {
    return { padding: spacing[size] };
  }

  /**
   * Crea espaciado horizontal uniforme
   */
  static horizontal(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingHorizontal: spacing[size] };
  }

  /**
   * Crea espaciado vertical uniforme
   */
  static vertical(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingVertical: spacing[size] };
  }

  /**
   * Crea espaciado solo en la parte superior
   */
  static top(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingTop: spacing[size] };
  }

  /**
   * Crea espaciado solo en la parte inferior
   */
  static bottom(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingBottom: spacing[size] };
  }

  /**
   * Crea espaciado solo a la izquierda
   */
  static left(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingLeft: spacing[size] };
  }

  /**
   * Crea espaciado solo a la derecha
   */
  static right(size: keyof SpoonThemeSpacing): ViewStyle {
    return { paddingRight: spacing[size] };
  }

  /**
   * Crea margin uniforme en todas las direcciones
   */
  static marginAll(size: keyof SpoonThemeSpacing): ViewStyle {
    return { margin: spacing[size] };
  }

  /**
   * Crea margin horizontal uniforme
   */
  static marginHorizontal(size: keyof SpoonThemeSpacing): ViewStyle {
    return { marginHorizontal: spacing[size] };
  }

  /**
   * Crea margin vertical uniforme
   */
  static marginVertical(size: keyof SpoonThemeSpacing): ViewStyle {
    return { marginVertical: spacing[size] };
  }

  /**
   * Combina padding y margin para crear espaciado completo
   */
  static paddingWithMargin(
    paddingSize: keyof SpoonThemeSpacing,
    marginSize: keyof SpoonThemeSpacing
  ): ViewStyle {
    return {
      padding: spacing[paddingSize],
      margin: spacing[marginSize],
    };
  }

  /**
   * Crea espaciado personalizado con valores específicos
   */
  static custom(config: {
    padding?: Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
      horizontal: number;
      vertical: number;
      all: number;
    }>;
    margin?: Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
      horizontal: number;
      vertical: number;
      all: number;
    }>;
  }): ViewStyle {
    const style: ViewStyle = {};

    if (config.padding) {
      const p = config.padding;
      if (p.all !== undefined) style.padding = p.all;
      if (p.horizontal !== undefined) style.paddingHorizontal = p.horizontal;
      if (p.vertical !== undefined) style.paddingVertical = p.vertical;
      if (p.top !== undefined) style.paddingTop = p.top;
      if (p.right !== undefined) style.paddingRight = p.right;
      if (p.bottom !== undefined) style.paddingBottom = p.bottom;
      if (p.left !== undefined) style.paddingLeft = p.left;
    }

    if (config.margin) {
      const m = config.margin;
      if (m.all !== undefined) style.margin = m.all;
      if (m.horizontal !== undefined) style.marginHorizontal = m.horizontal;
      if (m.vertical !== undefined) style.marginVertical = m.vertical;
      if (m.top !== undefined) style.marginTop = m.top;
      if (m.right !== undefined) style.marginRight = m.right;
      if (m.bottom !== undefined) style.marginBottom = m.bottom;
      if (m.left !== undefined) style.marginLeft = m.left;
    }

    return style;
  }

  /**
   * Obtiene valor de espaciado por nombre
   */
  static getValue(size: keyof SpoonThemeSpacing): number {
    return spacing[size];
  }

  /**
   * Obtiene valor extendido de espaciado
   */
  static getExtendedValue(size: keyof typeof extendedSpacing): number {
    return extendedSpacing[size];
  }
}

// ============================================================================
// UTILIDADES PARA ANIMACIONES
// ============================================================================

export const animationSpacing = {
  /**
   * Duración de transiciones basada en espaciado
   */
  getDuration: (distance: number): number => {
    // Base: 200ms para spacing.md (16px)
    const baseDuration = 200;
    const baseDistance = spacing.md;
    return Math.max(100, Math.min(500, (distance / baseDistance) * baseDuration));
  },

  /**
   * Configuraciones comunes de animación
   */
  presets: {
    quick: 150,     // Animaciones rápidas
    normal: 250,    // Animaciones normales
    slow: 400,      // Animaciones lentas
    drawer: 300,    // Para drawer/sidebar
    modal: 200,     // Para modales
    tab: 150,       // Para cambio de tabs
  },
} as const;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default spacing;
