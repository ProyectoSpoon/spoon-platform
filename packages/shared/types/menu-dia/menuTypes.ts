// ✅ TIPOS PARA MENU DEL DIA
export interface Producto {
  id: string;
  name: string;
  description?: string;
  suggested_price_min?: number;
  suggested_price_max?: number;
  category_id: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  popularity_score?: number;
  is_verified?: boolean;
  // Campos calculados para compatibilidad
  price?: number;
  is_favorite?: boolean;
  is_special?: boolean;
  available?: boolean;
}

export interface MenuCombinacion {
  id: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  disponible?: boolean;
  productos?: Producto[];
  entrada?: Producto;
  principio?: Producto;
  proteina?: Producto;
  acompanamiento?: Producto[];
  bebida?: Producto;
  favorito?: boolean;
  especial?: boolean;
  cantidad?: number;
  fechaCreacion?: string;
  isEditing?: boolean;
}

export interface LoadingStates {
  saving: boolean;
  generating: boolean;
  deleting: string | null;
  updating: string | null;
  loading: boolean;
}

export interface MenuFilters {
  favorites: boolean;
  specials: boolean;
  category: string;
}

export interface ComboFilters {
  favorites: boolean;
  specials: boolean;
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'name' | 'price' | 'created';
}

export interface MenuState {
  // Estados principales
  currentView: 'creation' | 'combinations';
  showSlideOver: boolean;
  isAnimating: boolean;
  currentStep: number;
  
  // Datos del menú
  currentMenu: any;
  restaurantId: string | null;
  selectedProducts: {[categoryId: string]: Producto[]};
  menuCombinations: MenuCombinacion[];
  availableProducts: {[categoryId: string]: Producto[]};
  
  // Estados adicionales
  hasUnsavedChanges: boolean;
  showDeleteConfirm: string | null;
  menuPrice: number;
  proteinQuantities: {[productId: string]: number};
  
  // Loading states
  loadingStates: LoadingStates;
  loadingProducts: boolean;
  initialLoading: boolean;
  
  // Filtros
  searchTerm: string;
  searchTermCombo: string;
  filters: MenuFilters;
  filtersCombo: ComboFilters;
}
