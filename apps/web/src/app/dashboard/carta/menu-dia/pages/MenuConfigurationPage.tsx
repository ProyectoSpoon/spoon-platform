'use client';

import React from 'react';
import { Plus, Save, RefreshCw, Trash2, Eye, AlertTriangle } from 'lucide-react';

// Type casting for React type conflicts
const PlusComponent = Plus as any;
const SaveComponent = Save as any;
const RefreshCwComponent = RefreshCw as any;
const Trash2Component = Trash2 as any;
const EyeComponent = Eye as any;
const AlertTriangleComponent = AlertTriangle as any;
import { CATEGORIAS_MENU_CONFIG, CATEGORY_ICONS } from '@spoon/shared/constants/menu-dia/menuConstants';
import { createMenuTemplate } from '@spoon/shared/lib/supabase';
import { Producto, LoadingStates } from '@spoon/shared/types/menu-dia/menuTypes';

interface MenuData {
  selectedProducts: {[categoryId: string]: Producto[]};
  hasUnsavedChanges: boolean;
  loadingStates: LoadingStates;
  menuCombinations: any[];
  menuPrice: number;
  setSelectedProducts: (products: {[categoryId: string]: Producto[]}) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setLoadingStates: (setter: (prev: LoadingStates) => LoadingStates) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  restaurantId?: string | null;
}

interface Props {
  menuData: MenuData;
  onOpenWizard: () => void;
  onCreateNewMenu: () => void;
}

