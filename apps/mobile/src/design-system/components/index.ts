// src/design-system/components/index.ts

/**
 * Exportaciones principales de componentes del Design System
 * Punto de entrada único para todos los componentes
 */

// Cards
export * from './cards';

// Buttons
export * from './buttons';

// Inputs
export * from './inputs';
export * from './inputs/SpoonCheckbox';

// Chips
export * from './chips';

// Modals
export * from './modals';

// Navigation
export * from './navigation';

// Feedback
export * from './feedback';

// Layout
export { AuthLayout } from './layout/AuthLayout';
export { SpoonSection } from './layout/SpoonSection';
export { SpoonSearchBar } from './layout/SpoonSearchBar';
export { SpoonLocationHeader } from './layout/SpoonLocationHeader';
export { SpoonPage } from './layout/SpoonPage';
// Search
export { SpoonSearchHeader } from './search/SpoonSearchHeader';
export { SpoonSearchTabs } from './search/SpoonSearchTabs';
export { SpoonSearchResultItem } from './search/SpoonSearchResultItem';
export { SpoonSearchHistoryItem } from './search/SpoonSearchHistoryItem';
export { SpoonSearchSuggestionItem } from './search/SpoonSearchSuggestionItem';
export { SpoonSearchTrendChip } from './search/SpoonSearchTrendChip';
export { SpoonSearchEmptyState } from './search/SpoonSearchEmptyState';
export { SpoonCategoryGrid } from './search/SpoonCategoryGrid';

// Restaurant Detail
export { SpoonStatusChip } from './restaurant/SpoonStatusChip';
export { SpoonActionGrid } from './restaurant/SpoonActionGrid';
export { SpoonFeaturedDishCard } from './restaurant/SpoonFeaturedDishCard';
export { SpoonMapPlaceholder } from './restaurant/SpoonMapPlaceholder';
export { SpoonDishQuickActions } from './restaurant/SpoonDishQuickActions';

// Data Display
export { SpoonText } from './data-display/SpoonText';

/**
 * Metadatos de componentes
 */
export const ComponentsInfo = {
  version: '1.1.0',
  totalComponents: 19,
  categories: ['cards', 'buttons', 'inputs', 'chips', 'modals', 'navigation', 'feedback', 'layout', 'data-display'],
  lastUpdated: new Date().toISOString(),
} as const;
