// ========================================
// PÁGINA PRINCIPAL DE LISTA DE ESPECIALES
// File: src/app/dashboard/carta/especiales/pages/SpecialesPage.tsx
// ========================================

'use client';

import React, { useState } from 'react';
import { Plus, Star, Clock, DollarSign, Eye, Edit3, Trash2, Power, PowerOff } from 'lucide-react';

interface SpecialesPageProps {
  specialData: any; // Por ahora any, luego tipamos correctamente
}

export default function SpecialesPage({ specialData }: SpecialesPageProps) {
  const {
    specialDishes,
    setCurrentView,
    setCurrentSpecialDish,
    loadSpecialCombinations,
    toggleSpecialForToday,
    deleteSpecialDishComplete,
    loadingStates
  } = specialData;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ✅ FUNCIÓN PARA CREAR NUEVO ESPECIAL
  const handleCreateNew = () => {
    specialData.openWizard(); // Usar el método del hook
  };

  // ✅ FUNCIÓN PARA EDITAR ESPECIAL
  const handleEditSpecial = (dish: any) => {
    setCurrentSpecialDish(dish);
    // TODO: Cargar datos del especial en el wizard
    specialData.openWizard();
  };

  // ✅ FUNCIÓN PARA VER COMBINACIONES
  const handleViewCombinations = async (dish: any) => {
    setCurrentSpecialDish(dish);
    await loadSpecialCombinations(dish.id);
    setCurrentView('combinations');
  };

  // ✅ FUNCIÓN PARA TOGGLE ACTIVACIÓN
  const handleToggleToday = async (dishId: string, isActive: boolean) => {
    await toggleSpecialForToday(dishId, !isActive);
  };

  // ✅ FUNCIÓN PARA ELIMINAR
  const handleDelete = async (dishId: string) => {
    await deleteSpecialDishComplete(dishId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      
      {/* ✅ HEADER CON BOTÓN CREAR */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Especiales
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Crea y gestiona platos especiales con precios fijos
          </p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Especial
        </button>
      </div>

      {/* ✅ LISTA DE ESPECIALES O ESTADO VACÍO */}
      {specialDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialDishes.map((dish: any) => (
            <div
              key={dish.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* ✅ HEADER DE LA TARJETA */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {dish.dish_name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {dish.dish_description || 'Sin descripción'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  {dish.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo Hoy
                    </span>
                  )}
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    dish.status === 'active' 
                      ? 'bg-blue-100 text-blue-800'
                      : dish.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dish.status === 'active' ? 'Activo' : 
                     dish.status === 'draft' ? 'Borrador' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* ✅ PRECIO */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    ${dish.dish_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ✅ ESTADÍSTICAS */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{dish.total_products_selected} productos</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{dish.categories_configured} categorías</span>
                </div>
              </div>

              {/* ✅ ESTADO DE CONFIGURACIÓN */}
              <div className="mb-4">
                {dish.setup_completed ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Configuración Completa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Configuración Incompleta
                  </span>
                )}
              </div>

              {/* ✅ ACCIONES */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewCombinations(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </button>
                
                <button
                  onClick={() => handleEditSpecial(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </button>
                
                {dish.setup_completed && (
                  <button
                    onClick={() => handleToggleToday(dish.id, dish.is_active)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      dish.is_active
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {dish.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        Activar
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => setShowDeleteConfirm(dish.id)}
                  disabled={loadingStates.deleting === dish.id}
                  className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {loadingStates.deleting === dish.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ✅ ESTADO VACÍO */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No hay platos especiales
            </h3>
            <p className="text-gray-600 mb-8">
              Crea tu primer plato especial con precio fijo para ofrecer opciones premium a tus clientes.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Crear Primer Especial
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar plato especial?
              </h3>
              
              <p className="text-gray-600 mb-6">
                Esta acción eliminará permanentemente el plato especial y todas sus combinaciones. 
                No se puede deshacer.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={loadingStates.deleting === showDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loadingStates.deleting === showDeleteConfirm ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}