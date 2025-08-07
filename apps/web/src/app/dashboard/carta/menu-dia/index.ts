// ✅ EXPORTACIONES PÚBLICAS DEL MÓDULO MENU-DIA
export { default as MenuDiaPage } from './pages/MenuDiaPage';
export { default as MenuConfigurationPage } from './pages/MenuConfigurationPage';
export { default as MenuCombinationsPage } from './pages/MenuCombinationsPage';
export { default as MenuWizardPage } from './pages/MenuWizardPage';

// Re-exportar tipos compartidos para conveniencia
export type { 
  Producto, 
  MenuCombinacion, 
  LoadingStates, 
  MenuState 
} from '@spoon/shared/types/menu-dia/menuTypes';

// Re-exportar hooks compartidos
export { useMenuData } from '@spoon/shared/hooks/menu-dia/useMenuData';
export { useMenuState } from '@spoon/shared/hooks/menu-dia/useMenuState';

// Re-exportar servicios compartidos
export { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';

// Re-exportar constantes compartidas
export { 
  CATEGORIAS_MENU_CONFIG,
  DEFAULT_MENU_PRICE,
  CATEGORY_ICONS 
} from '@spoon/shared/constants/menu-dia/menuConstants';
