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
    // Path aliases
    '^@spoon/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
  // Collect coverage to enforce thresholds below
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'json', 'clover'],
  collectCoverageFrom: [
    'apps/web/src/app/dashboard/caja/hooks/useCaja.ts',
    'apps/web/src/app/dashboard/caja/hooks/useCajaSesion.ts',
    'apps/web/src/app/dashboard/caja/hooks/useGastos.ts',
    'apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago.tsx'
  ],
  coverageThreshold: {
    global: {
  statements: 72,
  branches: 59,
  functions: 74,
  lines: 74
    },
    // Critical paths stricter thresholds
    'apps/web/src/app/dashboard/caja/hooks/useCaja.ts': {
      statements: 90,
      branches: 75,
      functions: 90,
      lines: 90
    }
  }
};
