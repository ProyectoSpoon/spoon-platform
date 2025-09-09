// ========================================
// TYPES FOR SPECIAL DISHES SYSTEM
// File: packages/shared/types/special-dishes/specialDishTypes.ts
// ========================================

import { Producto } from '../menu-dia/menuTypes';

// ========================================
// INTERFACES PRINCIPALES
// ========================================

export interface SpecialDishData {
  id: string;
  restaurant_id: string;
  dish_name: string;
  dish_description?: string;
  dish_price: number;
  is_active: boolean;
  is_template: boolean;
  status: 'draft' | 'active' | 'inactive';
  total_products_selected: number;
  categories_configured: number;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
  // Campos de imagen (agregados posteriormente)
  image_url?: string | null;
  image_alt?: string | null;
}

export interface SpecialCombinationData {
  id: string;
  special_dish_id: string;
  combination_name: string;
  combination_description?: string;
  combination_price: number;
  entrada_product_id?: string;
  principio_product_id?: string;
  proteina_product_id: string;
  acompanamiento_products?: string[];
  bebida_product_id?: string;
  is_available: boolean;
  is_favorite: boolean;
  is_featured: boolean;
  available_today: boolean;
  max_daily_quantity?: number;
  current_sold_quantity: number;
  generated_at: string;
  updated_at: string;
}

export interface SpecialProductSelection {
  id: string;
  special_dish_id: string;
  universal_product_id: string;
  category_id: string;
  category_name: string;
  product_name: string;
  selection_order: number;
  is_required: boolean;
  selected_at: string;
}

export interface DailyActivation {
  id: string;
  restaurant_id: string;
  special_dish_id: string;
  activation_date: string;
  is_active: boolean;
  daily_price_override?: number;
  daily_max_quantity?: number;
  notes?: string;
  activated_at: string;
  deactivated_at?: string;
}

// ========================================
// INTERFACES PARA UI/COMPONENTES
// ========================================

export interface SpecialMenuCombination {
  id: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  disponible?: boolean;
  disponibleHoy?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  cantidadMaxima?: number;
  cantidadVendida?: number;
  fechaCreacion?: string;
  isEditing?: boolean;
  specialDishId?: string;
}

export interface SpecialLoadingStates {
  saving: boolean;
  generating: boolean;
  deleting: string | null;
  updating: string | null;
  loading: boolean;
  activating: string | null;
  creating: boolean;
}

export interface SpecialFilters {
  favorites: boolean;
  featured: boolean;
  availability: 'all' | 'available' | 'unavailable';
  status: 'all' | 'draft' | 'active' | 'inactive';
  sortBy: 'name' | 'price' | 'created';
}

export interface SpecialComboFilters {
  favorites: boolean;
  featured: boolean;
  availability: 'all' | 'available_today' | 'not_available_today';
  sortBy: 'name' | 'price' | 'created';
}

// ========================================
// ESTADOS DEL SISTEMA
// ========================================

export interface SpecialDishState {
  // Vista actual
  currentView: 'list' | 'creation' | 'combinations' | 'wizard';
  
  // Datos principales
  currentSpecialDish: SpecialDishData | null;
  restaurantId: string | null;
  specialDishes: SpecialDishData[];
  selectedProducts: {[categoryId: string]: Producto[]};
  specialCombinations: SpecialMenuCombination[];
  availableProducts: {[categoryId: string]: Producto[]};
  
  // Formulario de creación
  dishName: string;
  dishDescription: string;
  dishPrice: number;
  
  // Estados adicionales
  hasUnsavedChanges: boolean;
  currentStep: number;
  showSlideOver: boolean;
  isAnimating: boolean;
  
  // Loading states
  loadingStates: SpecialLoadingStates;
  loadingProducts: boolean;
  initialLoading: boolean;
  
  // Filtros
  searchTerm: string;
  searchTermCombo: string;
  filters: SpecialFilters;
  filtersCombo: SpecialComboFilters;
}

// ========================================
// PROPS PARA COMPONENTES
// ========================================

export interface SpecialDishCardProps {
  specialDish: SpecialDishData;
  onEdit: (dish: SpecialDishData) => void;
  onDelete: (dishId: string) => void;
  onToggleToday: (dishId: string, activate: boolean) => void;
  onViewCombinations: (dish: SpecialDishData) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export interface SpecialCombinationCardProps {
  combination: SpecialMenuCombination;
  onEdit: (combination: SpecialMenuCombination) => void;
  onDelete: (combinationId: string) => void;
  onToggleFavorite: (combinationId: string) => void;
  onToggleFeatured: (combinationId: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export interface SpecialWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    dishName: string;
    dishDescription: string;
    dishPrice: number;
    selectedProducts: {[categoryId: string]: Producto[]};
  }) => Promise<void>;
  editingDish?: SpecialDishData | null;
  initialData?: {
    dishName: string;
    dishDescription: string;
    dishPrice: number;
    selectedProducts: {[categoryId: string]: Producto[]};
  };
}

