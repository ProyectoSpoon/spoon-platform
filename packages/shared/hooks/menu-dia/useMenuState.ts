'use client';

import { useState, useCallback } from 'react';
import { Producto } from '../../types/menu-dia/menuTypes';

export const useMenuState = () => {
  // ✅ ESTADOS DEL WIZARD
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ✅ FUNCIONES DEL SLIDE-OVER
  const openSlideOver = useCallback(() => {
    setShowSlideOver(true);
    setTimeout(() => setIsAnimating(true), 50);
  }, []);

  const closeSlideOver = useCallback((hasUnsavedChanges?: boolean) => {
    if (hasUnsavedChanges) {
      if (confirm('¿Estás seguro de cerrar? Tienes cambios sin guardar.')) {
        setIsAnimating(false);
        setTimeout(() => setShowSlideOver(false), 300);
        return true;
      }
      return false;
    } else {
      setIsAnimating(false);
      setTimeout(() => setShowSlideOver(false), 300);
      return true;
    }
  }, []);

  // ✅ FUNCIONES DE NAVEGACIÓN DEL WIZARD
  const handleNextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setShowSlideOver(false);
    setIsAnimating(false);
  }, []);

  // ✅ FUNCIÓN PARA SELECCIONAR PRODUCTOS
  const handleProductSelect = useCallback((
    producto: Producto,
    selectedProducts: {[categoryId: string]: Producto[]},
    setSelectedProducts: (products: {[categoryId: string]: Producto[]}) => void,
    categoryId: string,
    setHasUnsavedChanges: (hasChanges: boolean) => void
  ) => {
    setSelectedProducts({
      ...selectedProducts,
      [categoryId]: selectedProducts[categoryId]?.some(p => p.id === producto.id)
        ? selectedProducts[categoryId].filter(p => p.id !== producto.id)
        : [...(selectedProducts[categoryId] || []), producto]
    });
    setHasUnsavedChanges(true);
  }, []);

  // ✅ FUNCIÓN PARA LIMPIAR BÚSQUEDAS
  const clearSearch = useCallback((
    setSearchTerm: (term: string) => void,
    setSearchTermCombo?: (term: string) => void
  ) => {
    setSearchTerm('');
    if (setSearchTermCombo) {
      setSearchTermCombo('');
    }
  }, []);

  // ✅ FUNCIÓN PARA RESETEAR FILTROS - ARREGLADA
  const resetFilters = useCallback((
    setFilters: (filters: any) => void,
    defaultFilters: any,
    setFiltersCombo?: (filters: any) => void,
    defaultComboFilters?: any
  ) => {
    setFilters(defaultFilters);
    if (setFiltersCombo && defaultComboFilters) {
      setFiltersCombo(defaultComboFilters);
    }
  }, []);

  return {
    // Estados del wizard
    showSlideOver,
    setShowSlideOver,
    isAnimating,
    setIsAnimating,
    currentStep,
    setCurrentStep,
    showDeleteConfirm,
    setShowDeleteConfirm,

    // Funciones del slide-over
    openSlideOver,
    closeSlideOver,

    // Funciones de navegación
    handleNextStep,
    handlePrevStep,
    resetWizard,

    // Funciones de utilidad
    handleProductSelect,
    clearSearch,
    resetFilters
  };
};
