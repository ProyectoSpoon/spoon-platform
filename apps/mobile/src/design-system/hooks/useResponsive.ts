/**
 * useResponsive Hook para Spoon Design System
 * Utilidades para diseño responsive y adaptación a diferentes tamaños de pantalla
 */

import { useState, useEffect } from 'react';
import { PixelRatio, Dimensions } from 'react-native';
import { useTheme, useSpacing, useTypography } from '../context/ThemeContext';

// ============================================================================
// TYPES
// ============================================================================

export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export interface DeviceInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isPhone: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  currentBreakpoint: keyof ResponsiveBreakpoints;
  pixelRatio: number;
  fontScale: number;
}

export interface ResponsiveHookReturn extends DeviceInfo {
  // Responsive utilities
  getValue: <T>(values: ResponsiveValue<T>) => T | undefined;
  getValueWithFallback: <T>(values: ResponsiveValue<T>, fallback: T) => T;
  
  // Breakpoint checkers
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  
  // Size checkers
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  
  // Orientation utilities
  onLandscape: <T>(value: T) => T | undefined;
  onPortrait: <T>(value: T) => T | undefined;
  
  // Platform utilities
  onTablet: <T>(value: T) => T | undefined;
  onPhone: <T>(value: T) => T | undefined;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Determina el breakpoint actual basado en el ancho
 */
const getCurrentBreakpoint = (
  width: number, 
  breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
): keyof ResponsiveBreakpoints => {
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Determina si el dispositivo es tablet basado en el tamaño
 */
const getIsTablet = (width: number, height: number): boolean => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // Lógica mejorada para detectar tablets
  return (
    minDimension >= 600 && // Al menos 600px en la dimensión menor
    (maxDimension / minDimension) < 1.6 // Ratio de aspecto no muy alargado
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useResponsive = (
  customBreakpoints?: Partial<ResponsiveBreakpoints>
): ResponsiveHookReturn => {
  const { screenWidth, screenHeight } = useTheme();
  
  // Merge custom breakpoints with defaults
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };
  
  // Get pixel ratio and font scale
  const [deviceMetrics, setDeviceMetrics] = useState(() => ({
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
  }));

  // Update device metrics if they change
  useEffect(() => {
    const updateMetrics = () => {
      setDeviceMetrics({
        pixelRatio: PixelRatio.get(),
        fontScale: PixelRatio.getFontScale(),
      });
    };

    // Listen for font scale changes (accessibility)
    const subscription = Dimensions.addEventListener('change', updateMetrics);
    return () => subscription?.remove();
  }, []);

  // Derived values
  const isLandscape = screenWidth > screenHeight;
  const isPortrait = !isLandscape;
  const isTablet = getIsTablet(screenWidth, screenHeight);
  const isPhone = !isTablet;
  const currentBreakpoint = getCurrentBreakpoint(screenWidth, breakpoints);
  
  // Breakpoint checkers
  const isXs = currentBreakpoint === 'xs';
  const isSm = currentBreakpoint === 'sm';
  const isMd = currentBreakpoint === 'md';
  const isLg = currentBreakpoint === 'lg';
  const isXl = currentBreakpoint === 'xl';
  
  // Size categories
  const isSmallScreen = isXs || isSm;
  const isMediumScreen = isMd;
  const isLargeScreen = isLg || isXl;

  // ============================================================================
  // RESPONSIVE UTILITIES
  // ============================================================================

  const getValue = <T,>(values: ResponsiveValue<T>): T | undefined => {
    if (screenWidth >= breakpoints.xl && values.xl !== undefined) return values.xl;
    if (screenWidth >= breakpoints.lg && values.lg !== undefined) return values.lg;
    if (screenWidth >= breakpoints.md && values.md !== undefined) return values.md;
    if (screenWidth >= breakpoints.sm && values.sm !== undefined) return values.sm;
    if (values.xs !== undefined) return values.xs;
    
    return undefined;
  };

  const getValueWithFallback = <T,>(values: ResponsiveValue<T>, fallback: T): T => {
    return getValue(values) ?? fallback;
  };

  // ============================================================================
  // CONDITIONAL UTILITIES
  // ============================================================================

  const onLandscape = <T,>(value: T): T | undefined => {
    return isLandscape ? value : undefined;
  };

  const onPortrait = <T,>(value: T): T | undefined => {
    return isPortrait ? value : undefined;
  };

  const onTablet = <T,>(value: T): T | undefined => {
    return isTablet ? value : undefined;
  };

  const onPhone = <T,>(value: T): T | undefined => {
    return isPhone ? value : undefined;
  };

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // Device info
    width: screenWidth,
    height: screenHeight,
    isTablet,
    isPhone,
    isLandscape,
    isPortrait,
    currentBreakpoint,
    pixelRatio: deviceMetrics.pixelRatio,
    fontScale: deviceMetrics.fontScale,
    
    // Responsive utilities
    getValue,
    getValueWithFallback,
    
    // Breakpoint checkers
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Size checkers
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Conditional utilities
    onLandscape,
    onPortrait,
    onTablet,
    onPhone,
  };
};

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook para obtener solo información del dispositivo
 */
export const useDeviceInfo = (): DeviceInfo => {
  const responsive = useResponsive();
  
  return {
    width: responsive.width,
    height: responsive.height,
    isTablet: responsive.isTablet,
    isPhone: responsive.isPhone,
    isLandscape: responsive.isLandscape,
    isPortrait: responsive.isPortrait,
    currentBreakpoint: responsive.currentBreakpoint,
    pixelRatio: responsive.pixelRatio,
    fontScale: responsive.fontScale,
  };
};

/**
 * Hook para detectar cambios de orientación
 */
export const useOrientation = () => {
  const { isLandscape, isPortrait } = useResponsive();
  
  return {
    isLandscape,
    isPortrait,
    orientation: isLandscape ? 'landscape' : 'portrait' as const,
  };
};

/**
 * Hook para detectar el tipo de dispositivo
 */
export const useDeviceType = () => {
  const { isTablet, isPhone, currentBreakpoint } = useResponsive();
  
  return {
    isTablet,
    isPhone,
    isMobile: isPhone, // Alias
    deviceType: isTablet ? 'tablet' : 'phone' as const,
    breakpoint: currentBreakpoint,
  };
};

/**
 * Hook para obtener valores responsive con sintaxis más simple
 */
export const useBreakpointValue = <T>(values: ResponsiveValue<T>, fallback?: T): T | undefined => {
  const { getValue, getValueWithFallback } = useResponsive();
  
  if (fallback !== undefined) {
    return getValueWithFallback(values, fallback);
  }
  
  return getValue(values);
};

// ============================================================================
// UTILITIES FOR COMPONENTS
// ============================================================================

/**
 * Crea un objeto de estilos responsive
 */
export const createResponsiveStyle = <T>(
  values: ResponsiveValue<T>,
  screenWidth: number,
  breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
): T | undefined => {
  if (screenWidth >= breakpoints.xl && values.xl !== undefined) return values.xl;
  if (screenWidth >= breakpoints.lg && values.lg !== undefined) return values.lg;
  if (screenWidth >= breakpoints.md && values.md !== undefined) return values.md;
  if (screenWidth >= breakpoints.sm && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  return undefined;
};

/**
 * Utility para crear padding/margin responsive
 */
export const useResponsiveSpacing = () => {
  const spacing = useSpacing();
  const { getValue, getValueWithFallback } = useResponsive();
  
  const getSpacing = (values: ResponsiveValue<keyof typeof spacing>) => {
    const key = getValue(values) || 'md';
    return spacing[key];
  };
  
  const getSpacingWithFallback = (
    values: ResponsiveValue<keyof typeof spacing>,
    fallback: keyof typeof spacing = 'md'
  ) => {
    const key = getValueWithFallback(values, fallback);
    return spacing[key];
  };
  
  return {
    getSpacing,
    getSpacingWithFallback,
  };
};

/**
 * Utility para crear typography responsive
 */
export const useResponsiveTypography = () => {
  const typography = useTypography();
  const { getValue, getValueWithFallback } = useResponsive();
  
  const getTypography = (values: ResponsiveValue<keyof typeof typography>) => {
    const key = getValue(values);
    return key ? typography[key] : undefined;
  };
  
  const getTypographyWithFallback = (
    values: ResponsiveValue<keyof typeof typography>,
    fallback: keyof typeof typography = 'bodyMedium'
  ) => {
    const key = getValueWithFallback(values, fallback);
    return typography[key];
  };
  
  return {
    getTypography,
    getTypographyWithFallback,
  };
};

export default useResponsive;
