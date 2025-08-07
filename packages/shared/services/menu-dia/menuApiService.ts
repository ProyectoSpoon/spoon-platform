// ✅ REMOVEMOS LA IMPORTACIÓN PROBLEMÁTICA DE TOAST
import { supabase } from '@spoon/shared';

import { Producto, MenuCombinacion } from '../../types/menu-dia/menuTypes';
import { CATEGORIAS_MENU_CONFIG } from '../../constants/menu-dia/menuConstants';

export const MenuApiService = {
  async getProductsByCategory(categoryId: string): Promise<Producto[]> {
    const categoryConfig = CATEGORIAS_MENU_CONFIG.find(c => c.id === categoryId);
    if (!categoryConfig || !categoryConfig.uuid) return [];
    
    const { data, error } = await supabase
      .from('universal_products')
      .select('*')
      .eq('category_id', categoryConfig.uuid)
      .eq('is_verified', true)
      .order('name');

    if (error) throw error;
    
    const transformedData = (data || []).map(item => ({
      ...item,
      price: item.suggested_price_min || 0,
      available: item.is_verified,
      is_favorite: false,
      is_special: item.popularity_score > 80
    }));

    return transformedData;
  },

  async getTodayMenu(restaurantId: string) {
    const { data, error } = await supabase
      .from('daily_menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .eq('menu_date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getMenuCombinations(dailyMenuId: string) {
    const { data, error } = await supabase
      .from('generated_combinations')
      .select('*')
      .eq('daily_menu_id', dailyMenuId)
      .order('generated_at');

    if (error) throw error;
    return data || [];
  },

  async getMenuSelections(dailyMenuId: string) {
    const { data, error } = await supabase
      .from('daily_menu_selections')
      .select('*')
      .eq('daily_menu_id', dailyMenuId)
      .order('category_name', { ascending: true })
      .order('selection_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createDailyMenu(restaurantId: string, menuPrice: number, selectedProducts: any, proteinQuantities: any) {
    const { data: newMenu, error: menuError } = await supabase
      .from('daily_menus')
      .insert({
        restaurant_id: restaurantId,
        menu_price: menuPrice,
        menu_date: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      .select()
      .single();

    if (menuError) throw menuError;
    return newMenu;
  },

  async updateDailyMenu(menuId: string, menuPrice: number) {
    const { error } = await supabase
      .from('daily_menus')
      .update({
        menu_price: menuPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', menuId);

    if (error) throw error;
  },

  async insertMenuSelections(dailyMenuId: string, selectedProducts: any) {
    const selections: any[] = [];
    Object.entries(selectedProducts).forEach(([categoryId, products]: [string, any]) => {
      const categoryConfig = CATEGORIAS_MENU_CONFIG.find(c => c.id === categoryId);
      const categoryName = categoryConfig?.nombre || categoryId;
      
      products.forEach((product: any, index: number) => {
        selections.push({
          daily_menu_id: dailyMenuId,
          universal_product_id: product.id,
          category_id: categoryConfig?.uuid || product.category_id,
          category_name: categoryName,
          product_name: product.name,
          selection_order: index
        });
      });
    });

    if (selections.length > 0) {
      const { error } = await supabase
        .from('daily_menu_selections')
        .insert(selections);

      if (error) throw error;
    }
  },

  async insertProteinQuantities(dailyMenuId: string, proteinQuantities: any) {
    const proteinEntries = Object.entries(proteinQuantities).map(([productId, quantity]) => ({
      daily_menu_id: dailyMenuId,
      protein_product_id: productId,
      planned_quantity: quantity,
      unit_type: 'units'
    }));

    if (proteinEntries.length > 0) {
      const { error } = await supabase
        .from('protein_quantities')
        .insert(proteinEntries);

      if (error) throw error;
    }
  },

  async insertCombinations(dailyMenuId: string, combinations: any[]) {
    const { data, error } = await supabase
      .from('generated_combinations')
      .insert(combinations)
      .select();

    if (error) throw error;
    return data;
  },

  async updateCombination(combinationId: string, updates: any) {
    const dbUpdates = {
      updated_at: new Date().toISOString(),
      ...updates
    };

    const { error } = await supabase
      .from('generated_combinations')
      .update(dbUpdates)
      .eq('id', combinationId);

    if (error) throw error;
  },

  async deleteCombination(combinationId: string) {
    const { error } = await supabase
      .from('generated_combinations')
      .delete()
      .eq('id', combinationId);

    if (error) throw error;
  },

  async deleteMenuSelections(dailyMenuId: string) {
    await supabase.from('daily_menu_selections').delete().eq('daily_menu_id', dailyMenuId);
  },

  async deleteProteinQuantities(dailyMenuId: string) {
    await supabase.from('protein_quantities').delete().eq('daily_menu_id', dailyMenuId);
  },

  async deleteCombinations(dailyMenuId: string) {
    const { error } = await supabase
      .from('generated_combinations')
      .delete()
      .eq('daily_menu_id', dailyMenuId);

    if (error) throw error;
  }
};
