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
        
        // 1. Crear el menú del día
        console.log('📝 Creando menú del día...');
        const newMenu = await MenuApiService.createDailyMenu(
          menuData.restaurantId, 
          menuData.menuPrice, 
          menuData.selectedProducts, 
          menuData.proteinQuantities
        );
        console.log('✅ Menú creado:', newMenu.id);
        
        // 2. Guardar selecciones de productos
        console.log('📦 Guardando selecciones de productos...');
        await MenuApiService.insertMenuSelections(newMenu.id, menuData.selectedProducts);
        
        // 3. Guardar cantidades de proteínas
        console.log('🍖 Guardando cantidades de proteínas...');
        await MenuApiService.insertProteinQuantities(newMenu.id, menuData.proteinQuantities);
        
        // 4. Preparar y guardar combinaciones para Supabase
        const combinationsForDB = combinations.map(combo => ({
          daily_menu_id: newMenu.id,
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
        // 5. Insertar combinaciones en Supabase
        console.log('💾 Guardando combinaciones en Supabase...');
        await MenuApiService.insertCombinations(newMenu.id, combinationsForDB);
        
        // 6. Actualizar estado local
        menuData.setCurrentMenu(newMenu);
        menuData.setMenuCombinations(combinations);
        menuData.setHasUnsavedChanges(false);
        setCurrentView('combinations');
        closeSlideOver();
        
        // Quitar loading
        menuData.setLoadingStates((prev: any) => ({ ...prev, saving: false }));
        
        menuData.showNotification(`✅ Menú guardado exitosamente con ${combinations.length} combinaciones`, 'success');
        console.log('🎉 ¡Menú guardado exitosamente!');
        
      } catch (error) {
        console.error('❌ Error guardando menú:', error);
        menuData.setLoadingStates((prev: any) => ({ ...prev, saving: false }));
        menuData.showNotification('Error guardando el menú. Inténtalo de nuevo.', 'error');
      }
    } else {
      menuData.showNotification('Error: No se pudieron generar combinaciones.', 'error');
    }
  };

  // ✅ LOADING INICIAL
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando información del menú...
          </h3>
          <p className="text-gray-600 text-sm">
            Estamos preparando todo para ti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* ✅ HEADER */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="heading-page">Menú del Día</h1>
              <p className="text-gray-600 mt-1">
                Configura y gestiona el menú diario de tu restaurante
              </p>
              {currentMenu && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✅ Menú activo desde {new Date(currentMenu.created_at).toLocaleDateString()}
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    ${currentMenu.menu_price?.toLocaleString()} COP
                  </div>
                </div>
              )}
            </div> 
          </div>
        </div>

        {/* ✅ NAVEGACIÓN POR PESTAÑAS */}
        <div className="mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1 max-w-sm">
            <button
              onClick={() => setCurrentView('creation')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                currentView === 'creation' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </button>
            <button
              onClick={() => setCurrentView('combinations')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                currentView === 'combinations' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Guardando menú...
              </h3>
              <p className="text-gray-600 text-sm">
                Estamos guardando tu configuración en la base de datos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}