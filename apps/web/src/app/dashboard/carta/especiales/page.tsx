// ========================================
// PÁGINA PRINCIPAL DE ESPECIALES
// File: src/app/dashboard/carta/especiales/page.tsx
// ========================================

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSpecialData } from '@spoon/shared/hooks/special-dishes/useSpecialData';

// Carga diferida de secciones pesadas
const SpecialesPage = dynamic(() => import('./pages/SpecialesPage'), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center text-sm text-gray-500">
      Cargando lista de especiales…
    </div>
  ),
});

const SpecialesWizardPage = dynamic(() => import('./pages/SpecialesWizardPage'), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center text-sm text-gray-500">
      Cargando asistente…
    </div>
  ),
});

const EspecialesCombinationsPage = dynamic(
  () => import('./pages/EspecialesCombinationsPage'),
  {
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center text-sm text-gray-500">
        Cargando combinaciones…
      </div>
    ),
  }
);

export default function EspecialesMainPage() {
  const specialData = useSpecialData();

  // ✅ MOSTRAR LOADING INICIAL
  if (specialData.initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando Especiales...
          </h3>
          <p className="text-gray-600 text-sm">
            Obteniendo información de platos especiales
          </p>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR ERROR SI NO HAY RESTAURANTE
  if (!specialData.restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error de Configuración
          </h3>
          <p className="text-gray-600 text-sm">
            No se pudo identificar el restaurante. Verifica tu configuración.
          </p>
        </div>
      </div>
    );
  }

  // ✅ ROUTING INTERNO BASADO EN VISTA ACTUAL
  const renderCurrentView = () => {
    switch (specialData.currentView) {
      case 'creation':
      case 'wizard':
        return (
          <SpecialesWizardPage
            specialData={specialData}
            onClose={() => specialData.setCurrentView('list')}
          />
        );
        
      case 'combinations':
        return (
          <EspecialesCombinationsPage
            specialData={specialData}
            onBack={() => specialData.setCurrentView('list')}
          />
        );
        
      case 'list':
      default:
        return (
          <SpecialesPage
            specialData={specialData}
          />
        );
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* ✅ STATS RÁPIDAS (sin título ni breadcrumbs) */}
      <div className="flex items-center justify-end">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {specialData.specialDishes.length}
            </div>
            <div className="text-sm text-gray-500">Especiales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {specialData.specialDishes.filter(dish => dish.is_active).length}
            </div>
            <div className="text-sm text-gray-500">Activos Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {specialData.specialCombinations.length}
            </div>
            <div className="text-sm text-gray-500">Combinaciones</div>
          </div>
        </div>
      </div>

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="min-h-[600px]">
        {renderCurrentView()}
      </div>
      
      {/* ✅ DEBUG INFO (Solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Vista actual:</strong> {specialData.currentView}
            </div>
            <div>
              <strong>Restaurant ID:</strong> {specialData.restaurantId}
            </div>
            <div>
              <strong>Especiales cargados:</strong> {specialData.specialDishes.length}
            </div>
            <div>
              <strong>Combinaciones:</strong> {specialData.specialCombinations.length}
            </div>
            <div>
              <strong>Productos disponibles:</strong> {Object.keys(specialData.availableProducts).length} categorías
            </div>
            <div>
              <strong>Cambios sin guardar:</strong> {specialData.hasUnsavedChanges ? 'Sí' : 'No'}
            </div>
          </div>
          
          {/* ✅ ACCIONES DE DEBUG */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => console.log('Special Data:', specialData)}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Log Data
            </button>
            <button
              onClick={() => specialData.loadInitialData()}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded"
            >
              Reload Data
            </button>
            <button
              onClick={() => specialData.setCurrentView('list')}
              className="px-3 py-1 bg-orange-500 text-white text-xs rounded"
            >
              Reset View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}