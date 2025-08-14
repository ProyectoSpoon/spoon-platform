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
            <h2 className="text-xl font-semibold text-[color:var(--sp-on-surface)]">
            Gestión de Especiales
          </h2>
            <p className="text-[color:var(--sp-on-surface-variant)] text-sm mt-1">
            Crea y gestiona platos especiales con precios fijos
          </p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors"
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
              className="bg-[color:var(--sp-surface-elevated)] rounded-lg shadow-sm border border-[color:var(--sp-border)] p-6 hover:shadow-md transition-shadow"
            >
              {/* ✅ HEADER DE LA TARJETA */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-[color:var(--sp-on-surface)] mb-1">
                    {dish.dish_name}
                  </h3>
                    <p className="text-sm text-[color:var(--sp-on-surface-variant)] line-clamp-2">
                    {dish.dish_description || 'Sin descripción'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  {dish.is_active && dish.status === 'active' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]">
                      Activo Hoy
                    </span>
                  )}
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    dish.status === 'active' 
                      ? 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]'
                      : dish.status === 'draft'
                      ? 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'
                      : 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]'
                  }`}>
                    {dish.status === 'active' ? 'Activo' : 
                     dish.status === 'draft' ? 'Borrador' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* ✅ PRECIO */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[color:var(--sp-success-700)]" />
                    <span className="text-2xl font-bold text-[color:var(--sp-on-surface)]">
                    ${dish.dish_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ✅ ESTADÍSTICAS */}
              <div className="flex items-center gap-4 text-sm text-[color:var(--sp-neutral-600)] mb-4">
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]">
                    ✅ Configuración Completa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]">
                    ⚠️ Configuración Incompleta
                  </span>
                )}
              </div>

              {/* ✅ ACCIONES */}
                <div className="flex items-center gap-2 pt-4 border-t border-[color:var(--sp-border)]">
                <button
                  onClick={() => handleViewCombinations(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-[color:var(--sp-info-50)] text-[color:var(--sp-info-700)] rounded-lg hover:bg-[color:var(--sp-info-100)] transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </button>
                
                <button
                  onClick={() => handleEditSpecial(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-100)] transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </button>
                
        {dish.setup_completed && dish.status === 'active' && (
                  <button
          onClick={() => handleToggleToday(dish.id, dish.is_active)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      dish.is_active
                        ? 'bg-[color:var(--sp-error-50)] text-[color:var(--sp-error-700)] hover:bg-[color:var(--sp-error-100)]'
                        : 'bg-[color:var(--sp-success-50)] text-[color:var(--sp-success-700)] hover:bg-[color:var(--sp-success-100)]'
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
                  className="flex items-center px-3 py-2 text-sm bg-[color:var(--sp-error-50)] text-[color:var(--sp-error-700)] rounded-lg hover:bg-[color:var(--sp-error-100)] transition-colors disabled:opacity-50"
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
            <div className="w-24 h-24 bg-[color:var(--sp-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-[color:var(--sp-primary-600)]" />
            </div>
              <h3 className="text-xl font-semibold text-[color:var(--sp-on-surface)] mb-4">
              No hay platos especiales
            </h3>
              <p className="text-[color:var(--sp-on-surface-variant)] mb-8">
              Crea tu primer plato especial con precio fijo para ofrecer opciones premium a tus clientes.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors"
            >
              Crear Primer Especial
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[color:var(--sp-overlay)]" onClick={() => setShowDeleteConfirm(null)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[color:var(--sp-surface-elevated)] rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[color:var(--sp-error-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[color:var(--sp-error-600)]" />
              </div>
              
              <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-2">
                  ¿Eliminar plato especial?
              </h3>
              
              <p className="text-[color:var(--sp-neutral-600)] mb-6">
                Esta acción eliminará permanentemente el plato especial y todas sus combinaciones. 
                No se puede deshacer.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors"
                >
                    Cancelar
                </button>
                
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={loadingStates.deleting === showDeleteConfirm}
                  className="px-4 py-2 bg-[color:var(--sp-error-600)] text-[color:var(--sp-on-error)] rounded-lg hover:bg-[color:var(--sp-error-700)] disabled:opacity-50 transition-colors"
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