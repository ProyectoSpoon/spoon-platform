const isFullCoverage = process.env.CI === 'true' || process.env.JEST_FULL_COVERAGE === 'true';

/**
 * Unificado: incluye configuración previa de jest.config.mesas.js para eliminar archivo duplicado.
 * - testMatch agrega suites de packages/shared y apps/web
 * - collectCoverageFrom combina focus anterior (caja) + patrones mesas
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@supabase|isows|@testing-library|lucide-react)'
  ],
  moduleNameMapper: {
    '^@spoon/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
  testMatch: [
    '**/packages/shared/__tests__/**/*.test.@(ts|tsx|js|jsx)',
    '**/apps/web/**/__tests__/**/*.test.@(ts|tsx|js|jsx)'
  ],
  collectCoverage: isFullCoverage,
  coverageReporters: ['text', 'lcov', 'json', 'clover'],
  collectCoverageFrom: [
    // Caja (crítico)
    'apps/web/src/app/dashboard/caja/hooks/useCaja.ts',
    'apps/web/src/app/dashboard/caja/hooks/useCajaSesion.ts',
    'apps/web/src/app/dashboard/caja/hooks/useGastos.ts',
    'apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago.tsx',
    // Mesas (antes en jest.config.mesas.js)
    'packages/shared/utils/mesas/**/*.{ts,tsx}',
    'packages/shared/constants/mesas/**/*.{ts,tsx}',
    'packages/shared/types/mesas/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**'
  ],
  coverageThreshold: isFullCoverage
    ? {
        global: {
          statements: 72,
          branches: 59,
          functions: 74,
          lines: 74,
        },
        'apps/web/src/app/dashboard/caja/hooks/useCaja.ts': {
          statements: 90,
          branches: 75,
          functions: 90,
          lines: 90,
        },
      }
    : undefined,
};
