/**
 * Spoon Design System - Main Index
 * Punto de entrada principal para todo el design system
 */

// ============================================================================
// THEME SYSTEM
// ============================================================================

// Main theme exports
export {
  spoonTheme,
  spoonDarkTheme,
  getTheme,
  themes,
  themeConstants,
  interpolateColor,
  type ThemeMode,
  type SpoonTheme,
} from './theme';

// Individual theme systems
export * from './theme/colors';
export * from './theme/typography';
export * from './theme/spacing';
export * from './theme/shadows';
export * from './theme/radii';

// ============================================================================
// CONTEXT & HOOKS
// ============================================================================

// Context exports
export {
  ThemeProvider,
  useTheme,
  useThemeObject,
  useColors,
  useTypography,
  useSpacing,
  useShadows,
  useRadii,
  withTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
} from './context/ThemeContext';

// Hook exports
export {
  useResponsive,
  useDeviceInfo,
  useOrientation,
  useDeviceType,
  useBreakpointValue,
  useResponsiveSpacing,
  useResponsiveTypography,
  type ResponsiveBreakpoints,
  type DeviceInfo,
  type ResponsiveHookReturn,
} from './hooks/useResponsive';

export {
  useDarkMode,
  useScheduledDarkMode,
  useThemeTransition,
  useThemePreferences,
  useDynamicColors,
  type DarkModeHookReturn,
  type DarkModePreferences,
} from './hooks/useDarkMode';

// ============================================================================
// COMPONENTS
// ============================================================================

export * from './components';

// ============================================================================
// TYPES (only non-conflicting exports)
// ============================================================================

export type {
  BaseComponentProps,
  ResponsiveValue,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from './types';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Version del design system
 */
export const DESIGN_SYSTEM_VERSION = '1.0.0';

/**
 * Información del design system
 */
export const DESIGN_SYSTEM_INFO = {
  name: 'Spoon Design System',
  version: DESIGN_SYSTEM_VERSION,
  description: 'Sistema de diseño empresarial para aplicaciones de food delivery',
  author: 'Spoon Team',
  license: 'MIT',
  repository: 'https://github.com/ProyectoSpoon/spoon-platform',
} as const;
