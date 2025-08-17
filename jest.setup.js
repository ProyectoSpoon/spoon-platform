/**
 * SETUP DE JEST PARA REACT 18 (CommonJS)
 */

require('@testing-library/jest-dom');

// Configuración global
// Silenciar logs ruidosos en tests, pero permite habilitarlos puntualmente en casos específicos
const realConsoleError = console.error.bind(console);
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn((...args) => {
    // Para depuración se puede comentar la línea siguiente
    // realConsoleError(...args);
  })
};

// Mock de localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// React 18 - Ensure React is available in test env
global.React = require('react');

// Variables de entorno necesarias para supabase en tests
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Timeout para tests
jest.setTimeout(10000);
