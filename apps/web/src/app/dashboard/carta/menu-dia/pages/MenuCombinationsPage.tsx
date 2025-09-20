'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Heart, Star, RefreshCw, Check, X, 
  Trash2, Edit3 
} from 'lucide-react';
import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import { ensureFavoriteCombination as sbEnsureFavoriteCombination, deleteFavoriteCombinationByComponents as sbDeleteFavoriteByComponents } from '@spoon/shared/lib/supabase';
import { mapCombinationUpdatesToDb } from '@spoon/shared/utils/menu-dia/adapters';
import { MenuCombinacion, LoadingStates, ComboFilters } from '@spoon/shared/types/menu-dia/menuTypes';
import { CATEGORIAS_MENU_CONFIG } from '@spoon/shared/constants/menu-dia/menuConstants';
import CombinationsFilterBar from '../components/CombinationsFilterBar';
import CombinationsEmptyState from '../components/CombinationsEmptyState';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CombinationCard from '../components/CombinationCard';

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
  const hasActiveMenu = Boolean(currentMenu && currentMenu.id);

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

  const handleCancelEdit = useCallback((combinationId: string) => {
    setMenuCombinations(
      menuCombinations.map((combo: MenuCombinacion) =>
        combo.id === combinationId ? { ...combo, isEditing: false } : combo
      )
    );
  }, [setMenuCombinations, menuCombinations]);

  // ✅ FUNCIÓN PARA GUARDAR COMBINACIÓN
  const handleSaveCombination = useCallback(async (combinationId: string, updates: MenuCombinacion) => {
    setLoadingStates((prev: LoadingStates) => ({ ...prev, updating: combinationId }));
    
    try {
  const dbUpdates = mapCombinationUpdatesToDb(updates);
  await MenuApiService.updateCombination(combinationId, dbUpdates as any);

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

      // Persist UI flag in generated_combinations
      await MenuApiService.updateCombination(
        combinationId,
        mapCombinationUpdatesToDb({ favorito: newFavoriteState }) as any
      );

      // Helper to resolve core product IDs either from local combo or by fetching from DB
      const resolveCoreIds = async () => {
        let principioId = combination.principio?.id as string | undefined;
        let proteinaId = combination.proteina?.id as string | undefined;
        let entradaId = combination.entrada?.id as string | undefined;
        let bebidaId = combination.bebida?.id as string | undefined;
        let acompIds: string[] | undefined = Array.isArray(combination.acompanamiento)
          ? (combination.acompanamiento as any[]).map((a: any) => a?.id).filter(Boolean)
          : undefined;

        // If any core IDs are missing, fetch the combination row from DB
        if (!principioId || !proteinaId) {
          try {
            const row = await MenuApiService.getCombinationById(combinationId);
            if (row) {
              principioId = row.principio_product_id || principioId;
              proteinaId = row.proteina_product_id || proteinaId;
              entradaId = row.entrada_product_id ?? entradaId ?? null as any;
              bebidaId = row.bebida_product_id ?? bebidaId ?? null as any;
              if (!acompIds && Array.isArray(row.acompanamiento_products)) acompIds = row.acompanamiento_products;
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('fetch combination for IDs failed', e);
          }
        }
        return { principioId, proteinaId, entradaId, bebidaId, acompIds };
      };

      if (newFavoriteState) {
        // If turning on, also ensure a favorite_combinations row exists (for the Favorites tab)
        try {
          const { principioId, proteinaId, entradaId, bebidaId, acompIds } = await resolveCoreIds();
          if (principioId && proteinaId) {
            await sbEnsureFavoriteCombination({
              restaurant_id: restaurantId!,
              combination_name: combination.nombre || 'Combinación',
              combination_description: (combination.descripcion || null) as any,
              combination_price: combination.precio ?? null,
              principio_product_id: principioId,
              proteina_product_id: proteinaId,
              entrada_product_id: entradaId ?? null,
              bebida_product_id: bebidaId ?? null,
              acompanamiento_products: acompIds || [],
            });
          } else {
            showNotification('No se pudo identificar la combinación para guardar como favorito', 'error');
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('ensure favorite failed (non-fatal)', e);
        }
      } else {
        // Turning off: remove any matching favorite row to keep Favorites tab consistent
        try {
          const { principioId, proteinaId, entradaId, bebidaId } = await resolveCoreIds();
          if (principioId && proteinaId) {
            await sbDeleteFavoriteByComponents({
              restaurant_id: restaurantId!,
              principio_product_id: principioId,
              proteina_product_id: proteinaId,
              entrada_product_id: entradaId ?? null,
              bebida_product_id: bebidaId ?? null,
            });
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('delete favorite by components failed (non-fatal)', e);
        }
      }

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

      await MenuApiService.updateCombination(
        combinationId,
        mapCombinationUpdatesToDb({ especial: newSpecialState }) as any
      );

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

  // Guardado explícito como favorito ya no se usa en el card; el toggle se encarga de persistir

  return (
    <div className="space-y-6">
      
      {/* ✅ CONTROLES Y FILTROS */}
      <CombinationsFilterBar
        filters={filtersCombo}
        setFilters={setFiltersCombo}
        searchTerm={searchTermCombo}
        setSearchTerm={setSearchTermCombo}
        hasActiveMenu={hasActiveMenu}
        loadingStates={loadingStates}
        onEditMenu={handleEditExistingMenu}
        onCreateMenu={onCreateNewMenu}
        showPrimaryCta={menuCombinations.length > 0}
      />

      {filteredCombinations.length !== menuCombinations.length && (
        <div className="mt-4 text-sm text-[color:var(--sp-neutral-600)]">
          Mostrando {filteredCombinations.length} de {menuCombinations.length} combinaciones
        </div>
      )}

      {/* ✅ GRID DE COMBINACIONES O ESTADO VACÍO */}
      {filteredCombinations.length > 0 ? (
  <div className="bg-[--sp-surface] rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCombinations.map((combo: MenuCombinacion, idx: number) => (
              <CombinationCard
                key={combo.id}
                combo={combo}
                index={idx}
                loadingStates={loadingStates}
                onEdit={handleEditCombination}
                onSave={handleSaveCombination}
                onCancel={handleCancelEdit}
                onToggleFavorite={handleToggleFavorite}
                onToggleSpecial={handleToggleSpecial}
                onAskDelete={(id) => setShowDeleteConfirm(id)}
                onDraftChange={(id, patch) =>
                  setMenuCombinations(
                    menuCombinations.map((c: MenuCombinacion) => (c.id === id ? { ...c, ...patch } : c))
                  )
                }
                // onSaveAsFavorite removed to hide the bottom action button
              />
            ))}
          </div>
        </div>
      ) : (
        <CombinationsEmptyState
          hasActiveMenu={hasActiveMenu}
          hasCombinations={menuCombinations.length > 0}
          onGenerate={() => (hasActiveMenu ? handleEditExistingMenu() : onCreateNewMenu())}
          onClearFilters={() => {
            setSearchTermCombo('');
            setFiltersCombo((prev: ComboFilters) => ({ ...prev, favorites: false, specials: false, availability: 'all' }));
          }}
        />
      )}

      {/* ✅ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <DeleteConfirmationModal
        isOpen={!!showDeleteConfirm}
        busy={loadingStates.deleting === showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteCombination(showDeleteConfirm)}
      />
    </div>
  );
}
