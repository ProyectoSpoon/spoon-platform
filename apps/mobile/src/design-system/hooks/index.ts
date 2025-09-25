/**
 * Hooks Index para Spoon Design System
 * Exportaciones centralizadas de todos los hooks del design system
 */

// Theme hooks
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
  type ResponsiveValues,
  type ThemeProviderProps,
} from '../context/ThemeContext';

// Responsive hooks
export {
  useResponsive,
  useDeviceInfo,
  useOrientation,
  useDeviceType,
  useBreakpointValue,
  useResponsiveSpacing,
  useResponsiveTypography,
  createResponsiveStyle,
  type ResponsiveBreakpoints,
  type ResponsiveValue,
  type DeviceInfo,
  type ResponsiveHookReturn,
} from './useResponsive';

// Dark mode hooks
export {
  useDarkMode,
  useScheduledDarkMode,
  useThemeTransition,
  useThemePreferences,
  useDynamicColors,
  type DarkModeHookReturn,
  type DarkModePreferences,
} from './useDarkMode';

// Re-export theme types
export type { ThemeMode } from '../theme';
