/**
 * CONFIGURACIÓN DE JEST PARA REACT 18
 * Actualizada para compatibilidad completa
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Paths y aliases
  moduleNameMapping: {
    '^@spoon/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1'
  },
  
  // Archivos de test
  testMatch: [
    '**/packages/shared/__tests__/**/*.test.{ts,tsx}',
    '**/apps/web/**/__tests__/**/*.test.{ts,tsx}'
  ],
  
  // Cobertura
  collectCoverageFrom: [
    'packages/shared/utils/mesas/**/*.{ts,tsx}',
    'packages/shared/constants/mesas/**/*.{ts,tsx}',
    'packages/shared/types/mesas/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**'
  ],
  
  // Configuración para React 18
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  
  // Configuración de módulos
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Configuración adicional
  verbose: true,
  clearMocks: true,
  testTimeout: 10000,
  
  // React 18 específico
  testEnvironmentOptions: {
    customExportConditions: [''],
  }
};
