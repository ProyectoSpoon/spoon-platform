/**
 * Sistema de Tipografías para Spoon Design System
 * Basado en Material Design 3 con personalizaciones para la marca
 * Portado desde Flutter para consistencia cross-platform
 */

import { SpoonThemeTypography, TextStyle } from '../types';
import { SpoonColors } from './colors';

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

/**
 * Familia de fuentes principal de la aplicación
 */
const FONT_FAMILY = 'Roboto';

/**
 * Configuración de tipografías del sistema
 */
export class SpoonTypography {
  private constructor() {}

  // ==========================================================================
  // ESTILOS DISPLAY - Para títulos muy grandes
  // ==========================================================================

  /**
   * Estilo display large - Para títulos muy grandes (57px)
   */
  static readonly displayLarge: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: -0.25,
    lineHeight: 64, // 57 * 1.12
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo display medium - Para títulos grandes (45px)
   */
  static readonly displayMedium: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52, // 45 * 1.16
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo display small - Para títulos medianos (36px)
   */
  static readonly displaySmall: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44, // 36 * 1.22
    color: SpoonColors.textPrimary,
  };

  // ==========================================================================
  // ESTILOS HEADLINE - Para títulos de secciones
  // ==========================================================================

  /**
   * Estilo headline large - Para títulos de secciones principales (32px)
   */
  static readonly headlineLarge: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 40, // 32 * 1.25
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo headline medium - Para títulos de secciones (28px)
   */
  static readonly headlineMedium: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 36, // 28 * 1.29
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo headline small - Para subtítulos importantes (24px)
   */
  static readonly headlineSmall: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 32, // 24 * 1.33
    color: SpoonColors.textPrimary,
  };

  // ==========================================================================
  // ESTILOS TITLE - Para títulos de componentes
  // ==========================================================================

  /**
   * Estilo title large - Para títulos de cards principales (22px)
   */
  static readonly titleLarge: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28, // 22 * 1.27
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo title medium - Para títulos de componentes (16px)
   */
  static readonly titleMedium: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24, // 16 * 1.50
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo title small - Para títulos pequeños (14px)
   */
  static readonly titleSmall: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20, // 14 * 1.43
    color: SpoonColors.textPrimary,
  };

  // ==========================================================================
  // ESTILOS LABEL - Para etiquetas y botones
  // ==========================================================================

  /**
   * Estilo label large - Para etiquetas y botones grandes (14px)
   */
  static readonly labelLarge: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20, // 14 * 1.43
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo label medium - Para etiquetas medianas (12px)
   */
  static readonly labelMedium: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16, // 12 * 1.33
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo label small - Para etiquetas pequeñas (11px)
   */
  static readonly labelSmall: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16, // 11 * 1.45
    color: SpoonColors.textPrimary,
  };

  // ==========================================================================
  // ESTILOS BODY - Para contenido de texto
  // ==========================================================================

  /**
   * Estilo body large - Para texto de contenido principal (16px)
   */
  static readonly bodyLarge: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24, // 16 * 1.50
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo body medium - Para texto de contenido general (14px)
   */
  static readonly bodyMedium: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20, // 14 * 1.43
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo body small - Para texto secundario y detalles (12px)
   */
  static readonly bodySmall: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16, // 12 * 1.33
    color: SpoonColors.textSecondary,
  };

  // ==========================================================================
  // ESTILOS PERSONALIZADOS DE SPOON
  // ==========================================================================

  /**
   * Estilo personalizado para el título principal de Spoon
   */
  static readonly spoonTitle: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34, // 28 * 1.2
    color: SpoonColors.primary,
  };

  /**
   * Estilo personalizado para subtítulos de Spoon
   */
  static readonly spoonSubtitle: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 22, // 16 * 1.4
    color: SpoonColors.textSecondary,
  };

  /**
   * Estilo para mostrar precios
   */
  static readonly priceText: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 22, // 18 * 1.2
    color: SpoonColors.primary,
  };

  /**
   * Estilo para mostrar calificaciones
   */
  static readonly ratingText: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 17, // 14 * 1.2
    color: SpoonColors.warning,
  };

  /**
   * Estilo para categorías de productos
   */
  static readonly categoryText: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 14, // 12 * 1.2
    color: SpoonColors.textSecondary,
  };

  /**
   * Estilo para texto de botones
   */
  static readonly buttonText: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 17, // 14 * 1.2
    color: SpoonColors.textOnPrimary,
  };

  /**
   * Estilo para títulos de tarjetas
   */
  static readonly cardTitle: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 21, // 16 * 1.3
    color: SpoonColors.textPrimary,
  };

  /**
   * Estilo para subtítulos de tarjetas
   */
  static readonly cardSubtitle: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20, // 14 * 1.4
    color: SpoonColors.textSecondary,
  };

  // ==========================================================================
  // MÉTODOS UTILITARIOS
  // ==========================================================================

  /**
   * Aplica un color personalizado a un estilo de texto
   */
  static withColor(style: TextStyle, color: string): TextStyle {
    return { ...style, color };
  }

  /**
   * Aplica un peso de fuente personalizado a un estilo de texto
   */
  static withWeight(style: TextStyle, weight: TextStyle['fontWeight']): TextStyle {
    return { ...style, fontWeight: weight };
  }

  /**
   * Aplica un tamaño de fuente personalizado a un estilo de texto
   */
  static withSize(style: TextStyle, size: number): TextStyle {
    return { ...style, fontSize: size };
  }

  /**
   * Adapta un estilo para usar sobre color primario
   */
  static onPrimary(style: TextStyle): TextStyle {
    return { ...style, color: SpoonColors.textOnPrimary };
  }

  /**
   * Adapta un estilo para usar sobre color secundario
   */
  static onSecondary(style: TextStyle): TextStyle {
    return { ...style, color: SpoonColors.textOnSecondary };
  }

  /**
   * Adapta un estilo para estado deshabilitado
   */
  static disabled(style: TextStyle): TextStyle {
    return { ...style, color: SpoonColors.textDisabled };
  }
}

