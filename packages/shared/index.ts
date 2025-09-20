// packages/shared/index.ts
// ========================================
// SPOON SHARED PACKAGE - EXPORTS
// ========================================

// Supabase client and utilities
export * from './lib/supabase';

// Utils
export * from './lib/utils';
export * from './lib/storage';

// Design tokens
export * as SpoonTokens from './tokens';

// UI Components (canonical casing - match folder names)
export * from './components/ui/Button';
export * from './components/ui/ButtonV2';
export * from './components/ui/InputV2';
export * from './components/ui/SelectV2';
export * from './components/ui/TextareaV2';
export * from './components/ui/ProgressV2';
export * from './components/ui/TabsV2';
export * from './components/ui/ActionBarV2';
export * from './components/ui/CheckboxV2';
export * from './components/ui/CheckboxGroupV2';
export * from './components/ui/SwitchV2';
export * from './components/ui/BadgeV2';
export * from './components/ui/SpinnerV2';
export * from './components/ui/AlertV2';
export * from './components/ui/RadioV2';
export * from './components/ui/RadioGroupV2';
export * from './components/ui/DialogV2';
export * from './components/ui/AvatarV2';
export * from './components/ui/TooltipV2';
export * from './components/ui/PopoverV2';
export * from './components/ui/DrawerV2';
export * from './components/ui/MenuV2';
export * from './components/ui/DropdownV2';
export * from './components/ui/BreadcrumbV2';
export * from './components/ui/PaginationV2';
export * from './components/ui/SkeletonV2';
export * from './components/ui/TableV2';
export * from './components/ui/FileInputV2';
export * from './components/ui/DatePickerV2';
export * from './components/ui/TimePickerV2';
export * from './components/ui/Toast';
export * from './components/ui/MetricCardV2';
export * from './components/ui/EmptyStateV2';
export * from './patterns/FormSection';
export * from './patterns/FormControlV2';
export * from './patterns/FormFieldsV2';
export * from './components/ui/Card';
export * from './components/ui/Input';
export * from './components/ui/Progress';
export * from './components/ui/Tabs';
export * from './components/ui/components/FormCard';
export * from './components/ui/components/InlineEditButton';
export * from './components/ui/components/UbicacionForm';
export * from './components/ui/components/MapPreview';
export * from './components/ui/components/InteractiveMap';
export * from './components/ui/components/DynamicMap';
// ToastV2: exportado arriba desde './components/ui/Toast'

// Types (when we add more)
export type { User, Restaurant } from './lib/supabase';

// Toast mock eliminado: usar ToastV2 (useToast/toast/Toaster)

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

