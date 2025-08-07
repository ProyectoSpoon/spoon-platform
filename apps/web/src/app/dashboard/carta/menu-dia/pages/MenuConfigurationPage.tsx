'use client';

import React from 'react';
import { Plus, Save, RefreshCw, Download, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { CATEGORIAS_MENU_CONFIG, CATEGORY_ICONS } from '@spoon/shared/constants/menu-dia/menuConstants';
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
    setSelectedProducts,
    setHasUnsavedChanges,
    showNotification
  } = menuData;

  // ✅ FUNCIÓN PARA GUARDAR MENÚ
  const handleSaveMenu = async () => {
    menuData.setLoadingStates((prev: LoadingStates) => ({ ...prev, saving: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasUnsavedChanges(false);
      showNotification('Menú guardado exitosamente');
    } catch (error) {
      showNotification('Error al guardar el menú', 'error');
    } finally {
      menuData.setLoadingStates((prev: LoadingStates) => ({ ...prev, saving: false }));
    }
  };

  // ✅ FUNCIÓN PARA EXPORTAR MENÚ
  const handleExportMenu = () => {
    try {
      const exportData = {
        selectedProducts,
        menuCombinations: menuData.menuCombinations,
        menuPrice: menuData.menuPrice,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-dia-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Menú exportado exitosamente');
    } catch (error) {
      showNotification('Error al exportar el menú', 'error');
    }
  };

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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Productos del Menú</h3>
              <p className="text-sm text-gray-600 mt-1">
                {totalProducts} productos seleccionados en {totalCategories} categorías
              </p>
              {hasUnsavedChanges && (
                <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Hay cambios sin guardar
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveMenu}
                disabled={loadingStates.saving || !hasUnsavedChanges}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingStates.saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loadingStates.saving ? 'Guardando...' : 'Guardar'}
              </button>
              
              <button
                onClick={handleExportMenu}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <button
                onClick={onOpenWizard}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Editar Menú
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría del Menú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(selectedProducts).map(([categoryId, productos]: [string, Producto[]]) =>
                  productos.map((producto) => {
                    const categoryName = CATEGORIAS_MENU_CONFIG.find(cat => cat.id === categoryId)?.nombre || categoryId;
                    
                    return (
                      <tr key={`${categoryId}-${producto.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-orange-600">
                                  {getIconForCategory(categoryName)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {producto.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {producto.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(producto.price || producto.suggested_price_min || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleRemoveProduct(categoryId, producto.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
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
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No hay productos seleccionados
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Usa el asistente paso a paso para seleccionar productos de cada categoría y crear tu menú del día. 
              Las combinaciones se generarán automáticamente.
            </p>
            <button
              onClick={onOpenWizard}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Crear Menú del Día
            </button>
          </div>
        </div>
      )}

      {/* ✅ LOADING OVERLAY */}
      {loadingStates.saving && (
        <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Guardando menú...
            </h3>
            <p className="text-gray-600 text-sm">
              Estamos guardando tu configuración de menú.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