export interface SpecialListPageProps {
  specialDishes: SpecialDishData[];
  onCreateNew: () => void;
  onEditDish: (dish: SpecialDishData) => void;
  onDeleteDish: (dishId: string) => void;
  onToggleToday: (dishId: string, activate: boolean) => void;
  onViewCombinations: (dish: SpecialDishData) => void;
  filters: SpecialFilters;
  onFiltersChange: (filters: SpecialFilters) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading?: boolean;
}

export interface SpecialCombinationsPageProps {
  specialDish: SpecialDishData;
  combinations: SpecialMenuCombination[];
  onBack: () => void;
  onEditCombination: (combination: SpecialMenuCombination) => void;
  onDeleteCombination: (combinationId: string) => void;
  onToggleFavorite: (combinationId: string) => void;
  onToggleFeatured: (combinationId: string) => void;
  filtersCombo: SpecialComboFilters;
  onFiltersComboChange: (filters: SpecialComboFilters) => void;
  searchTermCombo: string;
  onSearchComboChange: (term: string) => void;
  loadingStates: SpecialLoadingStates;
}

// ========================================
// TIPOS PARA API RESPONSES
// ========================================

export interface CreateSpecialDishRequest {
  dish_name: string;
  dish_description?: string;
  dish_price: number;
}

export interface CreateSpecialDishResponse {
  success: boolean;
  data?: SpecialDishData;
  error?: string;
}

export interface ToggleSpecialTodayRequest {
  restaurant_id: string;
  special_dish_id: string;
  activate: boolean;
  max_quantity?: number;
  notes?: string;
}

export interface ToggleSpecialTodayResponse {
  success: boolean;
  message: string;
  activation_id?: string;
}

export interface AvailableSpecialToday {
  special_dish_id: string;
  dish_name: string;
  dish_description?: string;
  dish_price: number;
  daily_price_override?: number;
  max_quantity?: number;
  current_sold: number;
  notes?: string;
  combinations_count: number;
}

// ========================================
// CONSTANTES Y ENUMS
// ========================================

export enum SpecialDishStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SpecialView {
  LIST = 'list',
  CREATION = 'creation',
  COMBINATIONS = 'combinations',
  WIZARD = 'wizard'
}

export const SPECIAL_DISH_STEPS = [
  { id: 'info', name: 'Información Básica', required: true },
  { id: 'entradas', name: 'Entradas', required: false },
  { id: 'principios', name: 'Principios', required: false },
  { id: 'proteinas', name: 'Proteínas', required: true },
  { id: 'acompanamientos', name: 'Acompañamientos', required: false },
  { id: 'bebidas', name: 'Bebidas', required: false },
  { id: 'configuracion-final', name: 'Resumen', required: true }
];

export const DEFAULT_SPECIAL_PRICE = 35000;
export const MIN_SPECIAL_PRICE = 15000;
export const MAX_SPECIAL_PRICE = 100000;

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

export const validateSpecialDish = (data: {
  dishName: string;
  dishPrice: number;
  selectedProducts: {[categoryId: string]: Producto[]};
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.dishName || data.dishName.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  
  if (data.dishPrice < MIN_SPECIAL_PRICE || data.dishPrice > MAX_SPECIAL_PRICE) {
    errors.push(`El precio debe estar entre $${MIN_SPECIAL_PRICE.toLocaleString()} y $${MAX_SPECIAL_PRICE.toLocaleString()}`);
  }
  
  const proteinSelected = data.selectedProducts['proteinas']?.length > 0;
  if (!proteinSelected) {
    errors.push('Debe seleccionar al menos una proteína');
  }
  
  const totalProducts = Object.values(data.selectedProducts).flat().length;
  if (totalProducts < 2) {
    errors.push('Debe seleccionar al menos 2 productos en total');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatSpecialPrice = (price: number): string => {
  return `$${price.toLocaleString()}`;
};

export const getSpecialStatusColor = (status: SpecialDishStatus): string => {
  switch (status) {
    case SpecialDishStatus.DRAFT:
  return 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]';
    case SpecialDishStatus.ACTIVE:
  return 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]';
    case SpecialDishStatus.INACTIVE:
  return 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]';
    default:
  return 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]';
  }
};