// src/design-system/theme/colors.ts

/**
 * Sistema de colores de Spoon
 * Basado en la paleta de colores definida en la documentación
 * Ported from Flutter version
 */

/**
 * Clase principal de colores de Spoon
 */
export class SpoonColors {
  private constructor() {}

  // ============================================================================
  // COLORES PRINCIPALES
  // ============================================================================

  /** Color principal de la marca Spoon - Naranja vibrante */
  static readonly primary = '#F4982B';
  
  /** Color secundario - Marrón chocolate que complementa el primary */
  static readonly secondary = '#8B4513';
  
  /** Variación clara del color principal */
  static readonly primaryLight = '#F7B366';
  
  /** Variación oscura del color principal */
  static readonly primaryDark = '#E67E22';
  
  /** Variación clara del color secundario */
  static readonly secondaryLight = '#A0522D';
  
  /** Variación oscura del color secundario */
  static readonly secondaryDark = '#654321';

  // ============================================================================
  // COLORES SEMÁNTICOS
  // ============================================================================

  /** Color para indicar éxito o estados positivos */
  static readonly success = '#27AE60';
  
  /** Color para advertencias */
  static readonly warning = '#F39C12';
  
  /** Color para errores o estados negativos */
  static readonly error = '#E74C3C';
  
  /** Color para información general */
  static readonly info = '#3498DB';

  // ============================================================================
  // COLORES BASE
  // ============================================================================

  /** Color blanco puro */
  static readonly white = '#FFFFFF';
  
  /** Color negro puro */
  static readonly black = '#000000';

  // ============================================================================
  // ESCALA DE GRISES (Material Design)
  // ============================================================================

  /** Gris muy claro - 50 */
  static readonly grey50 = '#FAFAFA';
  
  /** Gris muy claro - 100 */
  static readonly grey100 = '#F5F5F5';
  
  /** Gris claro - 200 */
  static readonly grey200 = '#EEEEEE';
  
  /** Gris claro - 300 */
  static readonly grey300 = '#E0E0E0';
  
  /** Gris medio claro - 400 */
  static readonly grey400 = '#BDBDBD';
  
  /** Gris medio - 500 */
  static readonly grey500 = '#9E9E9E';
  
  /** Gris medio oscuro - 600 */
  static readonly grey600 = '#757575';
  
  /** Gris oscuro - 700 */
  static readonly grey700 = '#616161';
  
  /** Gris muy oscuro - 800 */
  static readonly grey800 = '#424242';
  
  /** Gris casi negro - 900 */
  static readonly grey900 = '#212121';

  // ============================================================================
  // COLORES DE SUPERFICIE Y FONDO
  // ============================================================================

  /** Color de superficie principal */
  static readonly surface = '#FFFFFF';
  
  /** Variante del color de superficie */
  static readonly surfaceVariant = '#F5F5F5';
  
  /** Color de fondo principal */
  static readonly background = '#FAFAFA';

  // ============================================================================
  // COLORES DE TEXTO
  // ============================================================================

  /** Color de texto principal */
  static readonly textPrimary = '#212121';
  
  /** Color de texto secundario */
  static readonly textSecondary = '#757575';
  
  /** Color de texto deshabilitado */
  static readonly textDisabled = '#BDBDBD';
  
  /** Color de texto sobre color principal */
  static readonly textOnPrimary = '#FFFFFF';
  
  /** Color de texto sobre color secundario */
  static readonly textOnSecondary = '#FFFFFF';

  // ============================================================================
  // COLORES ESPECIALES
  // ============================================================================

  /** Color de fondo para tarjetas */
  static readonly cardBackground = '#FFFFFF';
  
  /** Color de sombra para tarjetas (derivado con utilidad) */
  static readonly cardShadow = SpoonColors.withOpacity(SpoonColors.black, 0.1);
  
  /** Color para divisores */
  static readonly divider = '#E0E0E0';
  
  /** Color de borde principal */
  static readonly border = '#E0E0E0';
  
  /** Color de borde claro */
  static readonly borderLight = '#F0F0F0';
  
  /** Color de outline */
  static readonly outline = '#BDBDBD';
  
  /** Color para efectos de shimmer */
  static readonly shimmer = '#F0F0F0';
  
  /** Color de overlay (derivado con utilidad) */
  static readonly overlay = SpoonColors.withOpacity(SpoonColors.black, 0.5);

  // ============================================================================
  // UTILIDADES DE COLOR
  // ============================================================================

