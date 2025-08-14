'use client';

import React from 'react';
import { Settings, Grid } from 'lucide-react';
import { useMenuData } from '@spoon/shared/hooks/menu-dia/useMenuData';
import { useMenuState } from '@spoon/shared/hooks/menu-dia/useMenuState';
import { MenuCombinacion } from '@spoon/shared/types/menu-dia/menuTypes';
import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import MenuConfigurationPage from './MenuConfigurationPage';
import MenuCombinationsPage from './MenuCombinationsPage';
import MenuWizardPage from './MenuWizardPage';

export default function MenuDiaPage() {
  // ✅ HOOKS COMPARTIDOS
  const menuData = useMenuData() as any;
  const menuState = useMenuState();

  const {
    currentView,
    setCurrentView,
    currentMenu,
    menuCombinations,
    initialLoading
  } = menuData;

  const {
    showSlideOver,
    openSlideOver,
    closeSlideOver
  } = menuState;

  // ✅ FUNCIÓN PARA CREAR NUEVO MENÚ
  const handleCreateNewMenu = () => {
    if (menuData.hasUnsavedChanges) {
      if (!confirm('¿Estás seguro? Perderás los cambios no guardados.')) return;
    }
    
    setCurrentView('creation');
    menuState.resetWizard();
    menuData.setSelectedProducts({});
    menuData.setMenuCombinations([]);
    menuData.setHasUnsavedChanges(false);
    openSlideOver();
  };

  // ✅ FUNCIÓN PARA COMPLETAR WIZARD - VERSIÓN COMPLETA CON GUARDADO EN SUPABASE
  const handleWizardComplete = async (combinations: any[]) => {
    console.log('🎯 Recibiendo combinaciones:', combinations.length);
    
    if (combinations.length > 0) {
      try {
        // Mostrar loading
        menuData.setLoadingStates((prev: any) => ({ ...prev, saving: true }));

        // Preparar combinaciones para Supabase
        const combinationsForDB = combinations.map(combo => ({
          // daily_menu_id se asigna en el servicio
          combination_name: combo.nombre,
          combination_description: combo.descripcion,
          combination_price: combo.precio,
          principio_product_id: combo.principio.id,
          proteina_product_id: combo.proteina.id,
          entrada_product_id: combo.entrada?.id || null,
          bebida_product_id: combo.bebida?.id || null,
          acompanamiento_products: combo.acompanamiento?.map((item: any) => item.id) || [], 
          is_available: true,
          is_favorite: false,
          is_special: false
        }));

        // Guardar todo en una sola llamada (crea o actualiza)
        console.log('💾 Guardando Menú del Día (upsert + reemplazo de items) ...');
        const result = await MenuApiService.saveDailyMenuWithItems({
          restaurantId: menuData.restaurantId,
          menuPrice: menuData.menuPrice,
          selectedProducts: menuData.selectedProducts,
          proteinQuantities: menuData.proteinQuantities,
          combinations: combinationsForDB
        });

        // Actualizar estado local
        menuData.setCurrentMenu(result.menu);
        menuData.setMenuCombinations(combinations);
        menuData.setHasUnsavedChanges(false);
        setCurrentView('combinations');
        closeSlideOver();
        
        // Quitar loading
        menuData.setLoadingStates((prev: any) => ({ ...prev, saving: false }));
        
        menuData.showNotification(`✅ Menú guardado exitosamente con ${combinations.length} combinaciones`, 'success');
        console.log('🎉 ¡Menú guardado exitosamente!');
        
      } catch (error: any) {
        console.error('❌ Error al guardar menú:', error);
        menuData.setLoadingStates((prev: any) => ({ ...prev, saving: false }));

        // 409: conflicto por menú existente
        const isConflict =
          error?.code === '23505' ||
          error?.status === 409 ||
          /duplicate key|unique constraint/i.test(error?.message || '');

        if (isConflict) {
          menuData.showNotification(
            'Ya existe un Menú del Día creado para hoy. Abre el existente desde "Combinaciones" o elimina el actual antes de crear uno nuevo.',
            'error'
          );
          return;
        }

        // 403/42501: falla de RLS/permiso en Supabase
        const isRls = error?.status === 403 || error?.code === '42501' || /row-level security/i.test(error?.message || '');
        if (isRls) {
          menuData.showNotification(
            'No tienes permisos para guardar este menú. Verifica que la sesión esté activa y que el restaurante actual coincida con el daily_menu_id.',
            'error'
          );
          return;
        }

        // Mensaje genérico
        menuData.showNotification('Error al guardar el menú. Inténtalo de nuevo.', 'error');
      }
    } else {
      menuData.showNotification('Error: No se pudieron generar combinaciones.', 'error');
    }
  };

  // ✅ LOADING INICIAL
  if (initialLoading) {
    return (
    <div className="min-h-screen bg-[color:var(--sp-neutral-50)] flex items-center justify-center">
        <div className="bg-[--sp-surface-elevated] rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-2">
            Cargando información del menú...
          </h3>
      <p className="text-[color:var(--sp-neutral-600)] text-sm">
            Estamos preparando todo para ti.
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[color:var(--sp-neutral-50)]">
      <div className="container mx-auto px-4 py-8">
        
        {/* ✅ HEADER */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="heading-page">Menú del Día</h1>
        <p className="text-[color:var(--sp-neutral-600)] mt-1">
                Configura y gestiona el menú diario de tu restaurante
              </p>
              {currentMenu && (
                <div className="mt-2 flex items-center gap-2">
          <div className="px-3 py-1 bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)] rounded-full text-sm font-medium">
                    ✅ Menú activo desde {new Date(currentMenu.created_at).toLocaleDateString()}
                  </div>
          <div className="px-2 py-1 bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)] rounded-full text-xs">
                    ${currentMenu.menu_price?.toLocaleString()} COP
                  </div>
                </div>
              )}
            </div> 
          </div>
        </div>

        {/* ✅ NAVEGACIÓN POR PESTAÑAS */}
        <div className="mb-8">
      <div className="flex bg-[color:var(--sp-neutral-100)] rounded-lg p-1 max-w-sm">
            <button
              onClick={() => setCurrentView('creation')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                currentView === 'creation' 
          ? 'bg-[--sp-surface] text-[color:var(--sp-neutral-900)] shadow-sm' 
          : 'text-[color:var(--sp-neutral-600)] hover:text-[color:var(--sp-neutral-900)]'
              }`}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </button>
            <button
              onClick={() => setCurrentView('combinations')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                currentView === 'combinations' 
          ? 'bg-[--sp-surface] text-[color:var(--sp-neutral-900)] shadow-sm' 
          : 'text-[color:var(--sp-neutral-600)] hover:text-[color:var(--sp-neutral-900)]'
              }`}
            >
              <Grid className="h-4 w-4" />
              Combinaciones ({menuCombinations.length})
            </button>
          </div>
        </div>

        {/* ✅ CONTENIDO PRINCIPAL */}
        {currentView === 'creation' ? (
          <MenuConfigurationPage 
            menuData={menuData}
            onOpenWizard={openSlideOver}
            onCreateNewMenu={handleCreateNewMenu}
          />
        ) : (
          <MenuCombinationsPage 
            menuData={menuData}
            onOpenWizard={openSlideOver}
            onCreateNewMenu={handleCreateNewMenu}
          />
        )}

        {/* ✅ WIZARD MODAL */}
        {showSlideOver && (
          <MenuWizardPage 
            menuData={menuData}
            menuState={menuState}
            onClose={() => closeSlideOver(menuData.hasUnsavedChanges)}
            onComplete={handleWizardComplete}
          />
        )}

        {/* ✅ LOADING OVERLAY DURANTE GUARDADO */}
        {menuData.loadingStates?.saving && (
          <div className="fixed inset-0 bg-[--sp-overlay] backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[--sp-surface-elevated] rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-2">
                Guardando menú...
              </h3>
              <p className="text-[color:var(--sp-neutral-600)] text-sm">
                Estamos guardando tu configuración en la base de datos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}