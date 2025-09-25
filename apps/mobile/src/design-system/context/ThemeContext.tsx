/**
 * Theme Context para Spoon Design System
 * Proveedor de tema global con soporte para dark mode y responsive design
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpoonTheme } from '../types';
import { spoonTheme, spoonDarkTheme, getTheme, type ThemeMode } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeContextValue {
  // Theme objects
  theme: SpoonTheme;
  lightTheme: SpoonTheme;
  darkTheme: SpoonTheme;
  
  // Theme state
  themeMode: ThemeMode;
  isDark: boolean;
  isSystemTheme: boolean;
  
  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
  
  // Theme actions
  setThemeMode: (mode: ThemeMode | 'system') => void;
  toggleTheme: () => void;
  resetToSystemTheme: () => void;
  
  // Utilities
  getResponsiveValue: <T>(values: ResponsiveValues<T>) => T;
  isTablet: boolean;
  isLandscape: boolean;
}

export interface ResponsiveValues<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode | 'system';
  persistTheme?: boolean;
  fallbackTheme?: ThemeMode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_STORAGE_KEY = '@spoon_theme_mode';

const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// THEME PROVIDER
// ============================================================================

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'system',
  persistTheme = true,
  fallbackTheme = 'light',
}) => {
  // System theme detection (simplified - defaults to light)
  const systemColorScheme = 'light';  // Removed ReactNative.useColorScheme() for now
  
  // Screen dimensions
  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });
  
  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode | 'system'>(initialTheme);
  const [isLoading, setIsLoading] = useState(persistTheme);

  // Derived state
  const isSystemTheme = themeMode === 'system';
  const effectiveThemeMode: ThemeMode = isSystemTheme 
    ? 'light'  // Always default to light when system
    : themeMode as ThemeMode;
  
  const isDark = effectiveThemeMode === 'dark';
  const theme = isDark ? spoonDarkTheme : spoonTheme;
  
  // Screen utilities
  const isTablet = screenData.width >= BREAKPOINTS.md;
  const isLandscape = screenData.width > screenData.height;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load persisted theme on mount
  useEffect(() => {
    if (!persistTheme) {
      setIsLoading(false);
      return;
    }

    const loadPersistedTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
          setThemeModeState(stored as ThemeMode | 'system');
        }
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
        setThemeModeState(fallbackTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedTheme();
  }, [persistTheme, fallbackTheme]);

  // Listen to screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  // ============================================================================
  // THEME ACTIONS
  // ============================================================================

  const setThemeMode = async (mode: ThemeMode | 'system') => {
    setThemeModeState(mode);
    
    if (persistTheme) {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (error) {
        console.warn('Failed to persist theme mode:', error);
      }
    }
  };

  const toggleTheme = () => {
    if (isSystemTheme) {
      // Si estÃ¡ en system, cambiar a dark mode
      const newMode = 'dark';  // Simplified toggle
      setThemeMode(newMode);
    } else {
      // Si estÃ¡ en manual, alternar
      const newMode = effectiveThemeMode === 'dark' ? 'light' : 'dark';
      setThemeMode(newMode);
    }
  };

  const resetToSystemTheme = () => {
    setThemeMode('system');
  };

  // ============================================================================
  // RESPONSIVE UTILITIES
  // ============================================================================

  const getResponsiveValue = <T,>(values: ResponsiveValues<T>): T => {
    const { width } = screenData;
    
    if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
    if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
    if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
    if (width >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
    if (values.xs !== undefined) return values.xs;
    
    // Fallback: return first defined value
    return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs as T;
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: ThemeContextValue = {
    // Theme objects
    theme,
    lightTheme: spoonTheme,
    darkTheme: spoonDarkTheme,
    
    // Theme state
    themeMode: effectiveThemeMode,
    isDark,
    isSystemTheme,
    
    // Screen dimensions
    screenWidth: screenData.width,
    screenHeight: screenData.height,
    
    // Theme actions
    setThemeMode,
    toggleTheme,
    resetToSystemTheme,
    
    // Utilities
    getResponsiveValue,
    isTablet,
    isLandscape,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while loading persisted theme
  if (isLoading) {
    return null; // O un componente de loading si prefieres
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Hook para obtener solo el objeto theme sin las utilidades adicionales
 */
export const useThemeObject = (): SpoonTheme => {
  const { theme } = useTheme();
  return theme;
};

/**
 * Hook para obtener solo los colores del tema actual
 */
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook para obtener solo las tipografÃ­as del tema actual
 */
export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook para obtener solo el espaciado del tema actual
 */
export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

/**
 * Hook para obtener solo las sombras del tema actual
 */
export const useShadows = () => {
  const { theme } = useTheme();
  return theme.shadows;
};

/**
 * Hook para obtener solo los radii del tema actual
 */
export const useRadii = () => {
  const { theme } = useTheme();
  return theme.radii;
};

/**
 * HOC para inyectar theme props en un componente
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: SpoonTheme }>
) => {
  return React.forwardRef<any, Omit<P, 'theme'>>((props, ref) => {
    const theme = useThemeObject();
    return <Component {...(props as any)} theme={theme} ref={ref} />;
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeProvider;