  /**
   * Aplica opacidad a un color hexadecimal
   * @param color Color en formato hexadecimal
   * @param opacity Opacidad entre 0 y 1
   * @returns Color con opacidad aplicada en formato rgba
   */
  static withOpacity(color: string, opacity: number): string {
    if (opacity < 0 || opacity > 1) {
      throw new Error('Opacity must be between 0 and 1');
    }
    
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Oscurece un color por el porcentaje especificado
   * @param color Color en formato hexadecimal
   * @param amount Cantidad a oscurecer (0-1)
   * @returns Color oscurecido
   */
  static darken(color: string, amount: number = 0.1): string {
    if (amount < 0 || amount > 1) {
      throw new Error('Amount must be between 0 and 1');
    }

    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) * (1 - amount));
    
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Aclara un color por el porcentaje especificado
   * @param color Color en formato hexadecimal
   * @param amount Cantidad a aclarar (0-1)
   * @returns Color aclarado
   */
  static lighten(color: string, amount: number = 0.1): string {
    if (amount < 0 || amount > 1) {
      throw new Error('Amount must be between 0 and 1');
    }

    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + (255 * amount));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + (255 * amount));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + (255 * amount));
    
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Convierte un color a formato RGB
   * @param color Color en formato hexadecimal
   * @returns Objeto con valores r, g, b
   */
  static toRgb(color: string): { r: number; g: number; b: number } {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  /**
   * Obtiene el color de contraste adecuado (blanco o negro) para un color dado
   * @param backgroundColor Color de fondo
   * @returns Color de texto que contrasta
   */
  static getContrastColor(backgroundColor: string): string {
    const { r, g, b } = this.toRgb(backgroundColor);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? this.black : this.white;
  }
}

// ============================================================================
// CONFIGURACIONES DE GRADIENTES
// ============================================================================

export interface GradientConfig {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
}

/**
 * Gradientes predefinidos de Spoon
 */
export class SpoonGradients {
  private constructor() {}

  /** Gradiente principal de la aplicación */
  static readonly primary: GradientConfig = {
    colors: [SpoonColors.primary, SpoonColors.primaryDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  /** Gradiente secundario de la aplicación */
  static readonly secondary: GradientConfig = {
    colors: [SpoonColors.secondary, SpoonColors.secondaryDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  /** Gradiente para workspace o áreas de trabajo */
  static readonly workspace: GradientConfig = {
    colors: [SpoonColors.secondary, SpoonColors.primary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  /** Gradiente suave para fondos */
  static readonly subtle: GradientConfig = {
    colors: [SpoonColors.white, SpoonColors.grey50],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  };

  /** Gradiente de éxito */
  static readonly success: GradientConfig = {
    colors: [SpoonColors.success, SpoonColors.darken(SpoonColors.success, 0.2)],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  /** Gradiente de error */
  static readonly error: GradientConfig = {
    colors: [SpoonColors.error, SpoonColors.darken(SpoonColors.error, 0.2)],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };
}

// ============================================================================
// EXPORTACIONES LEGACY (compatibilidad con código existente)
// ============================================================================

/**
 * Objeto de colores para compatibilidad con el sistema actual
 */
export const spoonColors = {
  // Primary colors
  primary: SpoonColors.primary,
  primaryLight: SpoonColors.primaryLight,
  primaryDark: SpoonColors.primaryDark,
  
  // Secondary colors
  secondary: SpoonColors.secondary,
  secondaryLight: SpoonColors.secondaryLight,
  secondaryDark: SpoonColors.secondaryDark,
  
  // Semantic colors
  success: SpoonColors.success,
  warning: SpoonColors.warning,
  error: SpoonColors.error,
  info: SpoonColors.info,
  
  // Base colors
  white: SpoonColors.white,
  black: SpoonColors.black,
  surface: SpoonColors.surface,
  surfaceVariant: SpoonColors.surfaceVariant,
  background: SpoonColors.background,
  
  // Text colors
  textPrimary: SpoonColors.textPrimary,
  textSecondary: SpoonColors.textSecondary,
  textDisabled: SpoonColors.textDisabled,
  textOnPrimary: SpoonColors.textOnPrimary,
  textOnSecondary: SpoonColors.textOnSecondary,
  
  // Border and divider colors
  border: SpoonColors.border,
  borderLight: SpoonColors.borderLight,
  divider: SpoonColors.divider,
  outline: SpoonColors.outline,
  
  // Special colors
  shimmer: SpoonColors.shimmer,
  cardShadow: SpoonColors.cardShadow,
  overlay: SpoonColors.overlay,
  
  // Grays
  grey50: SpoonColors.grey50,
  grey100: SpoonColors.grey100,
  grey200: SpoonColors.grey200,
  grey300: SpoonColors.grey300,
  grey400: SpoonColors.grey400,
  grey500: SpoonColors.grey500,
  grey600: SpoonColors.grey600,
  grey700: SpoonColors.grey700,
  grey800: SpoonColors.grey800,
  grey900: SpoonColors.grey900,
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Colors object compatible with theme system
 */
export const colors = spoonColors;

// Export por defecto
export default SpoonColors;