// ============================================================================
// CONFIGURACIÓN DEL SISTEMA DE TIPOGRAFÍAS
// ============================================================================

/**
 * Configuración de tipografías exportada para el tema
 */
export const typography: SpoonThemeTypography = {
  displayLarge: SpoonTypography.displayLarge,
  displayMedium: SpoonTypography.displayMedium,
  displaySmall: SpoonTypography.displaySmall,
  headlineLarge: SpoonTypography.headlineLarge,
  headlineMedium: SpoonTypography.headlineMedium,
  headlineSmall: SpoonTypography.headlineSmall,
  titleLarge: SpoonTypography.titleLarge,
  titleMedium: SpoonTypography.titleMedium,
  titleSmall: SpoonTypography.titleSmall,
  labelLarge: SpoonTypography.labelLarge,
  labelMedium: SpoonTypography.labelMedium,
  labelSmall: SpoonTypography.labelSmall,
  bodyLarge: SpoonTypography.bodyLarge,
  bodyMedium: SpoonTypography.bodyMedium,
  bodySmall: SpoonTypography.bodySmall,
};

// ============================================================================
// TIPOGRAFÍAS ESPECÍFICAS PARA FOOD DELIVERY
// ============================================================================

export const foodDeliveryTypography = {
  // Restaurant names and info
  restaurantName: SpoonTypography.titleLarge,
  restaurantInfo: SpoonTypography.bodyMedium,
  restaurantRating: SpoonTypography.ratingText,
  
  // Food items
  foodName: SpoonTypography.cardTitle,
  foodDescription: SpoonTypography.cardSubtitle,
  foodPrice: SpoonTypography.priceText,
  
  // Categories
  categoryTitle: SpoonTypography.titleMedium,
  categoryLabel: SpoonTypography.categoryText,
  
  // Search
  searchPlaceholder: SpoonTypography.bodyMedium,
  searchSuggestion: SpoonTypography.bodyMedium,
  
  // Forms
  inputLabel: SpoonTypography.labelMedium,
  inputText: SpoonTypography.bodyMedium,
  inputError: SpoonTypography.labelSmall,
  
  // Buttons
  primaryButton: SpoonTypography.buttonText,
  secondaryButton: SpoonTypography.labelLarge,
  
  // Navigation
  tabLabel: SpoonTypography.labelMedium,
  headerTitle: SpoonTypography.titleLarge,
} as const;

// ============================================================================
// UTILIDADES PARA FOOD DELIVERY
// ============================================================================

/**
 * Obtiene estilo de tipografía para precios con formato
 */
export const getPriceStyle = (isDiscounted: boolean = false): TextStyle => {
  return isDiscounted
    ? {
        ...SpoonTypography.priceText,
        textDecorationLine: 'line-through',
        color: SpoonColors.textSecondary,
        fontSize: 14,
      }
    : SpoonTypography.priceText;
};

/**
 * Obtiene estilo para calificaciones con color dinámico
 */
export const getRatingStyle = (rating: number): TextStyle => {
  let color = SpoonColors.textSecondary;
  
  if (rating >= 4.5) {
    color = SpoonColors.success;
  } else if (rating >= 4.0) {
    color = SpoonColors.warning;
  } else if (rating >= 3.0) {
    color = SpoonColors.info;
  } else {
    color = SpoonColors.error;
  }
  
  return {
    ...SpoonTypography.ratingText,
    color,
  };
};

/**
 * Obtiene estilo para estado de disponibilidad
 */
export const getAvailabilityStyle = (isAvailable: boolean): TextStyle => {
  return {
    ...SpoonTypography.labelSmall,
    color: isAvailable ? SpoonColors.success : SpoonColors.error,
    fontWeight: '600',
  };
};

// ============================================================================
// ESCALAS DE TIPOGRAFÍA RESPONSIVE
// ============================================================================

export const responsiveTypography = {
  /**
   * Ajusta tamaño de fuente según el ancho de pantalla
   */
  getResponsiveSize: (baseSize: number, screenWidth: number): number => {
    if (screenWidth < 350) {
      return baseSize * 0.9; // 10% más pequeño en pantallas muy pequeñas
    } else if (screenWidth > 400) {
      return baseSize * 1.1; // 10% más grande en pantallas grandes
    }
    return baseSize;
  },

  /**
   * Obtiene estilo responsive
   */
  getResponsiveStyle: (baseStyle: TextStyle, screenWidth: number): TextStyle => {
    const fontSize = baseStyle.fontSize || 14;
    return {
      ...baseStyle,
      fontSize: responsiveTypography.getResponsiveSize(fontSize, screenWidth),
    };
  },
};

// ============================================================================
// CONSTANTES DE TIPOGRAFÍA
// ============================================================================

export const typographyConstants = {
  fontFamily: FONT_FAMILY,
  fontWeights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeightMultipliers: {
    tight: 1.2,
    normal: 1.4,
    loose: 1.6,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
  },
} as const;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default typography;
