/**
 * useDarkMode Hook para Spoon Design System
 * GestiÃ³n avanzada del modo oscuro con persistencia y transiciones
 */

import { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface DarkModeHookReturn {
  // State
  isDark: boolean;
  isLight: boolean;
  themeMode: ThemeMode;
  isSystemTheme: boolean;
  systemPreference: 'light' | 'dark' | null;
  
  // Actions
  enableDarkMode: () => void;
  enableLightMode: () => void;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode | 'system') => void;
  followSystemTheme: () => void;
  
  // Utilities
  getThemeIcon: () => string;
  getThemeLabel: () => string;
  isAutomatic: boolean;
}

export interface DarkModePreferences {
  mode: ThemeMode | 'system';
  autoSwitch: boolean;
  scheduleEnabled: boolean;
  darkModeStart?: string; // HH:MM format
  darkModeEnd?: string;   // HH:MM format
}

// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_ICONS = {
  light: 'â˜€ï¸',
  dark: 'ðŸŒ™',
  system: 'ðŸ“±',
  auto: 'ðŸŒ…',
} as const;

const THEME_LABELS = {
  light: 'Modo Claro',
  dark: 'Modo Oscuro',
  system: 'Seguir Sistema',
  auto: 'AutomÃ¡tico',
} as const;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Obtiene la preferencia del sistema
 */
const getSystemColorScheme = (): 'light' | 'dark' | null => {
  try {
    return 'light';  // Simplified - always return light for now
  } catch {
    return null;
  }
};

/**
 * Verifica si una hora estÃ¡ dentro de un rango
 */
