// ========================================
// PÁGINA PRINCIPAL DE ESPECIALES
// File: src/app/dashboard/carta/especiales/page.tsx
// ========================================

'use client';

import React from 'react';
import { useSpecialData } from '@spoon/shared/hooks/special-dishes/useSpecialData';
import SpecialesPage from './pages/SpecialesPage';
import SpecialesWizardPage from './pages/SpecialesWizardPage';
import EspecialesCombinationsPage from './pages/EspecialesCombinationsPage';

// Nota: Usamos imports estáticos para mayor estabilidad en desarrollo.

export default function EspecialesMainPage() {
  const specialData = useSpecialData();

  // ✅ MOSTRAR LOADING INICIAL
  if (specialData.initialLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--sp-surface)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[color:var(--sp-on-surface)] mb-2">
            Cargando Especiales...
          </h3>
          <p className="text-[color:var(--sp-on-surface-variant)] text-sm">
            Obteniendo información de platos especiales
          </p>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR ERROR SI NO HAY RESTAURANTE
  if (!specialData.restaurantId) {
    return (
      <div className="min-h-screen bg-[color:var(--sp-surface)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[color:var(--sp-error-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-[color:var(--sp-on-surface)] mb-2">
            Error de Configuración
          </h3>
          <p className="text-[color:var(--sp-on-surface-variant)] text-sm">
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
            <div className="text-2xl font-bold text-[color:var(--sp-warning-700)]">
              {specialData.specialDishes.length}
            </div>
            <div className="text-sm text-[color:var(--sp-on-surface-variant)]">Especiales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[color:var(--sp-success-700)]">
              {specialData.specialDishes.filter(dish => dish.is_active).length}
            </div>
            <div className="text-sm text-[color:var(--sp-on-surface-variant)]">Activos Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[color:var(--sp-info-700)]">
              {specialData.specialCombinations.length}
            </div>
            <div className="text-sm text-[color:var(--sp-on-surface-variant)]">Combinaciones</div>
          </div>
        </div>
      </div>

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="min-h-[600px]">
        {renderCurrentView()}
      </div>
      
  {/* Debug Info eliminado */}
    </div>
  );
}