// ========================================
// PÁGINA PRINCIPAL DE LISTA DE ESPECIALES
// File: src/app/dashboard/carta/especiales/pages/SpecialesPage.tsx
// ========================================

'use client';

import React, { useState, useEffect } from 'react';
// Iconos temporalmente como emojis (lucide-react removido por conflicto de tipos)

// Componente de Skeleton Loading
const SpecialCardSkeleton = () => (
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg shadow-sm border border-[color:var(--sp-border)] p-5 sm:p-6 animate-pulse">
    {/* Imagen skeleton */}
    <div className="w-full aspect-video rounded-md bg-[color:var(--sp-neutral-200)] mb-4"></div>

    {/* Header skeleton */}
    <div className="flex flex-col mb-4 gap-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 bg-[color:var(--sp-neutral-200)] rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[color:var(--sp-neutral-200)] rounded w-full mb-1"></div>
          <div className="h-4 bg-[color:var(--sp-neutral-200)] rounded w-2/3"></div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <div className="h-6 w-16 bg-[color:var(--sp-neutral-200)] rounded-full"></div>
          <div className="h-6 w-20 bg-[color:var(--sp-neutral-200)] rounded-full"></div>
        </div>
      </div>
    </div>

    {/* Precio skeleton */}
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[color:var(--sp-neutral-200)] rounded"></div>
        <div className="h-8 bg-[color:var(--sp-neutral-200)] rounded w-24"></div>
      </div>
    </div>

    {/* Estadísticas skeleton */}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-4">
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-[color:var(--sp-neutral-200)] rounded"></div>
        <div className="h-4 bg-[color:var(--sp-neutral-200)] rounded w-16"></div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-[color:var(--sp-neutral-200)] rounded"></div>
        <div className="h-4 bg-[color:var(--sp-neutral-200)] rounded w-20"></div>
      </div>
    </div>

    {/* Estado skeleton */}
    <div className="mb-4">
      <div className="h-6 bg-[color:var(--sp-neutral-200)] rounded-full w-32"></div>
    </div>

    {/* Acciones skeleton */}
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[color:var(--sp-border)] mt-auto">
      <div className="h-9 bg-[color:var(--sp-neutral-200)] rounded-lg w-20"></div>
      <div className="h-9 bg-[color:var(--sp-neutral-200)] rounded-lg w-16"></div>
      <div className="h-9 bg-[color:var(--sp-neutral-200)] rounded-lg w-20"></div>
      <div className="h-9 bg-[color:var(--sp-neutral-200)] rounded-lg w-20"></div>
    </div>
  </div>
);

interface SpecialesPageProps {
  specialData: any; // Por ahora any, luego tipamos correctamente
}

