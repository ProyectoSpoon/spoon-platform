/**
 * SPOON Design System - Color Tokens
 * Central source of truth for brand, neutral and semantic palettes.
 */

export const colors = {
  brand: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  semantic: {
    success: {
      light: '#dcfce7',
      base: '#10b981',
      dark: '#047857',
    },
    warning: {
      light: '#fef3c7',
      base: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#fee2e2',
      base: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#dbeafe',
      base: '#3b82f6',
      dark: '#1d4ed8',
    },
  },
} as const;

export type SpoonColors = typeof colors;
