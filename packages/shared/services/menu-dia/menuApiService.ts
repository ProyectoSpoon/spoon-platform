// Evitar dependencias circulares del barrel export
import { supabase, getBogotaDateISO } from '../../lib/supabase';

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
  
  // ================================
  // Favoritos: combinaciones reutilizables por restaurante
  // ================================
  async saveFavoriteCombination(restaurantId: string, combo: any) {
    // combo esperado: { nombre, descripcion, precio, principio, proteina, entrada?, bebida?, acompanamiento?[] }
    const row = {
      restaurant_id: restaurantId,
      combination_name: combo?.nombre || null,
      combination_description: combo?.descripcion || null,
      combination_price: combo?.precio ?? null,
      principio_product_id: combo?.principio?.id || null,
      proteina_product_id: combo?.proteina?.id || null,
      entrada_product_id: combo?.entrada?.id || null,
      bebida_product_id: combo?.bebida?.id || null,
      acompanamiento_products: Array.isArray(combo?.acompanamiento)
        ? combo.acompanamiento.map((p: any) => p.id)
        : [],
    };

    const { data, error } = await supabase
      .from('favorite_combinations')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getFavoriteCombinations(restaurantId: string) {
    const { data, error } = await this._withCache(
      'getFavoriteCombinations',
      restaurantId,
      30_000,
      async () => {
        const { data, error } = await supabase
          .from('favorite_combinations')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));
    if (error) throw error;
    return data || [];
  },

  async deleteFavoriteCombination(favoriteId: string) {
    const { error } = await supabase
      .from('favorite_combinations')
      .delete()
      .eq('id', favoriteId);
    if (error) throw error;
    this._invalidate('getFavoriteCombinations');
  },

  async updateFavoriteCombinationName(favoriteId: string, name: string) {
    const { error } = await supabase
      .from('favorite_combinations')
      .update({ combination_name: name, updated_at: new Date().toISOString() })
      .eq('id', favoriteId);
    if (error) throw error;
    this._invalidate('getFavoriteCombinations');
  },

  // ================================
  // Plantillas de menú (selecciones + precio)
  // ================================
  async saveMenuTemplate(params: {
    restaurantId: string;
    templateName: string;
    templateDescription?: string;
    menuPrice?: number | null;
    selectedProducts: Record<string, any[]>; // keys: categoryId ('principios', 'proteinas', ...)
  }) {
    const { restaurantId, templateName, templateDescription, menuPrice, selectedProducts } = params;

    // 1) Insertar plantilla
    const { data: template, error: tplErr } = await supabase
      .from('menu_templates')
      .insert({
        restaurant_id: restaurantId,
        template_name: templateName,
        template_description: templateDescription || null,
        menu_price: menuPrice ?? null,
      })
      .select()
      .single();
    if (tplErr) throw tplErr;

    // 2) Insertar productos asociados
    const rows: any[] = [];
    for (const [categoryId, products] of Object.entries(selectedProducts || {})) {
      const cfg = CATEGORIAS_MENU_CONFIG.find((c) => c.id === categoryId);
      const categoryUuid = cfg?.uuid || null;
      const categoryName = cfg?.nombre || categoryId;
      (products || []).forEach((p: any, idx: number) => {
        rows.push({
          template_id: template.id,
          universal_product_id: p.id,
          category_id: categoryUuid || p.category_id || null,
          category_name: categoryName,
          product_name: p.name,
          selection_order: idx,
        });
      });
    }

    if (rows.length > 0) {
      const { error: prodErr } = await supabase.from('menu_template_products').insert(rows);
      if (prodErr) throw prodErr;
    }

    // Invalidate cache
    this._invalidate('getMenuTemplates', restaurantId);
    return template;
  },

  async getMenuTemplates(restaurantId: string) {
    const { data, error } = await this._withCache(
      'getMenuTemplates',
      restaurantId,
      30_000,
      async () => {
        const { data, error } = await supabase
          .from('menu_templates')
          .select('*')
          .eq('restaurant_id', restaurantId);
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));
    if (error) throw error;
    return data || [];
  },

  async getTemplateProducts(templateId: string) {
    const { data, error } = await this._withCache(
      'getTemplateProducts',
      templateId,
      30_000,
      async () => {
        const { data, error } = await supabase
          .from('menu_template_products')
          .select('*')
          .eq('template_id', templateId)
          .order('category_name', { ascending: true })
          .order('selection_order', { ascending: true });
        if (error) throw error;
        return data || [];
      }
    ).then((d) => ({ data: d, error: null as any }));
    if (error) throw error;
    return data || [];
  },

  async deleteMenuTemplate(templateId: string) {
    const { error } = await supabase
      .from('menu_templates')
      .delete()
      .eq('id', templateId);
    if (error) throw error;
    this._invalidate('getMenuTemplates');
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

  async getProductsByIds(productIds: string[]) {
    const ids = (productIds || []).filter(Boolean);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('universal_products')
      .select('*')
      .in('id', ids);
    if (error) throw error;
    return data || [];
  },

  async getTodayMenu(restaurantId: string) {
    const today = getBogotaDateISO('dateOnly');
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
    // Usar fecha de hoy en zona America/Bogota
    const today = getBogotaDateISO('dateOnly');
    const expiresAt = getBogotaDateISO('full'); // Para timestamp completo

    // Upsert para evitar conflicto único (restaurant_id, menu_date)
    const { data: upserted, error: menuError } = await supabase
      .from('daily_menus')
      .upsert(
        {
          restaurant_id: restaurantId,
          menu_date: today,
          status: 'active',
          menu_price: menuPrice,
          expires_at: expiresAt,
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

  async getCombinationById(combinationId: string) {
    const { data, error } = await supabase
      .from('generated_combinations')
      .select('*')
      .eq('id', combinationId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
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
  // Analytics: historial de uso de productos por restaurante
  // ================================
  async getProductUsageHistory(restaurantId: string) {
    const { data, error } = await this._withCache(
      'getProductUsageHistory',
      restaurantId,
      60_000,
      async () => {
        const { data, error } = await supabase
          .from('restaurant_product_usage')
          .select(
            `
            id,
            universal_product_id,
            times_used,
            last_used_date,
            first_used_date,
            total_orders,
            avg_rating,
            restaurant_price,
            universal_products!inner (
              name,
              category_id,
              universal_categories!inner (
                name
              )
            )
            `
          )
          .eq('restaurant_id', restaurantId)
          .order('times_used', { ascending: false });
        if (error) throw error;

        const rows = (data || []) as any[];
        return rows.map((row) => {
          const up = row.universal_products || {};
          const categoryUuid = up.category_id as string | undefined;
          const cat = CATEGORIAS_MENU_CONFIG.find((c) => c.uuid === categoryUuid);
          const dbCategoryName = (up.universal_categories && (up.universal_categories as any).name) || undefined;
          return {
            id: row.id,
            universal_product_id: row.universal_product_id,
            product_name: up.name || 'Producto',
            // Preferir nombre desde DB; fallback al mapping local por uuid
            category_name: dbCategoryName || cat?.nombre || 'Otro',
            times_used: row.times_used ?? 0,
            last_used_date: row.last_used_date,
            first_used_date: row.first_used_date,
            total_orders: row.total_orders ?? 0,
            avg_rating: row.avg_rating ?? null,
            restaurant_price: row.restaurant_price ?? 0,
          };
        });
      }
    ).then((d) => ({ data: d, error: null as any }));

    if (error) throw error;
    return data || [];
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
