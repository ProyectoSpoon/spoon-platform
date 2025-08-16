'use client';

import React, { useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { X, Check, Search, Heart, Star, AlertTriangle } from 'lucide-react';
import { CATEGORIAS_MENU_CONFIG, CATEGORY_ICONS, DEFAULT_PROTEIN_QUANTITY } from '@spoon/shared/constants/menu-dia/menuConstants';
import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import { Producto, LoadingStates, MenuCombinacion, MenuFilters, ComboFilters } from '@spoon/shared/types/menu-dia/menuTypes';

// Tipos importados desde shared para evitar duplicación

interface MenuData {
  selectedProducts: { [categoryId: string]: Producto[] };
  setSelectedProducts: (products: { [categoryId: string]: Producto[] }) => void;
  availableProducts: { [categoryId: string]: Producto[] };
  loadProductsForCategory: (categoryId: string) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  menuPrice: number;
  setMenuPrice: (price: number) => void;
  proteinQuantities: { [productId: string]: number };
  setProteinQuantities: (quantities: { [productId: string]: number }) => void;
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
    selectedProducts: { [categoryId: string]: Producto[] },
    setSelectedProducts: (products: { [categoryId: string]: Producto[] }) => void,
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
  const currentCategory = useMemo(
    () => (currentStep < CATEGORIAS_MENU_CONFIG.length ? CATEGORIAS_MENU_CONFIG[currentStep] : null),
    [currentStep]
  );

  const isLastStep = currentStep === 5;

  const categoryProducts = useMemo(
    () => (!isLastStep && currentCategory ? availableProducts[currentCategory.id] || [] : []),
    [isLastStep, currentCategory, availableProducts]
  );

  const selectedInCategory = useMemo(
    () => (!isLastStep && currentCategory ? selectedProducts[currentCategory.id] || [] : []),
    [isLastStep, currentCategory, selectedProducts]
  );

  // PRODUCTOS FILTRADOS
  const filteredProducts = useMemo(() => {
    if (isLastStep || !currentCategory) return [];
    return categoryProducts.filter((producto: Producto) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        producto.name.toLowerCase().includes(q) ||
        (producto.description || '').toLowerCase().includes(q)
      );
    });
  }, [categoryProducts, currentCategory, searchTerm, isLastStep]);

  // EFECTO PARA CARGAR PRODUCTOS CUANDO CAMBIA EL PASO
  useEffect(() => {
    if (currentCategory && currentCategory.id !== 'configuracion-final') {
      // Mantiene tu flujo de carga (Supabase via MenuApiService)
      loadProductsForCategory(currentCategory.id);
    }
  }, [currentStep, currentCategory, loadProductsForCategory]);

  // EFECTO PARA TECLA ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // FUNCIÓN PARA OBTENER ICONO DE CATEGORÍA
  const getIconForCategory = (nombre?: string, isLast?: boolean) => {
    if (isLast) return '⚙️';
    return CATEGORY_ICONS[nombre as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  };

  // SELECCIONAR PRODUCTO
  const handleProductClick = useCallback(
    (producto: Producto) => {
      if (!currentCategory || isLastStep) return;
      handleProductSelect(
        producto,
        selectedProducts,
        setSelectedProducts,
        currentCategory.id,
        setHasUnsavedChanges
      );
    },
    [currentCategory, isLastStep, handleProductSelect, selectedProducts, setSelectedProducts, setHasUnsavedChanges]
  );

  // Habilitación Finalizar con validación mínima
  const principiosLen = selectedProducts['principios']?.length ?? 0;
  const proteinasLen = selectedProducts['proteinas']?.length ?? 0;
  const combosCount = principiosLen * proteinasLen;
  const canFinalize = combosCount > 0 && (menuPrice ?? 0) > 0;

  // Habilitación de “Siguiente/Finalizar”
  const canContinue = isLastStep ? canFinalize : selectedInCategory.length > 0;

  // Finalizar con validaciones
  const handleFinalize = useCallback(() => {
    const principiosCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'principios');
    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
    const principios = principiosCategory ? selectedProducts[principiosCategory.id] || [] : [];
    const proteinas = proteinasCategory ? selectedProducts[proteinasCategory.id] || [] : [];

    if (principios.length === 0 || proteinas.length === 0) {
      showNotification?.('Selecciona al menos 1 principio y 1 proteína.', 'error');
      return;
    }
    if (!menuPrice || menuPrice <= 0) {
      showNotification?.('Ingresa un precio válido para el menú.', 'error');
      return;
    }

    const combinations: MenuCombinacion[] = [];
    let index = 1;
    for (const principio of principios) {
      for (const proteina of proteinas) {
        combinations.push({
          id: `combo-${index}`,
          nombre: `${principio.name} con ${proteina.name}`,
          descripcion: `Combinación de ${principio.name} acompañado de ${proteina.name}`,
          precio: menuPrice,
          disponible: true,
          entrada: selectedProducts['entradas']?.[0],
          principio,
          proteina,
          acompanamiento: selectedProducts['acompanamientos'] || [],
          bebida: selectedProducts['bebidas']?.[0],
          favorito: false,
          especial: false,
          cantidad: proteinQuantities[proteina.id] || DEFAULT_PROTEIN_QUANTITY,
          fechaCreacion: new Date().toISOString(),
          isEditing: false
        });
        index++;
      }
    }

    // Enviar al contenedor para guardar (Supabase)
    onComplete(combinations);
  }, [menuPrice, selectedProducts, proteinQuantities, showNotification, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm transition-all duration-500 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Panel lateral */}
      <div
        className={`
          absolute right-0 top-0 h-full w-full max-w-2xl bg-[color:var(--sp-surface-elevated)] shadow-xl
          transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[color:var(--sp-primary-50)] to-[color:var(--sp-primary-100)]">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--sp-neutral-900)]">
                {isLastStep
                  ? '⚙️ Configuración Final'
                  : `${getIconForCategory(currentCategory?.nombre, false)} ${currentCategory?.nombre}`}
              </h2>
              <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
                {isLastStep
                  ? 'Revisa y confirma la configuración de tu menú'
                  : `Paso ${currentStep + 1} de 6 - Selecciona productos de ${currentCategory?.nombre}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-[color:var(--sp-neutral-100)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SEARCH - Solo si NO es último paso */}
          {!isLastStep && currentCategory && (
            <div className="p-4 border-b bg-[color:var(--sp-surface)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)] w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Buscar ${currentCategory.nombre.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto bg-[color:var(--sp-neutral-50)]">
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
                                ? 'bg-[color:var(--sp-neutral-100)] border-[color:var(--sp-primary-400)] shadow-sm'
                                : 'bg-[color:var(--sp-surface)] border-[color:var(--sp-neutral-200)] hover:border-[color:var(--sp-primary-300)] hover:shadow-sm'}
                            `}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`
                                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0
                                  ${isSelected
                                    ? 'bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-700)]'
                                    : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-600)]'}
                                `}
                              >
                                {isSelected ? '✓' : getIconForCategory(currentCategory.nombre)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-[color:var(--sp-neutral-900)] text-sm leading-tight">
                                  {producto.name}
                                </h4>
                                {producto.description && (
                                  <p className="text-xs text-[color:var(--sp-neutral-600)] mt-0.5 truncate">
                                    {producto.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* Indicadores derecha */}
                            <div className="flex items-center gap-2 shrink-0">
                              {producto.is_favorite && (
                                <Heart className="h-3 w-3 text-[color:var(--sp-error-600)] fill-current" />
                              )}
                              {producto.is_special && (
                                <Star className="h-3 w-3 text-[color:var(--sp-warning-600)] fill-current" />
                              )}
                              {/* Indicador de selección: círculo relleno + check visible */}
                              <div
                                className={`
                                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                                  ${isSelected
                                    ? 'border-transparent bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]'
                                    : 'border-[color:var(--sp-neutral-300)] bg-[color:var(--sp-surface)] text-[color:var(--sp-neutral-400)]'}
                                `}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-current" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[color:var(--sp-surface)] border border-[color:var(--sp-neutral-200)] rounded-lg p-6 text-center">
                    <div className="text-[color:var(--sp-neutral-400)] text-4xl mb-3">🔍</div>
                    <h3 className="text-base font-semibold text-[color:var(--sp-neutral-900)] mb-2">
                      No hay {currentCategory.nombre.toLowerCase()} disponibles
                    </h3>
                    <p className="text-sm text-[color:var(--sp-neutral-600)]">
                      {searchTerm ? 'Prueba con otro término de búsqueda.' : 'No hay productos en esta categoría.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-3 px-3 py-2 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors text-sm"
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
                <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[color:var(--sp-info-800)] mb-3">📋 Resumen de Selección</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIAS_MENU_CONFIG.slice(0, 5).map((categoria: any) => {
                      const products = selectedProducts[categoria.id] || [];
                      return (
                        <div key={categoria.id} className="bg-[color:var(--sp-surface)] rounded-lg p-3 border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getIconForCategory(categoria.nombre)}</span>
                            <span className="font-medium text-[color:var(--sp-neutral-900)]">{categoria.nombre}</span>
                            <span className="bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)] text-xs px-2 py-1 rounded-full">{products.length}</span>
                          </div>
                          {products.length > 0 ? (
                            <div className="space-y-1">
                              {products.slice(0, 3).map((producto: Producto) => (
                                <p key={producto.id} className="text-xs text-[color:var(--sp-neutral-600)]">• {producto.name}</p>
                              ))}
                              {products.length > 3 && (
                                <p className="text-xs text-[color:var(--sp-neutral-500)]">... y {products.length - 3} más</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-[color:var(--sp-neutral-500)] italic">Ningún producto seleccionado</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cantidades de proteínas */}
                <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[color:var(--sp-success-800)] mb-4">🍖 Cantidades de Proteínas</h3>
                  {(() => {
                    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
                    const proteinProducts = proteinasCategory ? selectedProducts[proteinasCategory.id] || [] : [];
                    return proteinProducts?.length > 0 ? (
                      <div className="space-y-4">
                        {proteinProducts.map((proteina: Producto) => (
                          <div key={proteina.id} className="flex items-center justify-between bg-[color:var(--sp-surface)] p-4 rounded-lg border">
                            <div className="flex-1">
                              <h4 className="font-medium text-[color:var(--sp-neutral-900)]">{proteina.name}</h4>
                              <p className="text-sm text-[color:var(--sp-neutral-600)]">{proteina.description}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-[color:var(--sp-neutral-600)]">Cantidad:</span>
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
                                  className="w-8 h-8 rounded-full bg-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-300)] flex items-center justify-center text-[color:var(--sp-neutral-600)] transition-colors"
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
                                  className="w-8 h-8 rounded-full bg-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-300)] flex items-center justify-center text-[color:var(--sp-neutral-600)] transition-colors"
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
                        <AlertTriangle className="h-8 w-8 text-[color:var(--sp-warning-500)] mx-auto mb-2" />
                        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                          No hay proteínas seleccionadas. Regresa al paso anterior para seleccionar proteínas.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Precio del menú */}
                <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[color:var(--sp-info-800)] mb-4">💰 Precio del Menú del Día</h3>
                  <div className="bg-[color:var(--sp-surface)] p-4 rounded-lg border">
                    <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Precio por menú (COP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-500)]">$</span>
                      <input
                        type="number"
                        value={menuPrice}
                        onChange={(e) => setMenuPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent"
                        placeholder="15000"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[color:var(--sp-neutral-500)] mt-2">
                      <span>Precio sugerido: $15,000 - $25,000 COP</span>
                      <span>{menuPrice > 0 ? `$${menuPrice.toLocaleString()}` : 'Sin precio'}</span>
                    </div>
                  </div>
                </div>

                {/* Vista previa de combinaciones */}
                <div className="bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-800)] mb-3">🍽️ Vista Previa de Combinaciones</h3>
                  {(() => {
                    const principiosCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'principios');
                    const proteinasCategory = CATEGORIAS_MENU_CONFIG.find((cat: any) => cat.id === 'proteinas');
                    const principios = principiosCategory ? selectedProducts[principiosCategory.id] || [] : [];
                    const proteinas = proteinasCategory ? selectedProducts[proteinasCategory.id] || [] : [];
                    const totalCombinaciones = principios.length * proteinas.length;
                    if (totalCombinaciones === 0) {
                      return (
                        <div className="text-center py-4">
                          <AlertTriangle className="h-8 w-8 text-[color:var(--sp-error-500)] mx-auto mb-2" />
                          <p className="text-sm text-[color:var(--sp-error-600)]">
                            ⚠️ Necesitas seleccionar al menos 1 principio y 1 proteína para generar combinaciones.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-[color:var(--sp-neutral-700)]">
                            Se generarán <strong className="text-[color:var(--sp-success-600)]">{totalCombinaciones} combinaciones</strong>
                          </p>
                          <div className="text-right text-xs text-[color:var(--sp-neutral-600)]">
                            <p>Ingresos estimados:</p>
                            <p className="font-semibold text-[color:var(--sp-success-600)]">
                              {(totalCombinaciones * (menuPrice || 0) * 5).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-medium text-[color:var(--sp-neutral-800)] mb-1">Principios ({principios.length}):</p>
                            <ul className="space-y-1 max-h-20 overflow-y-auto">
                              {principios.map((p: Producto) => (
                                <li key={p.id} className="text-[color:var(--sp-neutral-600)]">• {p.name}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-[color:var(--sp-neutral-800)] mb-1">Proteínas ({proteinas.length}):</p>
                            <ul className="space-y-1 max-h-20 overflow-y-auto">
                              {proteinas.map((p: Producto) => (
                                <li key={p.id} className="text-[color:var(--sp-neutral-600)]">• {p.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded p-3 mt-3">
                          <p className="text-xs text-[color:var(--sp-info-800)]">
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

          {/* FOOTER: Anterior + Siguiente/Finalizar */}
          <div className="sticky bottom-0 inset-x-0 z-10 bg-[color:var(--sp-surface)] border-t border-[color:var(--sp-border)]">
            <div className="px-4 py-4 grid grid-cols-[auto,1fr,auto] items-center gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={[
                  'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                  'border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)] hover:bg-[color:var(--sp-surface-elevated)]',
                  currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                ].join(' ')}
              >
                Anterior
              </button>

              {/* Centro: mensaje + pasos */}
              <div className="flex items-center justify-center text-sm">
                <span className="text-[color:var(--sp-neutral-600)] mr-3">
                  {!isLastStep && selectedInCategory.length === 0
                    ? `⚠️ Selecciona al menos 1 ${currentCategory?.nombre?.toLowerCase()}`
                    : `✅ ${isLastStep ? (canFinalize ? 'Listo para finalizar' : 'Completa los requisitos') : 'Puedes continuar'}`}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${i <= currentStep ? 'bg-[color:var(--sp-primary-500)]' : 'bg-[color:var(--sp-neutral-300)]'}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={isLastStep ? handleFinalize : handleNextStep}
                disabled={!canContinue}
                className={[
                  'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors justify-self-end',
                  'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)]',
                  'disabled:opacity-50 disabled:pointer-events-none disabled:bg-[color:var(--sp-primary-600)] disabled:text-[color:var(--sp-on-primary)]'
                ].join(' ')}
                title={isLastStep && !canContinue ? 'Selecciona principio y proteína y define un precio.' : undefined}
              >
                {isLastStep ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
          {/* FIN FOOTER */}
        </div>
      </div>
    </div>
  );
}