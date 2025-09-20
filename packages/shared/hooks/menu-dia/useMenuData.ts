'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { getUserProfile, getUserRestaurant, supabase } from '@spoon/shared/lib/supabase';

import { MenuApiService } from '../../services/menu-dia/menuApiService';
import { Producto, MenuCombinacion, LoadingStates } from '../../types/menu-dia/menuTypes';
import { DEFAULT_MENU_PRICE, DEFAULT_FILTERS, DEFAULT_COMBO_FILTERS, CATEGORIAS_MENU_CONFIG } from '../../constants/menu-dia/menuConstants';

export const useMenuData = () => {
  // ✅ ESTADOS PRINCIPALES
  const [currentView, setCurrentView] = useState<'creation' | 'combinations' | 'analytics'>('creation');
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<{[categoryId: string]: Producto[]}>({});
  const [menuCombinations, setMenuCombinations] = useState<MenuCombinacion[]>([]);
  const [availableProducts, setAvailableProducts] = useState<{[categoryId: string]: Producto[]}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [menuPrice, setMenuPrice] = useState<number>(DEFAULT_MENU_PRICE);
  const [proteinQuantities, setProteinQuantities] = useState<{[productId: string]: number}>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
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
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersCombo, setFiltersCombo] = useState(DEFAULT_COMBO_FILTERS);

  // ✅ FUNCIÓN PARA NOTIFICACIONES SIMPLE (SIN TOAST EXTERNO)
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Notificación simple con alert por ahora - puedes mejorar después
    if (type === 'success') {
      
      alert('✅ ' + message);
    } else {
      console.error('❌ ERROR:', message);
      alert('❌ ' + message);
    }
  }, []);

  // ✅ FUNCIÓN PARA CARGAR PRODUCTOS POR CATEGORÍA
  const loadProductsForCategory = useCallback(async (categoryId: string) => {
    
    
    if (availableProducts[categoryId] || categoryId === 'configuracion-final') {
      
      return;
    }
    
    try {
      setLoadingProducts(true);
      const products = await MenuApiService.getProductsByCategory(categoryId);
      
      setAvailableProducts(prev => ({
        ...prev,
        [categoryId]: products
      }));
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      showNotification('Error cargando productos', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [availableProducts, showNotification]);

  // ✅ FUNCIÓN PARA CARGAR DATOS INICIALES - CON CARGA COMPLETA
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      
  const [_profile, restaurant] = await Promise.all([
        getUserProfile(),
        getUserRestaurant()
      ]);
      
      if (restaurant) {
        setRestaurantId(restaurant.id);
        
        // Verificar si hay menú activo del día
        const todayMenu = await MenuApiService.getTodayMenu(restaurant.id);
  if (todayMenu) {
          
          setCurrentMenu(todayMenu);
          setMenuPrice(todayMenu.menu_price);
          
          // Cargar combinaciones existentes
          const combinations = await MenuApiService.getMenuCombinations(todayMenu.id);

          const transformedCombinations = (combinations || []).map(combo => ({
            id: combo.id,
            nombre: combo.combination_name,
            descripcion: combo.combination_description,
            precio: combo.combination_price,
            disponible: combo.is_available,
            favorito: combo.is_favorite,
            especial: combo.is_special,
            fechaCreacion: combo.generated_at
          }));

          setMenuCombinations(transformedCombinations);

          // ✅ CARGAR PRODUCTOS SELECCIONADOS (siempre que exista menú)
          const { data: menuSelections } = await supabase
            .from('daily_menu_selections')
            .select('*')
            .eq('daily_menu_id', todayMenu.id)
            .order('category_name')
            .order('selection_order');

          if (menuSelections && menuSelections.length > 0) {
            const reconstructedProducts: {[categoryId: string]: Producto[]} = {};
            for (const selection of menuSelections) {
              const categoryConfig = CATEGORIAS_MENU_CONFIG.find(cat => cat.uuid === selection.category_id);
              const categoryId = categoryConfig?.id || selection.category_name.toLowerCase();
              if (!reconstructedProducts[categoryId]) {
                reconstructedProducts[categoryId] = [];
              }
              reconstructedProducts[categoryId].push({
                id: selection.universal_product_id,
                name: selection.product_name,
                category_id: selection.category_id,
                price: 0
              } as Producto);
            }
            setSelectedProducts(reconstructedProducts);
          } else {
            setSelectedProducts({});
          }

          // ✅ CARGAR CANTIDADES DE PROTEÍNAS
          const { data: proteinQtyData } = await supabase
            .from('protein_quantities')
            .select('*')
            .eq('daily_menu_id', todayMenu.id);

          if (proteinQtyData && proteinQtyData.length > 0) {
            const quantities: {[productId: string]: number} = {};
            proteinQtyData.forEach(item => {
              quantities[item.protein_product_id] = item.planned_quantity;
            });
            setProteinQuantities(quantities);
          } else {
            setProteinQuantities({});
          }

          // Vista según datos
          if (transformedCombinations.length > 0) {
            setCurrentView('combinations');
          } else {
            setCurrentView('creation');
            console.info('[Menú del Día] Menú activo sin combinaciones. Completa la configuración para generarlas.');
          }
        } else {
          
          setCurrentView('creation');
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('Error al cargar información', 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [showNotification]);

  // ✅ CARGAR DATOS AL MONTAR
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ✅ RETORNAR ESTADO Y FUNCIONES
  const api = {
    // Estados principales
    currentView,
    setCurrentView,
    currentMenu,
    setCurrentMenu,
    restaurantId,
    selectedProducts,
    setSelectedProducts,
    menuCombinations,
    setMenuCombinations,
    availableProducts,
    setAvailableProducts,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    menuPrice,
    setMenuPrice,
    proteinQuantities,
    setProteinQuantities,
    
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
    
    // Funciones
    showNotification,
    loadProductsForCategory,
    loadInitialData
  };

  // Afirmar tipos explícitos para las vistas soportadas
  return api as typeof api & {
    currentView: 'creation' | 'combinations' | 'analytics';
    setCurrentView: Dispatch<SetStateAction<'creation' | 'combinations' | 'analytics'>>;
  };
};

