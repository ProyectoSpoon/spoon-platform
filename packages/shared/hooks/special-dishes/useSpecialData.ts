// ========================================
// USE SPECIAL DATA HOOK - COMPLETO Y ACTUALIZADO
// File: packages/shared/hooks/special-dishes/useSpecialData.ts
// ========================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUserProfile,
  getUserRestaurant,
  supabase,
  getRestaurantSpecialDishes,
  getSpecialCombinations,
  getSpecialDishSelections as _getSpecialDishSelections,
  createSpecialDish,
  insertSpecialDishSelections,
  generateSpecialCombinations,
  toggleSpecialToday,
  updateSpecialCombination as _updateSpecialCombination,
  deleteSpecialCombination as _deleteSpecialCombination,
  deleteSpecialDish,
  getAvailableSpecialsToday as _getAvailableSpecialsToday,
  updateSpecialDish,
  type SpecialDish,
} from '../../lib/supabase';

import { Producto, LoadingStates } from '../../types/menu-dia/menuTypes';
import { CATEGORIAS_MENU_CONFIG } from '../../constants/menu-dia/menuConstants';

// ========================================
// INTERFACES ESPECÍFICAS PARA ESPECIALES
// ========================================

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

export interface SpecialMenuCombination {
  id: string;
  nombre?: string;
  descripcion?: string; // undefined en lugar de null
  precio?: number;
  disponible?: boolean;
  disponibleHoy?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  cantidadMaxima?: number; // undefined en lugar de null
  cantidadVendida?: number;
  fechaCreacion?: string;
  isEditing?: boolean;
  specialDishId?: string;
}

// ========================================
// CONSTANTES POR DEFECTO
// ========================================

const DEFAULT_SPECIAL_FILTERS: SpecialFilters = {
  favorites: false,
  featured: false,
  availability: 'all',
  status: 'all',
  sortBy: 'name'
};

const DEFAULT_SPECIAL_COMBO_FILTERS: SpecialComboFilters = {
  favorites: false,
  featured: false,
  availability: 'all',
  sortBy: 'name'
};

