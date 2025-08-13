/**
 * SETUP DE JEST PARA REACT 18
 * Configuración actualizada para React 18
 */

import '@testing-library/jest-dom';

// Configuración global
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error
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

// React 18 - Mock de createRoot si es necesario
global.React = require('react');

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Timeout para tests
jest.setTimeout(10000);