export default function MenuConfigurationPage({ menuData, onOpenWizard, onCreateNewMenu }: Props) {
  const {
    selectedProducts,
    hasUnsavedChanges,
    loadingStates,
    menuPrice,
    setSelectedProducts,
    setHasUnsavedChanges,
    showNotification
  } = menuData;

  // ✅ FUNCIÓN PARA GUARDAR MENÚ
  const handleSaveMenu = async () => {
    menuData.setLoadingStates((prev: LoadingStates) => ({ ...prev, saving: true }));
    try {
      const restaurantId = menuData.restaurantId || null;
      if (!restaurantId) {
        showNotification('No se pudo identificar el restaurante', 'error');
        return;
      }

      // Preguntar nombre de plantilla
      let templateName = window.prompt('Nombre para la plantilla a guardar:', `Plantilla ${new Date().toLocaleDateString('es-CO')}`) || '';
      templateName = templateName.trim();
      if (!templateName) {
        showNotification('Guardado cancelado: necesitas un nombre.', 'error');
        return;
      }
      const products: Array<{
        universal_product_id: string;
        category_id?: string | null;
        category_name?: string | null;
        product_name?: string | null;
      }> = [];

      for (const [categoryId, productos] of Object.entries(selectedProducts)) {
        const cfg = CATEGORIAS_MENU_CONFIG.find((c) => c.id === categoryId);
        const categoryName = cfg?.nombre || categoryId;
        const categoryUuid = cfg?.uuid || null;
        (productos || []).forEach((p) => {
          products.push({
            universal_product_id: p.id,
            category_id: p.category_id || categoryUuid,
            category_name: categoryName,
            product_name: p.name,
          });
        });
      }

      await createMenuTemplate(
        {
          restaurant_id: restaurantId,
          template_name: templateName,
        },
        products
      );

      setHasUnsavedChanges(false);
      showNotification('Plantilla guardada');
    } catch (error) {
      console.error('Error al guardar plantilla desde Configuración:', error);
      showNotification('Error al guardar plantilla', 'error');
    } finally {
      menuData.setLoadingStates((prev: LoadingStates) => ({ ...prev, saving: false }));
    }
  };

  // (Eliminado) Función de exportar menú ya no es necesaria

  // ✅ FUNCIÓN PARA OBTENER ICONO DE CATEGORÍA
  const getIconForCategory = (nombre: string) => {
    return CATEGORY_ICONS[nombre as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  };

  // ✅ FUNCIÓN PARA ELIMINAR PRODUCTO
  const handleRemoveProduct = (categoryId: string, productId: string) => {
    setSelectedProducts({
      ...selectedProducts,
      [categoryId]: selectedProducts[categoryId]?.filter(p => p.id !== productId) || []
    });
    setHasUnsavedChanges(true);
  };

  const totalProducts = Object.values(selectedProducts).flat().length;
  const totalCategories = Object.keys(selectedProducts).length;

  return (
    <div className="space-y-6">
      {/* ✅ TABLA DE PRODUCTOS SELECCIONADOS */}
      {totalProducts > 0 ? (
        <div className="bg-[--sp-surface] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[color:var(--sp-neutral-200)] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)]">Productos del Menú</h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
                {totalProducts} productos seleccionados en {totalCategories} categorías
              </p>
              {hasUnsavedChanges && (
                <div className="mt-2 flex items-center gap-2 text-[color:var(--sp-warning-600)] text-sm">
                  <AlertTriangleComponent className="h-4 w-4" />
                  Hay cambios sin guardar
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveMenu}
                disabled={loadingStates.saving || totalProducts === 0}
                className="flex items-center px-4 py-2 bg-[color:var(--sp-success-600)] text-[--sp-on-success] rounded-lg hover:bg-[color:var(--sp-success-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingStates.saving ? (
                  <RefreshCwComponent className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <SaveComponent className="w-4 h-4 mr-2" />
                )}
                {loadingStates.saving ? 'Guardando...' : 'Guardar'}
              </button>
              
              {/* Botón de exportar eliminado por requerimiento */}
              
              <button
                onClick={onOpenWizard}
                className="flex items-center px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors"
              >
                <PlusComponent className="w-4 h-4 mr-2" />
                Editar Menú
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[color:var(--sp-neutral-50)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Categoría del Menú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Precio Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[--sp-surface] divide-y divide-[color:var(--sp-neutral-200)]">
                {Object.entries(selectedProducts).map(([categoryId, productos]: [string, Producto[]]) =>
                  productos.map((producto) => {
                    const categoryName = CATEGORIAS_MENU_CONFIG.find(cat => cat.id === categoryId)?.nombre || categoryId;
                    
                    return (
                      <tr key={`${categoryId}-${producto.id}`} className="hover:bg-[color:var(--sp-neutral-50)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[color:var(--sp-primary-100)] flex items-center justify-center">
                                <span className="text-sm font-medium text-[color:var(--sp-primary-600)]">
                                  {getIconForCategory(categoryName)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                                {producto.name}
                              </div>
                              <div className="text-sm text-[color:var(--sp-neutral-500)]">
                                {producto.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--sp-neutral-900)]">
                          ${(producto.price || producto.suggested_price_min || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button className="text-[color:var(--sp-info-600)] hover:text-[color:var(--sp-info-900)] transition-colors">
                              <EyeComponent className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleRemoveProduct(categoryId, producto.id)}
                              className="text-[color:var(--sp-error-600)] hover:text-[color:var(--sp-error-900)] transition-colors"
                            >
                              <Trash2Component className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ✅ ESTADO VACÍO */
  <div className="bg-[--sp-surface] rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-[color:var(--sp-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
              <PlusComponent className="w-12 h-12 text-[color:var(--sp-primary-600)]" />
            </div>
            <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-4">
              No hay productos seleccionados
            </h3>
            <p className="text-[color:var(--sp-neutral-600)] mb-8 max-w-md mx-auto">
              Usa el asistente paso a paso para seleccionar productos de cada categoría y crear tu menú del día. 
              Las combinaciones se generarán automáticamente.
            </p>
            <button
              onClick={onOpenWizard}
              className="px-6 py-3 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors"
            >
              Crear Menú del Día
            </button>
          </div>
        </div>
      )}

      {/* ✅ LOADING OVERLAY */}
      {loadingStates.saving && (
        <div className="fixed inset-0 z-40 bg-[--sp-overlay] backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[--sp-surface-elevated] rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
            <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">
              Guardando menú...
            </h3>
            <p className="text-[color:var(--sp-neutral-600)] text-sm">
              Estamos guardando tu configuración de menú.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