export default function SpecialesPage({ specialData }: SpecialesPageProps) {
  const {
  specialDishes,
  specialImages,
    setCurrentView,
    setCurrentSpecialDish,
  toggleSpecialForToday,
    deleteSpecialDishComplete,
    loadingStates,
    initialLoading
  } = specialData;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ✅ FUNCIÓN PARA CREAR NUEVO ESPECIAL
  const handleCreateNew = () => {
    specialData.openWizard(); // Usar el método del hook
  };

  // ✅ FUNCIÓN PARA EDITAR ESPECIAL
  const handleEditSpecial = (dish: any) => {
    // Cargar datos + abrir wizard en modo edición usando nueva función del hook
    if (specialData.editSpecialDish) {
      specialData.editSpecialDish(dish);
    } else {
      setCurrentSpecialDish(dish);
      specialData.openWizard();
    }
  };

  // ✅ ESTADO DETALLE
  const [detailDish, setDetailDish] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailGroups, setDetailGroups] = useState<{[category: string]: string[]}>({});

  const openDetail = async (dish: any) => {
    setDetailDish(dish);
    setDetailGroups({});
    setDetailLoading(true);
    if (specialData.fetchSpecialDishSelectionsGrouped) {
      const grouped = await specialData.fetchSpecialDishSelectionsGrouped(dish.id);
      setDetailGroups(grouped);
    }
    setDetailLoading(false);
  };
  const closeDetail = () => setDetailDish(null);

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
  <div className="space-y-6 px-2 sm:px-0">
      
      {/* ✅ HEADER CON BOTÓN CREAR */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      className="flex items-center justify-center px-4 py-2 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors w-full sm:w-auto"
        >
          <span className="w-4 h-4 mr-2">➕</span>
          Crear Especial
        </button>
      </div>

      {/* ✅ LISTA DE ESPECIALES O ESTADO VACÍO */}
      {initialLoading ? (
        // Loading skeletons
        <div className="grid gap-5 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {Array.from({ length: 6 }).map((_, index) => (
            <SpecialCardSkeleton key={index} />
          ))}
        </div>
      ) : specialDishes.length > 0 ? (
        <div
          className="grid gap-5 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
        >
          {specialDishes.map((dish: any) => {
            const imgSrc = dish.image_url || specialImages[dish.id] || null;
            return (
              <div
                key={dish.id}
                className="bg-[color:var(--sp-surface-elevated)] rounded-lg shadow-sm border border-[color:var(--sp-border)] p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col h-full"
              >
                {/* ✅ HEADER DE LA TARJETA */}
                <div className="flex flex-col mb-4 gap-3">
                  {/* Área de imagen siempre visible */}
                  <div className="w-full aspect-video rounded-md overflow-hidden border border-[color:var(--sp-border)] bg-[color:var(--sp-neutral-100)] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={dish.image_alt || dish.dish_name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const parent = (e.currentTarget.parentElement as HTMLElement);
                          if (parent && !parent.querySelector('[data-fallback]')) {
                            parent.innerHTML = `<div data-fallback class=\"absolute inset-0 flex flex-col items-center justify-center text-[color:var(--sp-neutral-500)] text-xs gap-1\"><span class=\"text-2xl\">📷</span><span>Sin imagen</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div data-fallback className="absolute inset-0 flex flex-col items-center justify-center text-[color:var(--sp-neutral-500)] text-xs gap-1">
                        <span className="text-2xl">📷</span>
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
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
                </div>

              {/* ✅ PRECIO */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-[color:var(--sp-success-700)]">💲</span>
                    <span className="text-2xl font-bold text-[color:var(--sp-on-surface)]">
                    ${dish.dish_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ✅ ESTADÍSTICAS */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[color:var(--sp-neutral-600)] mb-4">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4">⭐</span>
                  <span>{dish.total_products_selected} productos</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4">⏱️</span>
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
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[color:var(--sp-border)] mt-auto">
                <button
                  onClick={() => openDetail(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-[color:var(--sp-info-50)] text-[color:var(--sp-info-700)] rounded-lg hover:bg-[color:var(--sp-info-100)] transition-colors"
                >
                  <span className="w-4 h-4 mr-1">👁️</span>
                  Detalle
                </button>
                
                <button
                  onClick={() => handleEditSpecial(dish)}
                  className="flex items-center px-3 py-2 text-sm bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-100)] transition-colors"
                >
                  <span className="w-4 h-4 mr-1">✏️</span>
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
                        <span className="w-4 h-4 mr-1">⏹️</span>
                        Desactivar
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 mr-1">▶️</span>
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
                  <span className="w-4 h-4 mr-1">🗑️</span>
                  {loadingStates.deleting === dish.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ✅ ESTADO VACÍO */
  <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-[color:var(--sp-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="w-12 h-12 text-[color:var(--sp-primary-600)]">⭐</span>
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
                <span className="w-8 h-8 text-[color:var(--sp-error-600)]">🗑️</span>
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

      {/* ✅ MODAL DETALLE */}
      {detailDish && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[color:var(--sp-overlay)]" onClick={closeDetail} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[color:var(--sp-surface-elevated)] rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--sp-on-surface)] mb-1">{detailDish.dish_name}</h3>
                <p className="text-sm text-[color:var(--sp-on-surface-variant)]">Detalle del plato especial</p>
              </div>
              <button onClick={closeDetail} className="px-2 py-1 rounded hover:bg-[color:var(--sp-neutral-100)]">✖️</button>
            </div>
            { (detailDish.image_url || specialImages[detailDish.id]) && (
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-[color:var(--sp-border)] mb-4 bg-[color:var(--sp-neutral-100)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={detailDish.image_url || specialImages[detailDish.id]} alt={detailDish.image_alt || detailDish.dish_name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[color:var(--sp-neutral-700)] mb-1">Descripción</h4>
                <p className="text-sm text-[color:var(--sp-neutral-600)] whitespace-pre-line">
                  {detailDish.dish_description || 'Sin descripción'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div><span className="font-medium">Precio:</span> ${detailDish.dish_price.toLocaleString('es-CO')}</div>
                <div><span className="font-medium">Estado:</span> {detailDish.status}</div>
                <div><span className="font-medium">Activo hoy:</span> {detailDish.is_active ? 'Sí' : 'No'}</div>
                <div><span className="font-medium">Productos:</span> {detailDish.total_products_selected}</div>
                <div><span className="font-medium">Categorías:</span> {detailDish.categories_configured}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Productos seleccionados</h4>
                {detailLoading && <p className="text-sm text-[color:var(--sp-neutral-500)]">Cargando productos...</p>}
                {!detailLoading && Object.keys(detailGroups).length === 0 && (
                  <p className="text-sm text-[color:var(--sp-neutral-500)] italic">Sin productos</p>
                )}
                {!detailLoading && Object.entries(detailGroups).map(([cat, list]) => (
                  <div key={cat} className="mb-2">
                    <div className="text-xs font-semibold text-[color:var(--sp-neutral-600)]">{cat}</div>
                    <div className="text-xs text-[color:var(--sp-neutral-500)]">{list.join(', ')}</div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <button onClick={closeDetail} className="px-4 py-2 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)]">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
