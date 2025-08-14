// ========================================
// EXPORTS CENTRALIZADOS PARA ESPECIALES
// File: src/app/dashboard/carta/especiales/pages/index.ts
// ========================================

// ✅ Páginas principales
export { default as SpecialesPage } from './SpecialesPage';
export { default as SpecialesWizardPage } from './SpecialesWizardPage';
export { default as EspecialesCombinationsPage } from './EspecialesCombinationsPage';

// ✅ Componentes (cuando los creemos)
// export { default as SpecialDishCard } from './components/SpecialDishCard';
// export { default as SpecialCombinationCard } from './components/SpecialCombinationCard';
// export { default as SpecialFilters } from './components/SpecialFilters';

// ✅ Hooks (cuando los creemos)
// export { useSpecialFilters } from './hooks/useSpecialFilters';
// export { useSpecialWizard } from './hooks/useSpecialWizard';

// ✅ Re-export del hook principal desde shared
export { useSpecialData } from '@spoon/shared/hooks/special-dishes/useSpecialData';

// ✅ Re-export de tipos desde shared
export type {
  SpecialDishData,
  SpecialCombinationData,
  SpecialMenuCombination,
  SpecialFilters,
  SpecialComboFilters,
  SpecialLoadingStates
} from '@spoon/shared/types/special-dishes/specialDishTypes';

// ✅ Re-export de constantes desde shared
export {
  CATEGORIAS_ESPECIALES_CONFIG,
  DEFAULT_SPECIAL_PRICE,
  SPECIAL_WIZARD_STEPS,
  SPECIAL_LOADING_MESSAGES,
  SPECIAL_SUCCESS_MESSAGES,
  SPECIAL_ERROR_MESSAGES
} from '@spoon/shared/constants/special-dishes/specialDishConstants';