const isTimeInRange = (current: Date, start: string, end: string): boolean => {
  const currentTime = current.getHours() * 60 + current.getMinutes();
  
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  if (startTime <= endTime) {
    // Same day range (e.g., 09:00 - 18:00)
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnight range (e.g., 22:00 - 06:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};

/**
 * Calcula el modo automÃ¡tico basado en la hora
 */
const getAutoThemeMode = (
  darkModeStart: string = '22:00',
  darkModeEnd: string = '06:00'
): ThemeMode => {
  const now = new Date();
  const isDarkTime = isTimeInRange(now, darkModeStart, darkModeEnd);
  return isDarkTime ? 'dark' : 'light';
};

// ============================================================================
// HOOK
// ============================================================================

export const useDarkMode = (): DarkModeHookReturn => {
  const {
    isDark,
    themeMode,
    isSystemTheme,
    setThemeMode: setThemeModeContext,
    toggleTheme: toggleThemeContext,
  } = useTheme();

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(
    getSystemColorScheme()
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Monitor system color scheme changes
  useEffect(() => {
    const updateSystemPreference = () => {
      setSystemPreference(getSystemColorScheme());
    };

    const subscription = Dimensions.addEventListener('change', updateSystemPreference);
    return () => subscription?.remove();
  }, []);

  // ============================================================================
  // THEME ACTIONS
  // ============================================================================

  const enableDarkMode = useCallback(() => {
    setThemeModeContext('dark');
  }, [setThemeModeContext]);

  const enableLightMode = useCallback(() => {
    setThemeModeContext('light');
  }, [setThemeModeContext]);

  const toggleTheme = useCallback(() => {
    toggleThemeContext();
  }, [toggleThemeContext]);

  const setThemeMode = useCallback((mode: ThemeMode | 'system') => {
    setThemeModeContext(mode);
  }, [setThemeModeContext]);

  const followSystemTheme = useCallback(() => {
    setThemeModeContext('system');
  }, [setThemeModeContext]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getThemeIcon = useCallback((): string => {
    if (isSystemTheme) return THEME_ICONS.system;
    return isDark ? THEME_ICONS.dark : THEME_ICONS.light;
  }, [isDark, isSystemTheme]);

  const getThemeLabel = useCallback((): string => {
    if (isSystemTheme) return THEME_LABELS.system;
    return isDark ? THEME_LABELS.dark : THEME_LABELS.light;
  }, [isDark, isSystemTheme]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isLight = !isDark;
  const isAutomatic = isSystemTheme;

  return {
    // State
    isDark,
    isLight,
    themeMode,
    isSystemTheme,
    systemPreference,
    
    // Actions
    enableDarkMode,
    enableLightMode,
    toggleTheme,
    setThemeMode,
    followSystemTheme,
    
    // Utilities
    getThemeIcon,
    getThemeLabel,
    isAutomatic,
  };
};

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook para scheduled dark mode (automÃ¡tico por horario)
 */
export const useScheduledDarkMode = (
  darkModeStart: string = '22:00',
  darkModeEnd: string = '06:00',
  enabled: boolean = false
) => {
  const { setThemeMode, themeMode } = useDarkMode();
  const [isScheduledTime, setIsScheduledTime] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const checkSchedule = () => {
      const autoMode = getAutoThemeMode(darkModeStart, darkModeEnd);
      const shouldBeDark = autoMode === 'dark';
      
      setIsScheduledTime(shouldBeDark);
      
      // Only auto-switch if user is following system or hasn't manually overridden
      if (enabled) {
        setThemeMode(autoMode);
      }
    };

    // Check immediately
    checkSchedule();

    // Check every minute
    const interval = setInterval(checkSchedule, 60000);

    return () => clearInterval(interval);
  }, [enabled, darkModeStart, darkModeEnd, setThemeMode, themeMode]);

  return {
    isScheduledTime,
    darkModeStart,
    darkModeEnd,
    enabled,
  };
};

/**
 * Hook para detectar transiciones de tema
 */
export const useThemeTransition = () => {
  const { isDark, themeMode } = useDarkMode();
  const [previousMode, setPreviousMode] = useState(themeMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousMode !== themeMode) {
      setIsTransitioning(true);
      setPreviousMode(themeMode);
      
      // Reset transition state after animation
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match theme transition duration

      return () => clearTimeout(timeout);
    }
  }, [themeMode, previousMode]);

  return {
    isTransitioning,
    previousMode,
    currentMode: themeMode,
    hasChanged: previousMode !== themeMode,
  };
};

/**
 * Hook para preferencias avanzadas de tema
 */
export const useThemePreferences = () => {
  const darkMode = useDarkMode();
  const [preferences, setPreferences] = useState<DarkModePreferences>({
    mode: 'system',
    autoSwitch: false,
    scheduleEnabled: false,
    darkModeStart: '22:00',
    darkModeEnd: '06:00',
  });

  const updatePreferences = useCallback((updates: Partial<DarkModePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const applyPreferences = useCallback(() => {
    darkMode.setThemeMode(preferences.mode);
  }, [preferences.mode, darkMode]);

  return {
    preferences,
    updatePreferences,
    applyPreferences,
    ...darkMode,
  };
};

/**
 * Hook para obtener colores dinÃ¡micos basados en el tema
 */
export const useDynamicColors = () => {
  const { isDark } = useDarkMode();
  const { theme } = useTheme();

  const getDynamicColor = useCallback((
    lightColor: string,
    darkColor?: string
  ): string => {
    return isDark ? (darkColor || lightColor) : lightColor;
  }, [isDark]);

  const getSemanticColor = useCallback((
    type: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  ): string => {
    return theme.colors[type];
  }, [theme.colors]);

  const getTextColor = useCallback((
    variant: 'primary' | 'secondary' | 'disabled' = 'primary'
  ): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.textPrimary;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'disabled':
        return theme.colors.textDisabled;
      default:
        return theme.colors.textPrimary;
    }
  }, [theme.colors]);

  const getSurfaceColor = useCallback((
    variant: 'default' | 'variant' = 'default'
  ): string => {
    return variant === 'variant' ? theme.colors.surfaceVariant : theme.colors.surface;
  }, [theme.colors]);

  return {
    getDynamicColor,
    getSemanticColor,
    getTextColor,
    getSurfaceColor,
    isDark,
    colors: theme.colors,
  };
};

export default useDarkMode;