const DEFAULT_SPECIAL_PRICE = 35000;

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useSpecialData = () => {
  // ✅ ESTADOS PRINCIPALES
  const [currentView, setCurrentView] = useState<'list' | 'creation' | 'combinations' | 'wizard'>('list');
  const [currentSpecialDish, setCurrentSpecialDish] = useState<SpecialDish | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [specialDishes, setSpecialDishes] = useState<SpecialDish[]>([]);
  // Mapa local (no persistido) de imágenes por id de especial
  const [specialImages, setSpecialImages] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<{[categoryId: string]: Producto[]}>({});
  const [specialCombinations, setSpecialCombinations] = useState<SpecialMenuCombination[]>([]);
  const [availableProducts, setAvailableProducts] = useState<{[categoryId: string]: Producto[]}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dishPrice, setDishPrice] = useState<number>(DEFAULT_SPECIAL_PRICE);
  const [dishName, setDishName] = useState<string>('');
  const [dishDescription, setDishDescription] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // ✅ ESTADOS DEL WIZARD (para compatibilidad con MenuWizardPage)
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [proteinQuantities, setProteinQuantities] = useState<{[productId: string]: number}>({});
  
  // ✅ ESTADOS DE LOADING
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    saving: false,
    generating: false,
    deleting: null,
    updating: null,
    loading: false
  });

  // ✅ ESTADOS DE FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCombo, setSearchTermCombo] = useState('');
  const [filters, setFilters] = useState<SpecialFilters>(DEFAULT_SPECIAL_FILTERS);
  const [filtersCombo, setFiltersCombo] = useState<SpecialComboFilters>(DEFAULT_SPECIAL_COMBO_FILTERS);

  // ✅ FUNCIÓN PARA NOTIFICACIONES
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      
      alert('✅ ' + message);
    } else {
      console.error('❌ ERROR:', message);
      alert('❌ ' + message);
    }
  }, []);

  // ✅ FUNCIONES DEL WIZARD (para compatibilidad)
  const handleNextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleProductSelect = useCallback((
    producto: Producto,
    selectedProducts: {[categoryId: string]: Producto[]},
    setSelectedProducts: (products: {[categoryId: string]: Producto[]}) => void,
    categoryId: string,
    setHasUnsavedChanges: (hasChanges: boolean) => void
  ) => {
    setSelectedProducts({
      ...selectedProducts,
      [categoryId]: selectedProducts[categoryId]?.some(p => p.id === producto.id)
        ? selectedProducts[categoryId].filter(p => p.id !== producto.id)
        : [...(selectedProducts[categoryId] || []), producto]
    });
    setHasUnsavedChanges(true);
  }, []);

  // ✅ FUNCIÓN PARA CARGAR PRODUCTOS POR CATEGORÍA (reutilizar lógica del menú del día)
  const loadProductsForCategory = useCallback(async (categoryId: string) => {
    
    
    if (availableProducts[categoryId] || categoryId === 'configuracion-final') {
      
      return;
    }
    
    try {
      setLoadingProducts(true);
      const categoryConfig = CATEGORIAS_MENU_CONFIG.find(c => c.id === categoryId);
      if (!categoryConfig || !categoryConfig.uuid) return;
      
      const { data, error } = await supabase
        .from('universal_products')
        .select('*')
        .eq('category_id', categoryConfig.uuid)
        .eq('is_verified', true)
        .order('name');

      if (error) throw error;
      
  const transformedData = (data || []).map((item: any) => ({
        ...item,
        price: item.suggested_price_min || 0,
        available: item.is_verified,
        is_favorite: false,
        is_special: item.popularity_score > 80
      }));

      setAvailableProducts(prev => ({
        ...prev,
        [categoryId]: transformedData
      }));
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      showNotification('Error cargando productos', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [availableProducts, showNotification]);

  // ✅ FUNCIÓN PARA CARGAR DATOS INICIALES
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      
  const [_profile, restaurant] = await Promise.all([
        getUserProfile(),
        getUserRestaurant()
      ]);
      
      if (restaurant) {
        setRestaurantId(restaurant.id);
        
        // Cargar platos especiales del restaurante
        const dishes = await getRestaurantSpecialDishes(restaurant.id);
        setSpecialDishes(dishes);
        
        
        
        // Si hay platos especiales, mostrar la lista
        if (dishes.length > 0) {
          setCurrentView('list');
        } else {
          setCurrentView('list'); // Empezar en lista aunque esté vacía
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('Error al cargar información', 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA CREAR NUEVO PLATO ESPECIAL
  const createNewSpecialDish = useCallback(async (
    dishName: string,
    dishDescription: string,
    dishPrice: number,
    selectedProducts: {[categoryId: string]: Producto[]},
    imageUrl?: string,
    imageAlt?: string
  ) => {
    if (!restaurantId) {
      showNotification('No se pudo identificar el restaurante', 'error');
      return null;
    }

    try {
      setLoadingStates(prev => ({ ...prev, saving: true }));
      
      // 1. Crear el plato especial
      const newDish = await createSpecialDish(restaurantId, {
        dish_name: dishName,
        dish_description: dishDescription,
        dish_price: dishPrice,
        image_url: imageUrl,
        image_alt: imageAlt
      });

      

      // 2. Agregar productos seleccionados
      await insertSpecialDishSelections(newDish.id, selectedProducts);

      // 3. Calcular métricas y marcar configuración completa
      const totalProducts = Object.values(selectedProducts).reduce((acc, arr) => acc + arr.length, 0);
      const categoriesConfigured = Object.values(selectedProducts).filter(arr => arr.length > 0).length;
      try {
        await updateSpecialDish(newDish.id, {
          total_products_selected: totalProducts as any,
          categories_configured: categoriesConfigured as any,
          setup_completed: true as any,
          status: 'active' as any,
          is_template: false as any
        });
      } catch (e) {
        console.warn('No se pudo actualizar flags de especial', e);
      }

      // 4. Recargar datos
      const updatedDishes = await getRestaurantSpecialDishes(restaurantId);
      setSpecialDishes(updatedDishes);

      // 5. Limpiar formulario
      setDishName('');
      setDishDescription('');
      setDishPrice(DEFAULT_SPECIAL_PRICE);
      setSelectedProducts({});
      setProteinQuantities({});
      setHasUnsavedChanges(false);
      setCurrentStep(0);
      setCurrentView('list');

      // Guardar imagen en memoria si existe
      if (imageUrl) {
        setSpecialImages(prev => ({ ...prev, [newDish.id]: imageUrl }));
  // También inyectar en el arreglo en memoria si no vino aún desde la DB
  setSpecialDishes(prev => prev.map(d => d.id === newDish.id ? { ...d, image_url: imageUrl } : d));
      }

      showNotification(`Plato especial "${dishName}" creado exitosamente`);
      return newDish;
      
    } catch (error) {
      console.error('Error creando plato especial:', error);
      showNotification('Error al crear plato especial', 'error');
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  }, [restaurantId, showNotification]);

  // ✅ FUNCIÓN PARA EDITAR PLATO ESPECIAL (carga selecciones y abre wizard simplificado)
  const editSpecialDish = useCallback(async (specialDish: SpecialDish) => {
    try {
      setLoadingStates(prev => ({ ...prev, loading: true }));
      setCurrentSpecialDish(specialDish);
      // Cargar selecciones de productos existentes
  const selections = await _getSpecialDishSelections(specialDish.id);
      const grouped: { [categoryId: string]: Producto[] } = {};
  selections.forEach((sel: any) => {
        // Encontrar categoryId desde nombre (inverso)
        const cfg = CATEGORIAS_MENU_CONFIG.find(c => c.nombre === sel.category_name || c.id === sel.category_name);
        const catId = cfg?.id || sel.category_name;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push({
          id: sel.universal_product_id,
            name: sel.product_name,
          description: '',
          category_id: catId,
          price: 0
        } as unknown as Producto);
      });
      setSelectedProducts(grouped);
      setDishName(specialDish.dish_name || '');
      setDishDescription(specialDish.dish_description || '');
      setDishPrice(specialDish.dish_price || DEFAULT_SPECIAL_PRICE);
      setHasUnsavedChanges(false);
      setCurrentStep(0);
      setCurrentView('wizard');
      setIsAnimating(true);
    } catch (error) {
      console.error('Error preparando edición del especial', error);
      showNotification('Error cargando datos para edición', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA GUARDAR CAMBIOS DE UN ESPECIAL EXISTENTE
  const saveEditedSpecialDish = useCallback(async (imageUrl?: string, imageAlt?: string) => {
    if (!currentSpecialDish) return;
    try {
      setLoadingStates(prev => ({ ...prev, saving: true }));
      await updateSpecialDish(currentSpecialDish.id, {
        dish_name: dishName,
        dish_description: dishDescription,
        dish_price: dishPrice,
        image_url: imageUrl ?? currentSpecialDish.image_url ?? null,
        image_alt: imageAlt ?? currentSpecialDish.image_alt ?? null
      });
      await insertSpecialDishSelections(currentSpecialDish.id, selectedProducts);
      // Recalcular métricas y marcar completo
  const totalProductsEdit = Object.values(selectedProducts).reduce((acc: number, arr: Producto[]) => acc + arr.length, 0);
  const categoriesConfiguredEdit = Object.values(selectedProducts).filter((arr: Producto[]) => arr.length > 0).length;
      try {
        await updateSpecialDish(currentSpecialDish.id, {
          total_products_selected: totalProductsEdit as any,
          categories_configured: categoriesConfiguredEdit as any,
          setup_completed: true as any,
          status: 'active' as any,
          is_template: false as any
        });
      } catch (e) {
        console.warn('No se pudo actualizar flags de especial (edición)', e);
      }
      const updated = await getRestaurantSpecialDishes(restaurantId!);
      setSpecialDishes(updated);
      if (imageUrl) {
        setSpecialImages(prev => ({ ...prev, [currentSpecialDish.id]: imageUrl }));
      }
      showNotification('Especial actualizado');
      setCurrentView('list');
    } catch (error) {
      console.error('Error guardando edición', error);
      showNotification('Error al guardar cambios', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  }, [currentSpecialDish, dishName, dishDescription, dishPrice, selectedProducts, restaurantId, showNotification]);

  // ✅ FUNCIÓN PARA OBTENER SELECCIONES AGRUPADAS (solo lectura / detalle)
  const fetchSpecialDishSelectionsGrouped = useCallback(async (specialDishId: string) => {
    try {
      const selections = await _getSpecialDishSelections(specialDishId);
      const grouped: { [categoryName: string]: string[] } = {};
  selections.forEach((sel: any) => {
        const name = sel.category_name || 'Otros';
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(sel.product_name);
      });
      return grouped;
    } catch (e) {
      console.error('Error obteniendo selecciones para detalle', e);
      return {} as { [categoryName: string]: string[] };
    }
  }, []);

  // ✅ FUNCIÓN PARA CARGAR COMBINACIONES DE UN PLATO ESPECIAL
  const loadSpecialCombinations = useCallback(async (specialDishId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, loading: true }));
      
      const combinations = await getSpecialCombinations(specialDishId);
      
      const transformedCombinations = combinations.map(combo => ({
        id: combo.id,
        nombre: combo.combination_name,
        descripcion: combo.combination_description || undefined, // Convertir null a undefined
        precio: combo.combination_price,
        disponible: combo.is_available,
        disponibleHoy: combo.available_today,
        favorito: combo.is_favorite,
        destacado: combo.is_featured,
        cantidadMaxima: combo.max_daily_quantity || undefined, // Convertir null a undefined
        cantidadVendida: combo.current_sold_quantity,
        fechaCreacion: combo.generated_at,
        specialDishId: combo.special_dish_id
      }));
      
      setSpecialCombinations(transformedCombinations);
      
      
    } catch (error) {
      console.error('Error cargando combinaciones:', error);
      showNotification('Error al cargar combinaciones', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA ACTIVAR/DESACTIVAR ESPECIAL PARA HOY
  const toggleSpecialForToday = useCallback(async (
    specialDishId: string,
    activate: boolean,
    maxQuantity?: number,
    notes?: string
  ) => {
    if (!restaurantId) {
      showNotification('No se pudo identificar el restaurante', 'error');
      return;
    }

    try {
      const result = await toggleSpecialToday(restaurantId, specialDishId, activate, maxQuantity, notes);
      
      if (result?.success) {
        showNotification(result.message);
        
        // Actualizar estado local
        setSpecialDishes(prev => 
          prev.map(dish => 
            dish.id === specialDishId 
              ? { ...dish, is_active: activate }
              : dish
          )
        );
        
        // Si hay combinaciones cargadas, actualizarlas
        if (specialCombinations.length > 0) {
          setSpecialCombinations(prev =>
            prev.map(combo =>
              combo.specialDishId === specialDishId
                ? { ...combo, disponibleHoy: activate }
                : combo
            )
          );
        }
      } else {
        showNotification(result?.message || 'Error al activar especial', 'error');
      }
      
    } catch (error) {
      console.error('Error activando especial:', error);
      showNotification('Error al activar especial para hoy', 'error');
    }
  }, [restaurantId, specialCombinations, showNotification]);

  // ✅ FUNCIÓN PARA ELIMINAR PLATO ESPECIAL
  const deleteSpecialDishComplete = useCallback(async (specialDishId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleting: specialDishId }));
      
      await deleteSpecialDish(specialDishId);
      
      // Actualizar lista local
      setSpecialDishes(prev => prev.filter(dish => dish.id !== specialDishId));
      
      // Limpiar combinaciones si es el plato actual
      if (currentSpecialDish?.id === specialDishId) {
        setSpecialCombinations([]);
        setCurrentSpecialDish(null);
        setCurrentView('list');
      }
      
      showNotification('Plato especial eliminado exitosamente');
      
    } catch (error) {
      console.error('Error eliminando plato especial:', error);
      showNotification('Error al eliminar plato especial', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: null }));
    }
  }, [currentSpecialDish, showNotification]);

  // ✅ FUNCIÓN PARA INICIALIZAR WIZARD
  const openWizard = useCallback(() => {
    setCurrentStep(0);
    setIsAnimating(true);
    setSelectedProducts({});
    setProteinQuantities({});
    setDishName('');
    setDishDescription('');
    setDishPrice(DEFAULT_SPECIAL_PRICE);
    setHasUnsavedChanges(false);
    setCurrentView('wizard');
  }, []);

  // ✅ FUNCIÓN PARA CERRAR WIZARD
  const closeWizard = useCallback((force = false) => {
    if (hasUnsavedChanges && !force) {
      if (confirm('¿Estás seguro de cerrar? Tienes cambios sin guardar.')) {
        setIsAnimating(false);
        setTimeout(() => setCurrentView('list'), 300);
        return true;
      }
      return false;
    } else {
      setIsAnimating(false);
      setTimeout(() => setCurrentView('list'), 300);
      return true;
    }
  }, [hasUnsavedChanges]);

  // ✅ CARGAR DATOS AL MONTAR
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ✅ RETORNAR ESTADO Y FUNCIONES
  return {
    // Estados principales
    currentView,
    setCurrentView,
    currentSpecialDish,
    setCurrentSpecialDish,
    restaurantId,
    specialDishes,
    setSpecialDishes,
  specialImages,
  setSpecialImages,
    selectedProducts,
    setSelectedProducts,
    specialCombinations,
    setSpecialCombinations,
    availableProducts,
    setAvailableProducts,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    dishPrice,
    setDishPrice,
    dishName,
    setDishName,
    dishDescription,
    setDishDescription,
    
    // Estados del wizard (para compatibilidad con MenuWizardPage)
    currentStep,
    setCurrentStep,
    isAnimating,
    setIsAnimating,
    proteinQuantities,
    setProteinQuantities,
    
    // Alias para compatibilidad con MenuWizardPage
    menuPrice: dishPrice,
    setMenuPrice: setDishPrice,
    currentMenu: null,
    setCurrentMenu: () => {},
    setMenuCombinations: setSpecialCombinations,
    menuCombinations: specialCombinations,
    
    // Estados de loading
    initialLoading,
    loadingProducts,
    loadingStates,
    setLoadingStates,
    
    // Estados de filtros
    searchTerm,
    setSearchTerm,
    searchTermCombo,
    setSearchTermCombo,
    filters,
    setFilters,
    filtersCombo,
    setFiltersCombo,
    
    // Funciones principales
    showNotification,
    loadProductsForCategory,
    loadInitialData,
    createNewSpecialDish,
  editSpecialDish,
  saveEditedSpecialDish,
  fetchSpecialDishSelectionsGrouped,
    loadSpecialCombinations,
    toggleSpecialForToday,
    deleteSpecialDishComplete,
    
    // Funciones del wizard
    handleNextStep,
    handlePrevStep,
    handleProductSelect,
    openWizard,
    closeWizard
  };
};
