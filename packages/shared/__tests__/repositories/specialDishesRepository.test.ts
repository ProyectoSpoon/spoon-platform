// ========================================
// PRUEBAS UNITARIAS PARA SpecialDishesRepository
// File: packages/shared/__tests__/repositories/specialDishesRepository.test.ts
// ========================================

import { SpecialDishesRepository } from '../../repositories/specialDishesRepository';

// Mock de Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  }
}));

import { supabase } from '../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('SpecialDishesRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurantSpecialDishes', () => {
    it('debe obtener especiales de un restaurante correctamente', async () => {
      const mockData = [
        {
          id: '1',
          dish_name: 'Plato Especial 1',
          dish_description: 'Descripción 1',
          dish_price: 25000,
          image_url: 'url1',
          image_alt: 'alt1',
          status: 'active'
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await SpecialDishesRepository.getRestaurantSpecialDishes('restaurant-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockData[0],
        dish_description: undefined,
        image_url: undefined,
        image_alt: undefined,
        status: 'active'
      });
    });

    it('debe manejar errores correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      } as any);

      await expect(SpecialDishesRepository.getRestaurantSpecialDishes('restaurant-1'))
        .rejects.toThrow('Database error');
    });
  });

  describe('createSpecialDish', () => {
    it('debe crear un especial correctamente', async () => {
      const mockData = {
        id: '1',
        dish_name: 'Nuevo Plato',
        dish_description: 'Descripción',
        dish_price: 30000
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await SpecialDishesRepository.createSpecialDish('restaurant-1', {
        dish_name: 'Nuevo Plato',
        dish_description: 'Descripción',
        dish_price: 30000
      });

      expect(result).toEqual({
        ...mockData,
        dish_description: undefined,
        image_url: undefined,
        image_alt: undefined,
        status: 'draft'
      });
    });
  });

  describe('updateSpecialDish', () => {
    it('debe actualizar un especial correctamente', async () => {
      const mockData = {
        id: '1',
        dish_name: 'Plato Actualizado',
        dish_description: 'Descripción actualizada',
        dish_price: 35000
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await SpecialDishesRepository.updateSpecialDish('1', {
        dish_name: 'Plato Actualizado'
      });

      expect(result.dish_name).toBe('Plato Actualizado');
    });
  });

  describe('deleteSpecialDish', () => {
    it('debe eliminar un especial correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      } as any);

      await expect(SpecialDishesRepository.deleteSpecialDish('1')).resolves.toBeUndefined();
    });
  });

  describe('getSpecialDishSelections', () => {
    it('debe obtener selecciones de productos correctamente', async () => {
      const mockData = [
        {
          id: '1',
          special_dish_id: 'dish-1',
          universal_product_id: 'prod-1',
          category_id: 'proteinas',
          category_name: 'Proteínas',
          product_name: 'Pollo',
          selection_order: 0,
          is_required: false
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await SpecialDishesRepository.getSpecialDishSelections('dish-1');

      expect(result).toHaveLength(1);
      expect(result[0].product_name).toBe('Pollo');
    });
  });

  describe('insertSpecialDishSelections', () => {
    it('debe insertar selecciones correctamente', async () => {
      const selectedProducts = {
        'proteinas': [{ id: 'prod-1', name: 'Pollo' }],
        'acompanamientos': [{ id: 'prod-2', name: 'Arroz' }]
      };

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null })
      } as any);

      await expect(SpecialDishesRepository.insertSpecialDishSelections('dish-1', selectedProducts))
        .resolves.toBeUndefined();
    });
  });

  describe('toggleSpecialForToday', () => {
    it('debe activar especial para hoy correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null })
      } as any);

      const result = await SpecialDishesRepository.toggleSpecialForToday('restaurant-1', 'dish-1', true);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Especial activado para hoy');
    });

    it('debe desactivar especial correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ error: null })
      } as any);

      const result = await SpecialDishesRepository.toggleSpecialForToday('restaurant-1', 'dish-1', false);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Especial desactivado');
    });

    it('debe manejar errores correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: new Error('Insert error') })
      } as any);

      const result = await SpecialDishesRepository.toggleSpecialForToday('restaurant-1', 'dish-1', true);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al cambiar estado del especial');
    });
  });
});
