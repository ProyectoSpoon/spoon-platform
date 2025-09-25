/**
 * Spoon Design System Theme
 * Tema principal que combina colores, tipografías, espaciado y sombras
 */

import { SpoonTheme } from '../types';
import { colors, SpoonColors } from './colors';
import typography, { SpoonTypography } from './typography';
import spacing, { SpoonSpacing } from './spacing';
import shadows, { SpoonShadows } from './shadows';
import radii, { SpoonRadii } from './radii';

// ============================================================================
// TEMA PRINCIPAL
// ============================================================================

/**
 * Tema principal de Spoon Design System
 * Combina todos los tokens de diseño en una configuración unificada
 */
export const spoonTheme: SpoonTheme = {
  colors,
  typography,
  spacing,
  shadows,
  radii,
};

// ============================================================================
// TEMA DARK MODE
// ============================================================================

/**
 * Variante dark del tema principal
 */
export const spoonDarkTheme: SpoonTheme = {
  colors: {
    ...colors,
    // Override colors for dark theme
    background: SpoonColors.grey900,
    surface: SpoonColors.grey800,
    surfaceVariant: SpoonColors.grey700,
    textPrimary: SpoonColors.white,
    textSecondary: SpoonColors.grey300,
    border: SpoonColors.grey600,
    borderLight: SpoonColors.grey700,
    divider: SpoonColors.grey600,
    outline: SpoonColors.grey500,
  },
  typography: {
    ...typography,
    // Override typography colors for dark theme
    displayLarge: { ...typography.displayLarge, color: SpoonColors.white },
    displayMedium: { ...typography.displayMedium, color: SpoonColors.white },
    displaySmall: { ...typography.displaySmall, color: SpoonColors.white },
    headlineLarge: { ...typography.headlineLarge, color: SpoonColors.white },
    headlineMedium: { ...typography.headlineMedium, color: SpoonColors.white },
    headlineSmall: { ...typography.headlineSmall, color: SpoonColors.white },
    titleLarge: { ...typography.titleLarge, color: SpoonColors.white },
    titleMedium: { ...typography.titleMedium, color: SpoonColors.white },
    titleSmall: { ...typography.titleSmall, color: SpoonColors.white },
    labelLarge: { ...typography.labelLarge, color: SpoonColors.white },
    labelMedium: { ...typography.labelMedium, color: SpoonColors.white },
    labelSmall: { ...typography.labelSmall, color: SpoonColors.white },
    bodyLarge: { ...typography.bodyLarge, color: SpoonColors.white },
    bodyMedium: { ...typography.bodyMedium, color: SpoonColors.white },
    bodySmall: { ...typography.bodySmall, color: SpoonColors.grey300 },
  },
  spacing,
  radii,
  shadows: {
    ...shadows,
    // Enhanced shadows for dark theme
    sm: { ...shadows.sm, shadowOpacity: 0.3, elevation: 3 },
    md: { ...shadows.md, shadowOpacity: 0.4, elevation: 6 },
    lg: { ...shadows.lg, shadowOpacity: 0.5, elevation: 12 },
    xl: { ...shadows.xl, shadowOpacity: 0.6, elevation: 18 },
  },
};

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Obtiene el tema apropiado según el modo
 */
export const getTheme = (isDark: boolean): SpoonTheme => {
  return isDark ? spoonDarkTheme : spoonTheme;
};

/**
 * Tipo para los themes disponibles
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Configuración de themes por modo
 */
export const themes: Record<ThemeMode, SpoonTheme> = {
  light: spoonTheme,
  dark: spoonDarkTheme,
};

// ============================================================================
// THEME CONSTANTS
// ============================================================================

/**
 * Constantes relacionadas al tema
 */
export const themeConstants = {
  // Duración de transiciones de theme
  transitionDuration: 300,
  
  // Breakpoints para responsive design
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
  
  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 100,
    overlay: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },
  
  // Animation durations
  animation: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 700,
  },
} as const;

// ============================================================================
// THEME HELPERS
// ============================================================================

/**
 * Helper para crear estilos responsive
 */
export const createResponsiveStyle = <T>(
  styles: Partial<Record<keyof typeof themeConstants.breakpoints, T>>,
  screenWidth: number
): T | undefined => {
  const breakpoints = themeConstants.breakpoints;
  
  if (screenWidth >= breakpoints.xl && styles.xl) return styles.xl;
  if (screenWidth >= breakpoints.lg && styles.lg) return styles.lg;
  if (screenWidth >= breakpoints.md && styles.md) return styles.md;
  if (screenWidth >= breakpoints.sm && styles.sm) return styles.sm;
  if (styles.xs) return styles.xs;
  
  return undefined;
};

/**
 * Helper para interpolar colores
 */
export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  // Simplified color interpolation
  // In a real implementation, you'd use a proper color interpolation library
  return factor < 0.5 ? color1 : color2;
};

// ============================================================================
// EXPORTS
// ============================================================================

// Export main classes for direct use
export { SpoonColors, SpoonTypography, SpoonSpacing, SpoonShadows, SpoonRadii };

// Export types
export type { SpoonTheme } from '../types';

// Export individual systems
export { colors } from './colors';
export { default as typography } from './typography';
export { default as spacing } from './spacing';
export { default as shadows } from './shadows';
export { default as radii } from './radii';

// Export theme as default
export default spoonTheme;
