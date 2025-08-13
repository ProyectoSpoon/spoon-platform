import { CrearOrdenData } from '@spoon/shared/types/mesas';
// packages/shared/index.ts
// ========================================
// SPOON SHARED PACKAGE - EXPORTS
// ========================================

// Supabase client and utilities
export * from './lib/supabase';

// Utils
export * from './lib/utils';

// UI Components (canonical casing - match folder names)
export * from './components/ui/Button';
export * from './components/ui/Card';
export * from './components/ui/Input';
export * from './components/ui/Progress';
export * from './components/ui/Tabs';
export * from './components/ui/components/FormCard';
export * from './components/ui/components/InlineEditButton';
// export * from './components/ui/Toast'; // ❌ TEMPORALMENTE DESHABILITADO

// Types (when we add more)
export type { User, Restaurant } from './lib/supabase';

// Toast mock para compatibilidad
export const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message),
  info: (message: string) => console.log('INFO:', message)
};

// Caja module
// export * from './caja'; // Comentado para evitar SSR issues


// Caja exports (solo para componentes cliente)
export { useCajaSesion } from './caja/hooks/useCajaSesion';
export { formatCurrency, CAJA_CONFIG, CAJA_MESSAGES } from './caja/constants/cajaConstants';
export { AccionesPrincipales } from './components/caja/AccionesPrincipales';
export { SidebarResumen } from './components/caja/SidebarResumen';

// Mesa type export
export type { Mesa } from './types/mesas';

// Action types export
export type { CrearOrdenData, ReservarMesaParams, MantenimientoMesaParams, ActionResult } from './types/mesas';

