'use client';

import React, { useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Check, Search, Heart, Star, 
  AlertTriangle, RefreshCw 
} from 'lucide-react';
import { CATEGORIAS_MENU_CONFIG, CATEGORY_ICONS, DEFAULT_PROTEIN_QUANTITY } from '@spoon/shared/constants/menu-dia/menuConstants';
import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import { Producto, LoadingStates } from '@spoon/shared/types/menu-dia/menuTypes';

// Definiciones de tipos locales para evitar problemas de import
interface MenuCombinacion {
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

interface MenuFilters {
  favorites: boolean;
  specials: boolean;
  category: string;
}

interface ComboFilters {
  favorites: boolean;
  specials: boolean;
  availability: "all";
  sortBy: "name";
}

interface MenuData {
  selectedProducts: {[categoryId: string]: Producto[]};
  setSelectedProducts: (products: {[categoryId: string]: Producto[]}) => void;
  availableProducts: {[categoryId: string]: Producto[]};
  loadProductsForCategory: (categoryId: string) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  menuPrice: number;
  setMenuPrice: (price: number) => void;
  proteinQuantities: {[productId: string]: number};
  setProteinQuantities: (quantities: {[productId: string]: number}) => void;
  loadingStates: LoadingStates;
  setLoadingStates: (setter: (prev: LoadingStates) => LoadingStates) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  restaurantId: string | null;
  currentMenu: any;
  setCurrentMenu: (menu: any) => void;
  setMenuCombinations: (combinations: MenuCombinacion[]) => void;
  // Propiedades adicionales del hook useMenuData - usando tipos de React
  currentView: 'creation' | 'combinations';
  setCurrentView: Dispatch<SetStateAction<'creation' | 'combinations'>>;
  menuCombinations: MenuCombinacion[];
  initialLoading: boolean;
  loadingProducts: boolean;
  searchTermCombo: string;
  setSearchTermCombo: Dispatch<SetStateAction<string>>;
  filters: MenuFilters;
  setFilters: Dispatch<SetStateAction<MenuFilters>>;
  filtersCombo: ComboFilters;
  setFiltersCombo: Dispatch<SetStateAction<ComboFilters>>;
  loadInitialData: () => Promise<void>;
}

interface MenuState {
  currentStep: number;
  isAnimating: boolean;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleProductSelect: (
    producto: Producto,
    selectedProducts: {[categoryId: string]: Producto[]},
    setSelectedProducts: (products: {[categoryId: string]: Producto[]}) => void,
    categoryId: string,
    setHasUnsavedChanges: (hasChanges: boolean) => void
  ) => void;
}

interface Props {
  menuData: MenuData;
  menuState: MenuState;
  onClose: () => void;
  onComplete: (combinations: MenuCombinacion[]) => void;
}

export default function MenuWizardPage({ menuData, menuState, onClose, onComplete }: any) {
  const {
    currentStep,
    isAnimating,
    handleNextStep,
    handlePrevStep,
    handleProductSelect
  } = menuState;

  const {
    selectedProducts,
    setSelectedProducts,
    availableProducts,
    loadProductsForCategory,
    searchTerm,
    setSearchTerm,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    menuPrice,
    setMenuPrice,
    proteinQuantities,
    setProteinQuantities,
    loadingStates,
    setLoadingStates,
    showNotification,
    restaurantId,
    currentMenu,
    setCurrentMenu,
    setMenuCombinations
  } = menuData;

  // CATEGORÍA ACTUAL Y PRODUCTOS FILTRADOS
  const currentCategory = useMemo(() => 
    currentStep < CATEGORIAS_MENU_CONFIG.length ? CATEGORIAS_MENU_CONFIG[currentStep] : null
  , [currentStep]);
  
  const isLastStep = currentStep === 5;
  const categoryProducts = useMemo(() => 
    !isLastStep && currentCategory ? (availableProducts[currentCategory.id] || []) : []
  , [isLastStep, currentCategory, availableProducts]);
  
  const selectedInCategory = useMemo(() => 
    !isLastStep && currentCategory ? (selectedProducts[currentCategory.id] || []) : []
  , [isLastStep, currentCategory, selectedProducts]);

  // PRODUCTOS FILTRADOS
  const filteredProducts = useMemo(() => {
    if (isLastStep || !currentCategory) return [];
    
    return categoryProducts.filter((producto: Producto) => {
      const matchesSearch = searchTerm === '' || 
        producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [categoryProducts, currentCategory, searchTerm, isLastStep]);

  // EFECTO PARA CARGAR PRODUCTOS CUANDO CAMBIA EL PASO
  useEffect(() => {
    if (currentCategory && currentCategory.id !== 'configuracion-final') {
      console.log(`🔄 Cargando productos para: ${currentCategory.nombre}`);
      loadProductsForCategory(currentCategory.id);
    }
  }, [currentStep, currentCategory, loadProductsForCategory]);

  // EFECTO PARA TECLA ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // FUNCIÓN PARA OBTENER ICONO DE CATEGORÍA
  const getIconForCategory = (nombre?: string, isLastStep?: boolean) => {
    if (isLastStep) return '⚙️';
    return CATEGORY_ICONS[nombre as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  };

  // FUNCIÓN PARA SELECCIONAR PRODUCTOS
  const handleProductClick = useCallback((producto: Producto) => {
    if (!currentCategory || isLastStep) return;
    
    handleProductSelect(
      producto,
      selectedProducts,
      setSelectedProducts,
      currentCategory.id,
      setHasUnsavedChanges
    );
  }, [currentCategory, isLastStep, handleProductSelect, selectedProducts, setSelectedProducts, setHasUnsavedChanges]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose} 
      />
      <div className={`
        absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl
        transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isLastStep 
                  ? '⚙️ Configuración Final' 
                  : `${getIconForCategory(currentCategory?.nombre, false)} ${currentCategory?.nombre}`
                }
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isLastStep 
                  ? 'Revisa y confirma la configuración de tu menú'
                  : `Paso ${currentStep + 1} de 6 - Selecciona productos de ${currentCategory?.nombre}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SEARCH - Solo si NO es último paso */}
          {!isLastStep && currentCategory && (
            <div className="p-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Buscar ${currentCategory.nombre.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {!isLastStep && currentCategory ? (
              <div className="p-4 space-y-4">
                
                {/* Lista de productos disponibles */}
                {filteredProducts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                      {filteredProducts.map((producto: Producto) => {
                        const isSelected = selectedInCategory.some((p: Producto) => p.id === producto.id);
                        
                        return (
                          <div
                            key={producto.id}
                            onClick={() => handleProductClick(producto)}
                            className={`
                              flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 border
                              ${isSelected 
                                ? 'bg-green-50 border-green-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0
                                ${isSelected ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}
                              `}>
                                {isSelected ? '✓' : getIconForCategory(currentCategory.nombre)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900 text-sm leading-tight">{producto.name}</h4>
                                {producto.description && (
                                  <p className="text-xs text-gray-600 mt-0.5 truncate">{producto.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {producto.is_favorite && (
                                <Heart className="h-3 w-3 text-red-500 fill-current" />
                              )}
                              {producto.is_special && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                              <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                ${isSelected 
                                  ? 'border-green-500 bg-green-500 text-white' 
                                  : 'border-gray-300 bg-white'
                                }
                              `}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-gray-400 text-4xl mb-3">🔍</div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      No hay {currentCategory.nombre.toLowerCase()} disponibles
                    </h3>
                    <p className="text-sm text-gray-600">
                      {searchTerm ? 'Prueba con otro término de búsqueda.' : 'No hay productos en esta categoría.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-3 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // CONFIGURACIÓN FINAL COMPLETA
              <div className="p-4 space-y-4">
                
                {/* Resumen de selección */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    📋 Resumen de Selección
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIAS_MENU_CONFIG.slice(0, 5).map((categoria: any) => {
                      const products = selectedProducts[categoria.id] || [];
                      return (
                        <div key={categoria.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getIconForCategory(categoria.nombre)}</span>
                            <span className="font-medium text-gray-900">{categoria.nombre}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {products.length}
                            </span>
                          </div>
                          {products.length > 0 ? (
                            <div className="space-y-1">
                              {products.slice(0, 3).map((producto: Producto) => (
                                <p key={producto.id} className="text-xs text-gray-600">• {producto.name}</p>
                              ))}
                              {products.length > 3 && (
                                <p className="text-xs text-gray-500">... y {products.length - 3} más</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">Ningún producto seleccionado</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Configuración de cantidades de proteínas */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    🍖 Cantidades de Proteínas
                  </h3>
                  
                  {(() => {
                    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
                    const proteinProducts = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
                    
                    return proteinProducts?.length > 0 ? (
                      <div className="space-y-4">
                        {proteinProducts.map((proteina: Producto) => (
                          <div key={proteina.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{proteina.name}</h4>
                              <p className="text-sm text-gray-600">{proteina.description}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">Cantidad:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    const currentQty = proteinQuantities[proteina.id] || DEFAULT_PROTEIN_QUANTITY;
                                    if (currentQty > 1) {
                                      setProteinQuantities({
                                        ...proteinQuantities,
                                        [proteina.id]: currentQty - 1
                                      });
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-medium">
                                  {proteinQuantities[proteina.id] || DEFAULT_PROTEIN_QUANTITY}
                                </span>
                                <button
                                  onClick={() => {
                                    const currentQty = proteinQuantities[proteina.id] || DEFAULT_PROTEIN_QUANTITY;
                                    setProteinQuantities({
                                      ...proteinQuantities,
                                      [proteina.id]: currentQty + 1
                                    });
                                  }}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          No hay proteínas seleccionadas. Regresa al paso anterior para seleccionar proteínas.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Configuración del precio del menú */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    💰 Precio del Menú del Día
                  </h3>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio por menú (COP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={menuPrice}
                        onChange={(e) => setMenuPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="15000"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Precio sugerido: $15,000 - $25,000 COP</span>
                      <span>{menuPrice > 0 ? `$${menuPrice.toLocaleString()}` : 'Sin precio'}</span>
                    </div>
                  </div>
                </div>

                {/* Vista previa de combinaciones */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🍽️ Vista Previa de Combinaciones
                  </h3>
                  
                  {(() => {
                    const principiosCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'principios');
                    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
                    const principios = principiosCategory ? (selectedProducts[principiosCategory.id] || []) : [];
                    const proteinas = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
                    const totalCombinaciones = principios.length * proteinas.length;
                    
                    if (totalCombinaciones === 0) {
                      return (
                        <div className="text-center py-4">
                          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-600">
                            ⚠️ Necesitas seleccionar al menos 1 principio y 1 proteína para generar combinaciones.
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">
                            Se generarán <strong className="text-green-600">{totalCombinaciones} combinaciones</strong>
                          </p>
                          <div className="text-right text-xs text-gray-600">
                            <p>Ingresos estimados:</p>
                            <p className="font-semibold text-green-600">
                              ${(totalCombinaciones * menuPrice * 5).toLocaleString()}/día
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Principios ({principios.length}):</p>
                            <ul className="space-y-1 max-h-20 overflow-y-auto">
                              {principios.map((p: Producto) => (
                                <li key={p.id} className="text-gray-600">• {p.name}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Proteínas ({proteinas.length}):</p>
                            <ul className="space-y-1 max-h-20 overflow-y-auto">
                              {proteinas.map((p: Producto) => (
                                <li key={p.id} className="text-gray-600">• {p.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                          <p className="text-xs text-blue-800">
                            <strong>Nota:</strong> Las entradas, acompañamientos y bebidas seleccionadas serán las mismas para todas las combinaciones.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t bg-white">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </button>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  {!isLastStep && selectedInCategory.length === 0 
                    ? `⚠️ Selecciona al menos 1 ${currentCategory?.nombre?.toLowerCase()}`
                    : `✅ ${isLastStep ? 'Listo para finalizar' : 'Puedes continuar'}`
                  }
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i <= currentStep ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={isLastStep ? () => {
                  // Lógica de finalización
                  const principiosCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'principios');
                  const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
                  const principios = principiosCategory ? (selectedProducts[principiosCategory.id] || []) : [];
                  const proteinas = proteinasCategory ? (selectedProducts[proteinasCategory.id] || []) : [];
                  
                  console.log('🔍 Principios encontrados:', principios.length);
                  console.log('🔍 Proteínas encontradas:', proteinas.length);
                  console.log('🔍 Selected products:', selectedProducts);
                  
                  // Generar combinaciones
                  const combinations: MenuCombinacion[] = [];
                  let index = 1;
                  
                  for (const principio of principios) {
                    for (const proteina of proteinas) {
                      combinations.push({
                        id: `combo-${index}`, // ID temporal
                        nombre: `${principio.name} con ${proteina.name}`,
                        descripcion: `Combinación de ${principio.name} acompañado de ${proteina.name}`,
                        precio: menuPrice,
                        disponible: true,
                        entrada: selectedProducts['entradas']?.[0], // Primera entrada si existe
                        principio: principio,
                        proteina: proteina,
                        acompanamiento: selectedProducts['acompanamientos'] || [],
                        bebida: selectedProducts['bebidas']?.[0], // Primera bebida si existe
                        favorito: false,
                        especial: false,
                        cantidad: proteinQuantities[proteina.id] || 10,
                        fechaCreacion: new Date().toISOString(),
                        isEditing: false
                      });
                      index++;
                    }
                  }
                  
                  console.log('🎯 Combinaciones generadas:', combinations.length);
                  
                  // Ejecutar callback de finalización
                  onComplete(combinations);
                } : handleNextStep}
                disabled={!isLastStep && selectedInCategory.length === 0}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                  (!isLastStep && selectedInCategory.length === 0)
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isLastStep ? 'Finalizar' : 'Siguiente'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}