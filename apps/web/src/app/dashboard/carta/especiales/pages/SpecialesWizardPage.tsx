// ========================================
// WIZARD DE ESPECIALES - REUTILIZANDO MENUWIZARD
// File: src/app/dashboard/carta/especiales/pages/SpecialesWizardPage.tsx
// ========================================

'use client';

import React from 'react';
import MenuWizardPage from '../../menu-dia/pages/MenuWizardPage';

interface SpecialesWizardPageProps {
  specialData: any;
  onClose: () => void;
}

export default function SpecialesWizardPage({ specialData, onClose }: SpecialesWizardPageProps) {
  
  // ✅ FUNCIÓN PARA COMPLETAR EL WIZARD
  const handleComplete = async (combinations: any[]) => {
    console.log('🎯 Completando wizard de especiales con combinaciones:', combinations);
    
    try {
      // Validar que tenemos los datos mínimos
      const dishName = specialData.dishName || 'Nuevo Especial';
      const dishDescription = specialData.dishDescription || 'Plato especial del restaurante';
      const dishPrice = specialData.dishPrice || 35000;
      
      if (!specialData.selectedProducts || Object.keys(specialData.selectedProducts).length === 0) {
        specialData.showNotification('Debe seleccionar al menos productos para crear el especial', 'error');
        return;
      }
      
      console.log('📋 Datos del especial a crear:', {
        name: dishName,
        description: dishDescription,
        price: dishPrice,
        products: Object.keys(specialData.selectedProducts).length
      });
      
      // Crear el plato especial usando la función del hook
      const newSpecial = await specialData.createNewSpecialDish(
        dishName,
        dishDescription,
        dishPrice,
        specialData.selectedProducts
      );
      
      if (newSpecial) {
        console.log('✅ Especial creado exitosamente:', newSpecial.id);
        onClose();
      } else {
        console.error('❌ Error creando especial');
      }
      
    } catch (error) {
      console.error('❌ Error en handleComplete:', error);
      specialData.showNotification('Error al crear plato especial', 'error');
    }
  };

  // ✅ FUNCIÓN PARA CERRAR EL WIZARD
  const handleClose = () => {
    const canClose = specialData.closeWizard ? specialData.closeWizard() : true;
    if (canClose) {
      onClose();
    }
  };

  // ✅ ADAPTAR DATOS PARA COMPATIBILIDAD CON MENUWIZARDPAGE
  const adaptedMenuData = {
    // Datos principales
    selectedProducts: specialData.selectedProducts,
    setSelectedProducts: specialData.setSelectedProducts,
    availableProducts: specialData.availableProducts,
    loadProductsForCategory: specialData.loadProductsForCategory,
    
    // Búsqueda
    searchTerm: specialData.searchTerm,
    setSearchTerm: specialData.setSearchTerm,
    
    // Estado
    hasUnsavedChanges: specialData.hasUnsavedChanges,
    setHasUnsavedChanges: specialData.setHasUnsavedChanges,
    
    // Precio (mapear dishPrice a menuPrice)
    menuPrice: specialData.dishPrice,
    setMenuPrice: specialData.setDishPrice,
    
    // Cantidades de proteínas
    proteinQuantities: specialData.proteinQuantities,
    setProteinQuantities: specialData.setProteinQuantities,
    
    // Loading
    loadingStates: specialData.loadingStates,
    setLoadingStates: specialData.setLoadingStates,
    
    // Notificaciones
    showNotification: specialData.showNotification,
    
    // Restaurant
    restaurantId: specialData.restaurantId,
    
    // Menú (null para especiales)
    currentMenu: null,
    setCurrentMenu: () => {},
    
    // Combinaciones (mapear a especiales)
    setMenuCombinations: specialData.setSpecialCombinations,
    
    // Estados adicionales requeridos por MenuWizardPage
    currentView: specialData.currentView,
    setCurrentView: specialData.setCurrentView,
    menuCombinations: specialData.specialCombinations,
    initialLoading: specialData.initialLoading,
    loadingProducts: specialData.loadingProducts,
    searchTermCombo: specialData.searchTermCombo,
    setSearchTermCombo: specialData.setSearchTermCombo,
    filters: specialData.filters,
    setFilters: specialData.setFilters,
    filtersCombo: specialData.filtersCombo,
    setFiltersCombo: specialData.setFiltersCombo,
    loadInitialData: specialData.loadInitialData
  };

  const adaptedMenuState = {
    // Estados del wizard
    currentStep: specialData.currentStep,
    isAnimating: specialData.isAnimating,
    
    // Funciones de navegación
    handleNextStep: specialData.handleNextStep,
    handlePrevStep: specialData.handlePrevStep,
    handleProductSelect: specialData.handleProductSelect
  };

  console.log('🔄 Renderizando SpecialesWizardPage');
  console.log('   - Current step:', specialData.currentStep);
  console.log('   - Is animating:', specialData.isAnimating);
  console.log('   - Selected products:', Object.keys(specialData.selectedProducts || {}));

  return (
    <MenuWizardPage
      menuData={adaptedMenuData}
      menuState={adaptedMenuState}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}