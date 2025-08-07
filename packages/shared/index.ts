// packages/shared/index.ts
// ========================================
// SPOON SHARED PACKAGE - EXPORTS
// ========================================

// Supabase client and utilities
export * from './lib/supabase';

// Utils
export * from './lib/utils';

// UI Components
export * from './components/ui/Button';
export * from './components/ui/Card';
export * from './components/ui/Input';
export * from './components/ui/Progress';
// export * from './components/ui/Toast'; // ❌ TEMPORALMENTE DESHABILITADO

// Types (when we add more)
export type { User, Restaurant } from './lib/supabase';
