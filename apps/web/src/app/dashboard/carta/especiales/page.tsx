// ========================================
// PÁGINA PRINCIPAL DE ESPECIALES
// File: src/app/dashboard/carta/especiales/page.tsx
// ========================================

'use client';

import React from 'react';
import { useSpecialData } from '@spoon/shared/hooks/special-dishes/useSpecialData';
import SpecialesPage from '../especiales/pages/SpecialesPage';
import SpecialesWizardPage from './pages/SpecialesWizardPage';
import EspecialesCombinationsPage from '../especiales/pages/EspecialesCombinationsPage';

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
    <div className="space-y-6">
      {/* ✅ HEADER DE PÁGINA */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Platos Especiales
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus platos especiales con precios fijos
            </p>
          </div>
          
          {/* ✅ STATS RÁPIDAS */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {specialData.specialDishes.length}
              </div>
              <div className="text-sm text-gray-500">
                Especiales
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {specialData.specialDishes.filter(dish => dish.is_active).length}
              </div>
              <div className="text-sm text-gray-500">
                Activos Hoy
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {specialData.specialCombinations.length}
              </div>
              <div className="text-sm text-gray-500">
                Combinaciones
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ BREADCRUMBS */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <span className="text-gray-500">Dashboard</span>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <span className="text-gray-500">Carta</span>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <span className="text-orange-600 font-medium">Especiales</span>
          </li>
          
          {/* ✅ BREADCRUMB DINÁMICO SEGÚN VISTA */}
          {specialData.currentView !== 'list' && (
            <>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">
                  {specialData.currentView === 'creation' || specialData.currentView === 'wizard' 
                    ? (specialData.currentSpecialDish ? 'Editar' : 'Crear Nuevo')
                    : specialData.currentView === 'combinations'
                    ? `${specialData.currentSpecialDish?.dish_name || 'Combinaciones'}`
                    : specialData.currentView
                  }
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>

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