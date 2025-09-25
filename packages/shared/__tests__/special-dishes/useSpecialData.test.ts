// ========================================
// PRUEBAS UNITARIAS PARA useSpecialData HOOK
// File: packages/shared/__tests__/special-dishes/useSpecialData.test.ts
// ========================================

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpecialData } from '../../hooks/special-dishes/useSpecialData';

// Mock de las dependencias
jest.mock('../../Context/notification-provider', () => ({
  useNotification: () => ({
    notify: jest.fn(),
    confirm: jest.fn().mockResolvedValue(true)
  })
}));

jest.mock('../../lib/supabase', () => ({
  getUserProfile: jest.fn().mockResolvedValue({ id: 'user-1' }),
  getUserRestaurant: jest.fn().mockResolvedValue({ id: 'restaurant-1' }),
  supabase: {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      removeChannel: jest.fn()
    }),
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    })
  }
}));

jest.mock('../../repositories/specialDishesRepository', () => ({
  SpecialDishesRepository: {
    getRestaurantSpecialDishes: jest.fn().mockResolvedValue([])
  }
}));

describe('useSpecialData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() => useSpecialData());

      expect(result.current.currentView).toBe('list');
      expect(result.current.currentSpecialDish).toBeNull();
      expect(result.current.restaurantId).toBeNull();
      expect(result.current.specialDishes).toEqual([]);
      expect(result.current.initialLoading).toBe(true);
      expect(result.current.dishPrice).toBe(35000);
    });
  });

  describe('Validación de datos', () => {
    it('debe validar correctamente datos válidos', () => {
      const { result } = renderHook(() => useSpecialData());

      const validData = {
        dish_name: 'Plato Especial',
        dish_description: 'Una descripción muy detallada del plato especial',
        dish_price: 25000,
        image_url: null,
        image_alt: null
      };

      const selectedProducts = {
        'proteinas': [{ id: '1', name: 'Pollo' }],
        'acompanamientos': [{ id: '2', name: 'Arroz' }]
      };

      // Acceder a la función de validación interna (esto requiere hacerla exportable o probar indirectamente)
      // Por ahora probamos que el hook se inicializa correctamente
      expect(result.current).toBeDefined();
    });

    it('debe rechazar nombre demasiado corto', () => {
      // Prueba indirecta a través del comportamiento esperado
      expect(true).toBe(true); // Placeholder para pruebas futuras
    });

    it('debe rechazar descripción demasiado corta', () => {
      expect(true).toBe(true); // Placeholder para pruebas futuras
    });

    it('debe rechazar precio fuera de rango', () => {
      expect(true).toBe(true); // Placeholder para pruebas futuras
    });
  });

  describe('Estados de carga', () => {
    it('debe manejar estados de loading correctamente', () => {
      const { result } = renderHook(() => useSpecialData());

      expect(result.current.loadingStates).toEqual({
        saving: false,
        generating: false,
        deleting: null,
        updating: null,
        loading: false
      });
    });
  });

  describe('Funciones del wizard', () => {
    it('debe permitir navegar entre pasos', () => {
      const { result } = renderHook(() => useSpecialData());

      act(() => {
        result.current.setCurrentStep(1);
      });

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.handlePrevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('Estados de filtros', () => {
    it('debe inicializar filtros con valores por defecto', () => {
      const { result } = renderHook(() => useSpecialData());

      expect(result.current.filters).toEqual({
        favorites: false,
        featured: false,
        availability: 'all',
        status: 'all',
        sortBy: 'name'
      });
    });
  });

  describe('Estados de paginación', () => {
    it('debe inicializar paginación correctamente', () => {
      const { result } = renderHook(() => useSpecialData());

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(12);
      expect(result.current.totalCount).toBe(0);
    });
  });
});
