// Evitar dependencias circulares del barrel export
import { supabase } from '../../lib/supabase';

import { Producto, MenuCombinacion as _MenuCombinacion } from '../../types/menu-dia/menuTypes';
import { CATEGORIAS_MENU_CONFIG } from '../../constants/menu-dia/menuConstants';

export const MenuApiService = {
  // ================================
  // Utilidad de caché ligera local
  // ================================
  // Nota: caché en memoria por proceso (TTL corto)
  _cache: new Map<string, { value: any; ts: number }>(),
  _inFlight: new Map<string, Promise<any>>(),
  _key(name: string, key: string) {
    return `${name}::${key}`;
  },
  _invalidate(name: string, key?: string) {
    if (key) {
      this._cache.delete(this._key(name, key));
      return;
    }
    for (const k of Array.from(this._cache.keys()) as string[]) {
      if (typeof k === 'string' && k.startsWith(`${name}::`)) this._cache.delete(k);
    }
  },
  async _withCache<T>(name: string, key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const k = this._key(name, key);
    const hit = this._cache.get(k);
    if (hit && Date.now() - hit.ts < ttlMs) return hit.value as T;
    if (this._inFlight.has(k)) return this._inFlight.get(k) as Promise<T>;
    const p = (async () => {
      try {
        const val = await factory();
        this._cache.set(k, { value: val, ts: Date.now() });
        return val;
      } finally {
        this._inFlight.delete(k);
      }
    })();
    this._inFlight.set(k, p);
    return p;
  },
  async getProductsByCategory(categoryId: string): Promise<Producto[]> {
    const categoryConfig = CATEGORIAS_MENU_CONFIG.find(c => c.id === categoryId);
    if (!categoryConfig || !categoryConfig.uuid) return [];
    const { data, error } = await this._withCache(
      'getProductsByCategory',
      categoryId,
      60_000,
      async () => {
        const { data, error } = await supabase
          .from('universal_products')
          .select('*')
          .eq('category_id', categoryConfig.uuid)
          .eq('is_verified', true)
          .order('name');
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));

    if (error) throw error;
    
  const transformedData = (data || []).map((item: any) => ({
      ...item,
      price: item.suggested_price_min || 0,
      available: item.is_verified,
      is_favorite: false,
      is_special: item.popularity_score > 80
    }));

    return transformedData;
  },

  async getTodayMenu(restaurantId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this._withCache(
      'getTodayMenu',
      `${restaurantId}:${today}`,
      15_000,
      async () => {
        const { data, error } = await supabase
          .from('daily_menus')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('status', 'active')
          .eq('menu_date', today)
          .maybeSingle(); // evita 406 cuando 0 filas
        if (error && (error as any).code !== 'PGRST116') throw error;
        return data || null;
      }
    ).then((d) => ({ data: d, error: null as any }));

    if (error) throw error;
    return data;
  },

  async getMenuCombinations(dailyMenuId: string) {
    const { data, error } = await this._withCache(
      'getMenuCombinations',
      dailyMenuId,
      15_000,
      async () => {
        const { data, error } = await supabase
          .from('generated_combinations')
          .select('*')
          .eq('daily_menu_id', dailyMenuId)
          .order('generated_at');
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));

    if (error) throw error;
    return data || [];
  },

  async getMenuSelections(dailyMenuId: string) {
    const { data, error } = await this._withCache(
      'getMenuSelections',
      dailyMenuId,
      30_000,
      async () => {
        const { data, error } = await supabase
          .from('daily_menu_selections')
          .select('*')
          .eq('daily_menu_id', dailyMenuId)
          .order('category_name', { ascending: true })
          .order('selection_order', { ascending: true });
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));

    if (error) throw error;
    return data || [];
  },

  async createDailyMenu(restaurantId: string, menuPrice: number, _selectedProducts: any, _proteinQuantities: any) {
    const today = new Date().toISOString().split('T')[0];

    // Upsert para evitar conflicto único (restaurant_id, menu_date)
    const { data: upserted, error: menuError } = await supabase
      .from('daily_menus')
      .upsert(
        {
          restaurant_id: restaurantId,
          menu_date: today,
          status: 'active',
          menu_price: menuPrice,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'restaurant_id,menu_date' }
      )
      .select()
      .single();

    if (menuError) throw menuError;

    // invalidaciones selectivas
    this._invalidate('getTodayMenu', `${restaurantId}:${today}`);
    this._invalidate('getMenuCombinations');
    this._invalidate('getMenuSelections');

    return upserted;
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
  this._invalidate('getTodayMenu');
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

    // Reemplazo idempotente: borrar existentes y volver a insertar
    await supabase.from('daily_menu_selections').delete().eq('daily_menu_id', dailyMenuId);

    if (selections.length > 0) {
      const { error } = await supabase.from('daily_menu_selections').insert(selections);
      if (error) throw error;
    }
  this._invalidate('getMenuSelections', dailyMenuId);
  this._invalidate('getMenuCombinations', dailyMenuId);
  },

  async insertProteinQuantities(dailyMenuId: string, proteinQuantities: any) {
    const proteinEntries = Object.entries(proteinQuantities).map(([productId, quantity]) => ({
      daily_menu_id: dailyMenuId,
      protein_product_id: productId,
      planned_quantity: quantity,
      unit_type: 'units'
    }));

    // Reemplazo idempotente
    await supabase.from('protein_quantities').delete().eq('daily_menu_id', dailyMenuId);

    if (proteinEntries.length > 0) {
      const { error } = await supabase.from('protein_quantities').insert(proteinEntries);
      if (error) throw error;
    }
  this._invalidate('getTodayMenu');
  },

  async insertCombinations(dailyMenuId: string, combinations: any[]) {
    // Reemplazo idempotente
    await supabase.from('generated_combinations').delete().eq('daily_menu_id', dailyMenuId);
    // Asegurar que cada fila tenga el daily_menu_id correcto
    const rows = (combinations || []).map((c) => ({ ...c, daily_menu_id: dailyMenuId }));
    const { data, error } = await supabase
      .from('generated_combinations')
      .insert(rows)
      .select();

    if (error) throw error;
  this._invalidate('getMenuCombinations', dailyMenuId);
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
  this._invalidate('getMenuCombinations');
  },

  async deleteCombination(combinationId: string) {
    const { error } = await supabase
      .from('generated_combinations')
      .delete()
      .eq('id', combinationId);

    if (error) throw error;
  this._invalidate('getMenuCombinations');
  },

  async deleteMenuSelections(dailyMenuId: string) {
  await supabase.from('daily_menu_selections').delete().eq('daily_menu_id', dailyMenuId);
  this._invalidate('getMenuSelections', dailyMenuId);
  },

  async deleteProteinQuantities(dailyMenuId: string) {
  await supabase.from('protein_quantities').delete().eq('daily_menu_id', dailyMenuId);
  this._invalidate('getTodayMenu');
  },

  async deleteCombinations(dailyMenuId: string) {
    const { error } = await supabase
      .from('generated_combinations')
      .delete()
      .eq('daily_menu_id', dailyMenuId);

    if (error) throw error;
  this._invalidate('getMenuCombinations', dailyMenuId);
  },

  // ================================
  // Orquestador: guardar todo en una sola llamada
  // ================================
  async saveDailyMenuWithItems(params: {
    restaurantId: string;
    menuPrice: number;
    selectedProducts: any;
    proteinQuantities: any;
    combinations: any[]; // combinaciones ya en formato DB
  }) {
    const { restaurantId, menuPrice, selectedProducts, proteinQuantities, combinations } = params;

    // 1) Upsert del menú del día
    const menu = await this.createDailyMenu(restaurantId, menuPrice, selectedProducts, proteinQuantities);

    // 2) Reemplazo idempotente de selecciones
    await this.insertMenuSelections(menu.id, selectedProducts);

    // 3) Reemplazo idempotente de cantidades de proteína
    await this.insertProteinQuantities(menu.id, proteinQuantities);

    // 4) Reemplazo idempotente de combinaciones
    await this.insertCombinations(menu.id, combinations);

    return {
      menu,
      counts: {
        selections: Object.values(selectedProducts || {}).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0),
        proteins: Object.keys(proteinQuantities || {}).length,
        combinations: combinations?.length || 0,
      }
    };
  }
};
