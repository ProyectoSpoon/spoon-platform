'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, Heart, Star, Grid, Plus, Edit3, RefreshCw, Check, X, 
  Trash2, AlertTriangle 
} from 'lucide-react';
import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import { MenuCombinacion, LoadingStates, ComboFilters } from '@spoon/shared/types/menu-dia/menuTypes';

interface MenuData {
  menuCombinations: MenuCombinacion[];
  setMenuCombinations: (combinations: MenuCombinacion[]) => void;
  currentMenu: any;
  restaurantId: string | null;
  searchTermCombo: string;
  setSearchTermCombo: (term: string) => void;
  filtersCombo: ComboFilters;
  setFiltersCombo: (setter: (prev: ComboFilters) => ComboFilters) => void;
  loadingStates: LoadingStates;
  setLoadingStates: (setter: (prev: LoadingStates) => LoadingStates) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  setSelectedProducts: (products: any) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

interface Props {
  menuData: MenuData;
  onOpenWizard: () => void;
  onCreateNewMenu: () => void;
}

export default function MenuCombinationsPage({ menuData, onOpenWizard, onCreateNewMenu }: Props) {
  const {
    menuCombinations,
    setMenuCombinations,
    currentMenu,
    restaurantId,
    searchTermCombo,
    setSearchTermCombo,
    filtersCombo,
    setFiltersCombo,
    loadingStates,
    setLoadingStates,
    showNotification
  } = menuData;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ✅ COMBINACIONES FILTRADAS
  const filteredCombinations = useMemo(() => {
    let filtered = menuCombinations.filter((combo: MenuCombinacion) => {
      const matchesSearch = searchTermCombo === '' || 
        combo.nombre?.toLowerCase().includes(searchTermCombo.toLowerCase());
      
      const matchesFavorites = !filtersCombo.favorites || combo.favorito;
      const matchesSpecials = !filtersCombo.specials || combo.especial;
      const matchesAvailability = filtersCombo.availability === 'all' || 
        (filtersCombo.availability === 'available' && combo.disponible) ||
        (filtersCombo.availability === 'unavailable' && !combo.disponible);
      
      return matchesSearch && matchesFavorites && matchesSpecials && matchesAvailability;
    });

    // Ordenar
    filtered.sort((a: MenuCombinacion, b: MenuCombinacion) => {
      switch (filtersCombo.sortBy) {
        case 'price':
          return (a.precio || 0) - (b.precio || 0);
        case 'created':
          return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
        default:
          return (a.nombre || '').localeCompare(b.nombre || '');
      }
    });

    return filtered;
  }, [menuCombinations, searchTermCombo, filtersCombo]);

  // ✅ FUNCIÓN PARA EDITAR MENÚ EXISTENTE
  const handleEditExistingMenu = useCallback(async () => {
    if (!currentMenu || !restaurantId) {
      showNotification('No se pudo cargar la información del menú', 'error');
      return;
    }

    try {
      setLoadingStates((prev: LoadingStates) => ({ ...prev, loading: true }));
      
      // Cargar selecciones de productos del menú existente
      const selections = await MenuApiService.getMenuSelections(currentMenu.id);
      
      // Organizar productos por categoría
      const productsByCategory: {[categoryId: string]: any[]} = {};
      
      for (const selection of selections) {
        if (!productsByCategory[selection.category_id]) {
          productsByCategory[selection.category_id] = [];
        }
        
        const product = {
          id: selection.universal_product_id,
          name: selection.product_name,
          category_id: selection.category_id,
          price: 0,
          available: true,
          is_favorite: false,
          is_special: false
        };
        
        productsByCategory[selection.category_id].push(product);
      }
      
      // Convertir UUIDs a IDs locales para el wizard
      const selectedProductsForWizard: {[categoryId: string]: any[]} = {};
      const CATEGORIAS_MENU_CONFIG = [
        { id: 'entradas', uuid: '494fbac6-59ed-42af-af24-039298ba16b6' },
        { id: 'principios', uuid: 'de7f4731-3eb3-4d41-b830-d35e5125f4a3' },
        { id: 'proteinas', uuid: '299b1ba0-0678-4e0e-ba53-90e5d95e5543' },
        { id: 'acompanamientos', uuid: '8b0751ae-1332-409e-a710-f229be0b9758' },
        { id: 'bebidas', uuid: 'c77ffc73-b65a-4f03-adb1-810443e61799' }
      ];
      
      Object.entries(productsByCategory).forEach(([uuid, products]) => {
        const categoryConfig = CATEGORIAS_MENU_CONFIG.find((c: any) => c.uuid === uuid);
        if (categoryConfig) {
          selectedProductsForWizard[categoryConfig.id] = products;
        }
      });
      
      menuData.setSelectedProducts(selectedProductsForWizard);
      menuData.setHasUnsavedChanges(false);
      onOpenWizard();
      
      console.log('📝 Menú cargado para edición:', selectedProductsForWizard);
      
    } catch (error) {
      console.error('Error cargando menú para edición:', error);
      showNotification('Error al cargar el menú para editar', 'error');
    } finally {
      setLoadingStates((prev: LoadingStates) => ({ ...prev, loading: false }));
    }
  }, [currentMenu, restaurantId, onOpenWizard, menuData, setLoadingStates, showNotification]);

  // ✅ FUNCIÓN PARA EDITAR COMBINACIÓN
  const handleEditCombination = useCallback((combinationId: string) => {
    setMenuCombinations(
      menuCombinations.map((combo: MenuCombinacion) => 
        combo.id === combinationId 
          ? { ...combo, isEditing: true }
          : { ...combo, isEditing: false }
      )
    );
  }, [setMenuCombinations, menuCombinations]);

  // ✅ FUNCIÓN PARA GUARDAR COMBINACIÓN
  const handleSaveCombination = useCallback(async (combinationId: string, updates: MenuCombinacion) => {
    setLoadingStates((prev: LoadingStates) => ({ ...prev, updating: combinationId }));
    
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.nombre !== undefined) {
        dbUpdates.combination_name = updates.nombre;
      }
      if (updates.descripcion !== undefined) {
        dbUpdates.combination_description = updates.descripcion;
      }
      if (updates.precio !== undefined) {
        dbUpdates.combination_price = updates.precio;
      }
      if (updates.disponible !== undefined) {
        dbUpdates.is_available = updates.disponible;
      }

      await MenuApiService.updateCombination(combinationId, dbUpdates);

      setMenuCombinations(
        menuCombinations.map((combo: MenuCombinacion) => 
          combo.id === combinationId 
            ? { ...combo, ...updates, isEditing: false }
            : combo
        )
      );
      
      showNotification('Combinación actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar combinación:', error);
      showNotification('Error al actualizar combinación', 'error');
    } finally {
      setLoadingStates((prev: LoadingStates) => ({ ...prev, updating: null }));
    }
  }, [setLoadingStates, setMenuCombinations, showNotification, menuCombinations]);

  // ✅ FUNCIÓN PARA ELIMINAR COMBINACIÓN
  const handleDeleteCombination = useCallback(async (combinationId: string) => {
    setLoadingStates((prev: LoadingStates) => ({ ...prev, deleting: combinationId }));
    
    try {
      await MenuApiService.deleteCombination(combinationId);

      setMenuCombinations(menuCombinations.filter((combo: MenuCombinacion) => combo.id !== combinationId));
      setShowDeleteConfirm(null);
      
      showNotification('Combinación eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar combinación:', error);
      showNotification('Error al eliminar combinación', 'error');
    } finally {
      setLoadingStates((prev: LoadingStates) => ({ ...prev, deleting: null }));
    }
  }, [setLoadingStates, setMenuCombinations, showNotification, menuCombinations]);

  // ✅ FUNCIÓN PARA TOGGLE FAVORITO
  const handleToggleFavorite = useCallback(async (combinationId: string) => {
    if (!restaurantId) {
      showNotification('No se pudo identificar el restaurante', 'error');
      return;
    }

    try {
      const combination = menuCombinations.find((c: MenuCombinacion) => c.id === combinationId);
      if (!combination) return;

      const newFavoriteState = !combination.favorito;

      await MenuApiService.updateCombination(combinationId, {
        is_favorite: newFavoriteState
      });

      setMenuCombinations(
        menuCombinations.map((combo: MenuCombinacion) => 
          combo.id === combinationId 
            ? { ...combo, favorito: newFavoriteState }
            : combo
        )
      );
      
      showNotification(newFavoriteState ? 'Agregado a favoritos' : 'Removido de favoritos');
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      showNotification('Error al actualizar favorito', 'error');
    }
  }, [restaurantId, menuCombinations, setMenuCombinations, showNotification]);

  // ✅ FUNCIÓN PARA TOGGLE ESPECIAL
  const handleToggleSpecial = useCallback(async (combinationId: string) => {
    if (!restaurantId) {
      showNotification('No se pudo identificar el restaurante', 'error');
      return;
    }

    try {
      const combination = menuCombinations.find((c: MenuCombinacion) => c.id === combinationId);
      if (!combination) return;

      const newSpecialState = !combination.especial;

      await MenuApiService.updateCombination(combinationId, {
        is_special: newSpecialState
      });

      setMenuCombinations(
        menuCombinations.map((combo: MenuCombinacion) => 
          combo.id === combinationId 
            ? { ...combo, especial: newSpecialState }
            : combo
        )
      );
      
      showNotification(newSpecialState ? 'Marcado como especial' : 'Removido de especiales');
    } catch (error) {
      console.error('Error al actualizar especial:', error);
      showNotification('Error al actualizar especial', 'error');
    }
  }, [restaurantId, menuCombinations, setMenuCombinations, showNotification]);

  return (
    <div className="space-y-6">
      
      {/* ✅ CONTROLES Y FILTROS */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar combinaciones..."
                value={searchTermCombo}
                onChange={(e) => setSearchTermCombo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filtersCombo.sortBy}
              onChange={(e) => setFiltersCombo((prev: ComboFilters) => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="created">Ordenar por fecha</option>
            </select>
            
            <button
              onClick={() => setFiltersCombo((prev: ComboFilters) => ({ ...prev, favorites: !prev.favorites }))}
              className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                filtersCombo.favorites
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${filtersCombo.favorites ? 'fill-current' : ''}`} />
              Favoritos
            </button>
            
            <button
              onClick={() => setFiltersCombo((prev: ComboFilters) => ({ ...prev, specials: !prev.specials }))}
              className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                filtersCombo.specials
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 mr-2 ${filtersCombo.specials ? 'fill-current' : ''}`} />
              Especiales
            </button>
            
            <select
              value={filtersCombo.availability}
              onChange={(e) => setFiltersCombo((prev: ComboFilters) => ({ ...prev, availability: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">No disponibles</option>
            </select>
            
            {menuCombinations.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleEditExistingMenu}
                  disabled={loadingStates.loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loadingStates.loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Edit3 className="w-4 h-4 mr-2" />
                  )}
                  {loadingStates.loading ? 'Cargando...' : 'Editar Menú'}
                </button>
                
                <button
                  onClick={onCreateNewMenu}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Menú
                </button>
              </div>
            )}
          </div>
        </div>
        
        {filteredCombinations.length !== menuCombinations.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredCombinations.length} de {menuCombinations.length} combinaciones
          </div>
        )}
      </div>

      {/* ✅ GRID DE COMBINACIONES O ESTADO VACÍO */}
      {filteredCombinations.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCombinations.map((combo: MenuCombinacion) => (
              <div 
                key={combo.id} 
                className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
                  combo.disponible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                } ${combo.isEditing ? 'ring-2 ring-orange-500' : ''}`}
              >
                <div className="space-y-3">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-sm leading-5">
                      {combo.isEditing ? (
                        <input
                          type="text"
                          value={combo.nombre || ''}
                          onChange={(e) => {
                            setMenuCombinations(
                              menuCombinations.map((c: MenuCombinacion) => c.id === combo.id ? { ...c, nombre: e.target.value } : c)
                            );
                          }}
                          className="w-full text-sm font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        combo.nombre || `Combinación #${menuCombinations.indexOf(combo) + 1}`
                      )}
                    </h3>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleToggleFavorite(combo.id)}
                        className={`p-1 hover:bg-red-100 rounded transition-colors ${
                          combo.favorito ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${combo.favorito ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleToggleSpecial(combo.id)}
                        className={`p-1 hover:bg-yellow-100 rounded transition-colors ${
                          combo.especial ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${combo.especial ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="text-xs text-gray-600">
                    {combo.isEditing ? (
                      <textarea
                        value={combo.descripcion || ''}
                        onChange={(e) => {
                          setMenuCombinations(
                            menuCombinations.map((c: MenuCombinacion) => c.id === combo.id ? { ...c, descripcion: e.target.value } : c)
                          );
                        }}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 resize-none"
                        rows={2}
                      />
                    ) : (
                      combo.descripcion || 'Combinación del menú del día'
                    )}
                  </div>

                  {/* Precio */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {combo.isEditing ? (
                          <div className="flex items-center">
                            <span className="text-sm mr-1">$</span>
                            <input
                              type="number"
                              value={combo.precio || 0}
                              onChange={(e) => {
                                setMenuCombinations(
                                  menuCombinations.map((c: MenuCombinacion) => c.id === combo.id ? { ...c, precio: parseInt(e.target.value) || 0 } : c)
                                );
                              }}
                              className="w-20 text-lg font-bold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        ) : (
                          `$${(combo.precio || 0).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    
                    {combo.cantidad && (
                      <div className="text-xs text-gray-600">
                        Cantidad disponible: {combo.cantidad}
                      </div>
                    )}
                  </div>

                  {/* Estado y acciones */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        combo.disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {combo.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                      
                      {combo.especial && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Especial
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {combo.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveCombination(combo.id, combo)}
                            disabled={loadingStates.updating === combo.id}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                          >
                            {loadingStates.updating === combo.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setMenuCombinations(
                                menuCombinations.map((c: MenuCombinacion) => c.id === combo.id ? { ...c, isEditing: false } : c)
                              );
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditCombination(combo.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(combo.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {menuCombinations.length === 0 
                ? 'No hay combinaciones disponibles'
                : 'No se encontraron combinaciones'
              }
            </h3>
            <p className="text-gray-600 mb-8">
              {menuCombinations.length === 0 
                ? 'Crea un menú del día para generar combinaciones automáticamente.'
                : 'Prueba ajustando los filtros de búsqueda.'
              }
            </p>
            <button
              onClick={menuCombinations.length === 0 ? onCreateNewMenu : () => setSearchTermCombo('')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {menuCombinations.length === 0 ? 'Crear Primer Menú' : 'Limpiar Filtros'}
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar combinación?
              </h3>
              
              <p className="text-gray-600 mb-6">
                Esta acción no se puede deshacer. La combinación será eliminada permanentemente del menú.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={loadingStates.deleting === showDeleteConfirm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={() => handleDeleteCombination(showDeleteConfirm)}
                  disabled={loadingStates.deleting === showDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {loadingStates.deleting === showDeleteConfirm ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
