// ========================================
// SPECIAL DISHES REPOSITORY
// File: packages/shared/repositories/specialDishesRepository.ts
// ========================================

import { supabase } from '../lib/supabase';
import { SpecialDishData, SpecialProductSelection } from '../types/special-dishes/specialDishTypes';

export class SpecialDishesRepository {
  // Obtener todos los especiales de un restaurante
  static async getRestaurantSpecialDishes(restaurantId: string): Promise<SpecialDishData[]> {
    const { data, error } = await supabase
      .from('special_dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(dish => ({
      ...dish,
      dish_description: dish.dish_description || undefined,
      image_url: dish.image_url || undefined,
      image_alt: dish.image_alt || undefined,
      status: dish.status as 'draft' | 'active' | 'inactive'
    }));
  }

  // Crear un nuevo especial
  static async createSpecialDish(restaurantId: string, dishData: {
    dish_name: string;
    dish_description: string;
    dish_price: number;
    image_url?: string;
    image_alt?: string;
  }): Promise<SpecialDishData> {
    const { data, error } = await supabase
      .from('special_dishes')
      .insert({
        restaurant_id: restaurantId,
        ...dishData
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      dish_description: data.dish_description || undefined,
      image_url: data.image_url || undefined,
      image_alt: data.image_alt || undefined,
      status: data.status as 'draft' | 'active' | 'inactive'
    };
  }

  // Actualizar un especial existente
  static async updateSpecialDish(id: string, updates: Partial<{
    dish_name: string;
    dish_description: string;
    dish_price: number;
    image_url: string | null;
    image_alt: string | null;
    total_products_selected: number;
    categories_configured: number;
    setup_completed: boolean;
    status: string;
    is_template: boolean;
  }>): Promise<SpecialDishData> {
    const { data, error } = await supabase
      .from('special_dishes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      dish_description: data.dish_description || undefined,
      image_url: data.image_url || undefined,
      image_alt: data.image_alt || undefined,
      status: data.status as 'draft' | 'active' | 'inactive'
    };
  }

  // Eliminar un especial
  static async deleteSpecialDish(id: string): Promise<void> {
    const { error } = await supabase
      .from('special_dishes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Obtener selecciones de productos de un especial
  static async getSpecialDishSelections(specialDishId: string): Promise<SpecialProductSelection[]> {
    const { data, error } = await supabase
      .from('special_dish_selections')
      .select(`
        id,
        special_dish_id,
        universal_product_id,
        category_id,
        category_name,
        product_name,
        selection_order,
        is_required,
        selected_at
      `)
      .eq('special_dish_id', specialDishId)
      .order('selection_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Insertar selecciones de productos
  static async insertSpecialDishSelections(specialDishId: string, selectedProducts: {[categoryId: string]: any[]}): Promise<void> {
    // Primero eliminar selecciones existentes
    await supabase
      .from('special_dish_selections')
      .delete()
      .eq('special_dish_id', specialDishId);

    // Insertar nuevas selecciones
    const selections = [];
    let order = 0;

    for (const [categoryId, products] of Object.entries(selectedProducts)) {
      for (const product of products) {
        selections.push({
          special_dish_id: specialDishId,
          universal_product_id: product.id,
          category_id: categoryId,
          category_name: product.category_name || categoryId,
          product_name: product.name,
          selection_order: order++,
          is_required: false
        });
      }
    }

    if (selections.length > 0) {
      const { error } = await supabase
        .from('special_dish_selections')
        .insert(selections);

      if (error) throw error;
    }
  }

  // Obtener combinaciones de un especial
  static async getSpecialCombinations(specialDishId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('special_dish_combinations')
      .select('*')
      .eq('special_dish_id', specialDishId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Activar/desactivar especial para hoy
  static async toggleSpecialForToday(restaurantId: string, specialDishId: string, activate: boolean, maxQuantity?: number, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      if (activate) {
        // Activar: insertar en daily_activations
        const { error } = await supabase
          .from('daily_special_activations')
          .insert({
            restaurant_id: restaurantId,
            special_dish_id: specialDishId,
            is_active: true,
            daily_max_quantity: maxQuantity,
            notes
          });

        if (error) throw error;
        return { success: true, message: 'Especial activado para hoy' };
      } else {
        // Desactivar: actualizar estado
        const { error } = await supabase
          .from('daily_special_activations')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString()
          })
          .eq('restaurant_id', restaurantId)
          .eq('special_dish_id', specialDishId)
          .eq('is_active', true);

        if (error) throw error;
        return { success: true, message: 'Especial desactivado' };
      }
    } catch (error) {
      console.error('Error toggling special for today:', error);
      return { success: false, message: 'Error al cambiar estado del especial' };
    }
  }
}
