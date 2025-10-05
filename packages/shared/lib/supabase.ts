import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ SUPABASE CLIENT - Instancia única
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// ✅ TIMEZONE HELPER PARA BOGOTÁ (UTC-5)
export const getBogotaDateISO = (format: 'dateOnly' | 'full' = 'dateOnly'): string => {
  const now = new Date();
  // Convertir a zona horaria de Bogotá (UTC-5)
  const bogotaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));

  if (format === 'dateOnly') {
    return bogotaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  return bogotaTime.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
};

// ✅ HELPER PARA OBTENER FECHA BOGOTÁ EN FORMATO LEGIBLE
export const getBogotaDateString = (): string => {
  const now = new Date();
  const bogotaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));

  return bogotaTime.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ✅ HELPER PARA OBTENER HORA BOGOTÁ EN FORMATO LEGIBLE
export const getBogotaTimeString = (): string => {
  const now = new Date();
  const bogotaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));

  return bogotaTime.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// ✅ GET USER PROFILE
// Función para obtener el perfil del usuario actual
export const getUserProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error loading user profile:', profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// ✅ GET USER RESTAURANT
// Función para obtener el restaurante del usuario actual
export const getUserRestaurant = async () => {
  try {
    const profile = await getUserProfile();

    if (!profile?.restaurant_id) {
      console.log('User has no restaurant assigned');
      return null;
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', profile.restaurant_id)
      .single();

    if (restaurantError) {
      console.error('Error loading user restaurant:', restaurantError);
      return null;
    }

    return restaurant;
  } catch (error) {
    console.error('Error in getUserRestaurant:', error);
    return null;
  }
};

// ✅ GET CURRENT USER
// Función para obtener el usuario actualmente autenticado
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// ✅ GET ACTIVE ROLES
// Función para obtener los roles activos del usuario actual
export const getActiveRoles = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Simplified query to avoid join issues
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        role_id,
        restaurant_id,
        assigned_by,
        assigned_at,
        is_active,
        notes
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading user roles:', error);
      return [];
    }

    // Get system roles separately
    const rolesWithDetails = await Promise.all(
      (userRoles || []).map(async (userRole) => {
        const { data: systemRole } = await supabase
          .from('system_roles')
          .select('id, name')
          .eq('id', userRole.role_id)
          .single();

        return {
          ...userRole,
          system_role: systemRole || null
        };
      })
    );

    return rolesWithDetails;
  } catch (error) {
    console.error('Error in getActiveRoles:', error);
    return [];
  }
};

// ✅ UPDATE RESTAURANT
// Función para actualizar datos de restaurante
export const updateRestaurant = async (restaurantId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateRestaurant:', error);
    throw error;
  }
};

// ✅ SUBSCRIBE TO RESTAURANT UPDATES
// Función para suscribirse a cambios en restaurante
export const subscribeToRestaurantUpdates = (restaurantId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`restaurant-updates-${restaurantId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'restaurants',
      filter: `id=eq.${restaurantId}`
    }, callback)
    .subscribe();

  return channel;
};

// Note: supabaseAdmin is now created locally in storage.ts when needed

// ✅ GASTOS FUNCTIONS
// Función para obtener gastos del día
export const getGastosDelDia = async (restaurantId: string, fechaISO?: string) => {
  const fecha = fechaISO || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('gastos_caja')
    .select(`
      *,
      caja_sesiones!inner(restaurant_id)
    `)
    .eq('caja_sesiones.restaurant_id', restaurantId)
    .gte('registrado_at', `${fecha}T00:00:00`)
    .lt('registrado_at', `${fecha}T23:59:59`);

  if (error) {
    console.error('Error loading gastos del día:', error);
    return {
      gastos: [],
      totalGastos: 0,
      gastosPorCategoria: {
        proveedor: 0,
        servicios: 0,
        suministros: 0,
        otro: 0
      }
    };
  }

  const gastos = data || [];
  const totalGastos = gastos.reduce((sum: number, gasto: any) => sum + (gasto.monto || 0), 0);

  // Agrupar gastos por categoría
  const gastosPorCategoria = gastos.reduce((acc: any, gasto: any) => {
    const categoria = gasto.categoria || 'otro';
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += gasto.monto || 0;
    return acc;
  }, {
    proveedor: 0,
    servicios: 0,
    suministros: 0,
    otro: 0
  });

  return {
    gastos,
    totalGastos,
    gastosPorCategoria
  };
};

// Función para crear un gasto en caja
export const crearGastoCaja = async (gastoData: {
  concepto: string;
  monto: number;
  categoria: string;
  notas?: string;
  comprobante_url?: string;
}) => {
  try {
    const user = await getCurrentUser();
    const profile = await getUserProfile();

    if (!user || !profile?.restaurant_id) {
      throw new Error('Usuario no autenticado o sin restaurante asignado');
    }

    // Verificar que hay una sesión abierta
    const { data: sesionAbierta } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('restaurant_id', profile.restaurant_id)
      .eq('estado', 'abierta')
      .maybeSingle();

    if (!sesionAbierta) {
      throw new Error('No hay una sesión de caja abierta');
    }

    const { data, error } = await supabase
      .from('gastos_caja')
      .insert({
        caja_sesion_id: sesionAbierta.id,
        concepto: gastoData.concepto,
        monto: gastoData.monto,
        categoria: gastoData.categoria,
        notas: gastoData.notas,
        comprobante_url: gastoData.comprobante_url,
        cajero_id: user.id,
        restaurant_id: profile.restaurant_id,
        registrado_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando gasto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in crearGastoCaja:', error);
    throw error;
  }
};

// Función para eliminar un gasto de caja
export const eliminarGastoCaja = async (gastoId: string) => {
  try {
    const { data, error } = await supabase
      .from('gastos_caja')
      .delete()
      .eq('id', gastoId)
      .select()
      .single();

    if (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in eliminarGastoCaja:', error);
    throw error;
  }
};

/**
 * Obtener cierres de caja recientes (sesiones cerradas) con agregados básicos.
 * MVP: últimos N (default 30) ordenados por cierre más reciente.
 * NOTA: optimizable con vista materializada o tabla resumen a futuro.
 */
type CierreCajaResumen = {
  id: string;
  abierta_at: string;
  cerrada_at: string;
  cajero_id: string;
  monto_inicial: number;
  saldo_final_reportado?: number | null;
  total_ventas_centavos: number;
  total_efectivo_centavos: number;
  total_gastos_centavos: number;
};

export const getCierresCajaRecientes = async (restaurantId: string, limite: number = 30): Promise<CierreCajaResumen[]> => {
  try {
    const { data, error } = await supabase
      .from('caja_sesiones')
      .select(`
        id,
        abierta_at,
        cerrada_at,
        cajero_id,
        monto_inicial,
        saldo_final_reportado,
        transacciones_caja!inner(
          monto_total,
          metodo_pago
        ),
        gastos_caja(
          monto
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('estado', 'cerrada')
      .not('cerrada_at', 'is', null)
      .order('cerrada_at', { ascending: false })
      .limit(limite);

    if (error) {
      console.error('Error loading recent caja cierres:', error);
      return [];
    }

    // Aggregate the data
    const cierres = data?.map(sesion => {
      const transacciones = sesion.transacciones_caja || [];
      const gastos = sesion.gastos_caja || [];

      const total_ventas_centavos = transacciones.reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
      const total_efectivo_centavos = transacciones
        .filter((t: any) => t.metodo_pago === 'efectivo')
        .reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
      const total_gastos_centavos = gastos.reduce((sum: number, g: any) => sum + (g.monto || 0) * 100, 0);

      return {
        id: sesion.id,
        abierta_at: sesion.abierta_at,
        cerrada_at: sesion.cerrada_at,
        cajero_id: sesion.cajero_id,
        monto_inicial: sesion.monto_inicial,
        saldo_final_reportado: sesion.saldo_final_reportado,
        total_ventas_centavos,
        total_efectivo_centavos,
        total_gastos_centavos
      };
    }) || [];

    return cierres;
  } catch (error) {
    console.error('Error in getCierresCajaRecientes:', error);
    return [];
  }
};

/**
 * Detalle de un cierre (sesión de caja cerrada) con agregados básicos.
 * No incluye todavía diferencia real (faltan campos de saldo final reportado en schema actual).
 */
export const getCierreCajaDetalle = async (sesionId: string) => {
  try {
    // Get session details
    const { data: sesion, error: sesionError } = await supabase
      .from('caja_sesiones')
      .select('*')
      .eq('id', sesionId)
      .eq('estado', 'cerrada')
      .single();

    if (sesionError || !sesion) {
      console.error('Error loading caja sesion:', sesionError);
      return null;
    }

    // Get transactions
    const { data: transacciones, error: transaccionesError } = await supabase
      .from('transacciones_caja')
      .select(`
        *,
        caja_sesiones!inner(restaurant_id),
        users!transacciones_caja_cajero_id_fkey(first_name, last_name, email)
      `)
      .eq('caja_sesion_id', sesionId);

    if (transaccionesError) {
      console.error('Error loading transacciones:', transaccionesError);
    }

    // Get expenses
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos_caja')
      .select('*')
      .eq('caja_sesion_id', sesionId);

    if (gastosError) {
      console.error('Error loading gastos:', gastosError);
    }

    // Calculate aggregates
    const transaccionesData = transacciones || [];
    const gastosData = gastos || [];

    const total_ventas_centavos = transaccionesData.reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
    const total_efectivo_centavos = transaccionesData
      .filter((t: any) => t.metodo_pago === 'efectivo')
      .reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
    const total_tarjeta_centavos = transaccionesData
      .filter((t: any) => t.metodo_pago === 'tarjeta')
      .reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
    const total_digital_centavos = transaccionesData
      .filter((t: any) => t.metodo_pago === 'digital')
      .reduce((sum: number, t: any) => sum + (t.monto_total || 0) * 100, 0);
    const total_gastos_centavos = gastosData.reduce((sum: number, g: any) => sum + (g.monto || 0) * 100, 0);

    const efectivo_teorico_centavos = (sesion.monto_inicial * 100) + total_efectivo_centavos - total_gastos_centavos;

    return {
      sesion,
      transacciones: transaccionesData,
      gastos: gastosData,
      agregados: {
        total_ventas_centavos,
        total_efectivo_centavos,
        total_tarjeta_centavos,
        total_digital_centavos,
        total_gastos_centavos,
        efectivo_teorico_centavos
      }
    };
  } catch (error) {
    console.error('Error in getCierreCajaDetalle:', error);
    return null;
  }
};

/**
 * Ensure a favorite combination exists for the given core components.
 * If none found, it will create one (schema-compatible: omits optional columns).
 * Matching rule: restaurant + principio + proteina + (entrada or null) + (bebida or null).
 * Note: We ignore acompañamientos when matching to avoid array-order issues.
 */
export const ensureFavoriteCombination = async (data: {
  restaurant_id: string;
  combination_name: string;
  combination_description?: string | null;
  combination_price?: number | null;
  principio_product_id: string;
  proteina_product_id: string;
  entrada_product_id?: string | null;
  bebida_product_id?: string | null;
  acompanamiento_products?: string[];
}): Promise<any> => {
  try {
    // First, try to find existing combination
    const { data: existing, error: findError } = await supabase
      .from('favorite_combinations')
      .select('*')
      .eq('restaurant_id', data.restaurant_id)
      .eq('principio_product_id', data.principio_product_id)
      .eq('proteina_product_id', data.proteina_product_id)
      .eq('entrada_product_id', data.entrada_product_id || null)
      .eq('bebida_product_id', data.bebida_product_id || null)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error finding favorite combination:', findError);
      throw findError;
    }

    if (existing) {
      return existing;
    }

    // Create new combination
    const { data: created, error: createError } = await supabase
      .from('favorite_combinations')
      .insert({
        restaurant_id: data.restaurant_id,
        combination_name: data.combination_name,
        combination_description: data.combination_description,
        combination_price: data.combination_price,
        principio_product_id: data.principio_product_id,
        proteina_product_id: data.proteina_product_id,
        entrada_product_id: data.entrada_product_id,
        bebida_product_id: data.bebida_product_id,
        acompanamiento_products: data.acompanamiento_products || []
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating favorite combination:', createError);
      throw createError;
    }

    return created;
  } catch (error) {
    console.error('Error in ensureFavoriteCombination:', error);
    throw error;
  }
};

/**
 * Delete a favorite combination by its core components.
 * Matching rule mirrors ensureFavoriteCombination: restaurant + principio + proteina + entrada/null + bebida/null.
 */
export const deleteFavoriteCombinationByComponents = async (match: {
  restaurant_id: string;
  principio_product_id?: string | null;
  proteina_product_id?: string | null;
  entrada_product_id?: string | null;
  bebida_product_id?: string | null;
}): Promise<void> => {
  try {
    const { error } = await supabase
      .from('favorite_combinations')
      .delete()
      .eq('restaurant_id', match.restaurant_id)
      .eq('principio_product_id', match.principio_product_id || null)
      .eq('proteina_product_id', match.proteina_product_id || null)
      .eq('entrada_product_id', match.entrada_product_id || null)
      .eq('bebida_product_id', match.bebida_product_id || null);

    if (error) {
      console.error('Error deleting favorite combination by components:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteFavoriteCombinationByComponents:', error);
    throw error;
  }
};

/**
 * Create a favorite combination
 */
export const createFavoriteCombination = async (data: {
  restaurant_id: string;
  combination_name: string;
  combination_description?: string;
  combination_price?: number | null;
  entrada_product_id?: string;
  principio_product_id: string;
  proteina_product_id: string;
  bebida_product_id?: string;
  acompanamiento_products?: string[];
}): Promise<any> => {
  try {
    const { data: created, error } = await supabase
      .from('favorite_combinations')
      .insert({
        restaurant_id: data.restaurant_id,
        combination_name: data.combination_name,
        combination_description: data.combination_description,
        combination_price: data.combination_price,
        entrada_product_id: data.entrada_product_id,
        principio_product_id: data.principio_product_id,
        proteina_product_id: data.proteina_product_id,
        bebida_product_id: data.bebida_product_id,
        acompanamiento_products: data.acompanamiento_products || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating favorite combination:', error);
      throw error;
    }

    return created;
  } catch (error) {
    console.error('Error in createFavoriteCombination:', error);
    throw error;
  }
};

/**
 * Get favorite combinations for a restaurant
 */
export const getFavoriteCombinations = async (restaurant_id: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('favorite_combinations')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading favorite combinations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFavoriteCombinations:', error);
    return [];
  }
};

/**
 * Delete a favorite combination by ID
 */
export const deleteFavoriteCombination = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('favorite_combinations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting favorite combination:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteFavoriteCombination:', error);
    throw error;
  }
};

/**
 * Update favorite combination name
 */
export const updateFavoriteCombinationName = async (id: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('favorite_combinations')
      .update({ combination_name: name })
      .eq('id', id);

    if (error) {
      console.error('Error updating favorite combination name:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateFavoriteCombinationName:', error);
    throw error;
  }
};

/**
 * Get menu templates for a restaurant
 */
export const getMenuTemplates = async (restaurant_id: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_templates')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading menu templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMenuTemplates:', error);
    return [];
  }
};

/**
 * Get products for a specific template
 */
export const getTemplateProducts = async (template_id: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_template_products')
      .select('*')
      .eq('template_id', template_id)
      .order('selection_order', { ascending: true });

    if (error) {
      console.error('Error loading template products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTemplateProducts:', error);
    return [];
  }
};

/**
 * Delete a menu template by ID
 */
export const deleteMenuTemplate = async (id: string): Promise<void> => {
  try {
    // First delete associated products
    const { error: productsError } = await supabase
      .from('menu_template_products')
      .delete()
      .eq('template_id', id);

    if (productsError) {
      console.error('Error deleting template products:', productsError);
      // Continue with template deletion
    }

    // Then delete the template
    const { error: templateError } = await supabase
      .from('menu_templates')
      .delete()
      .eq('id', id);

    if (templateError) {
      console.error('Error deleting menu template:', templateError);
      throw templateError;
    }
  } catch (error) {
    console.error('Error in deleteMenuTemplate:', error);
    throw error;
  }
};

/**
 * Create a menu template with associated products
 */
export const createMenuTemplate = async (
  templateData: {
    restaurant_id: string;
    template_name: string;
    template_description?: string;
    menu_price?: number | null;
  },
  products: Array<{
    universal_product_id: string;
    category_id?: string | null;
    category_name?: string | null;
    product_name?: string | null;
    selection_order?: number;
  }>
): Promise<any> => {
  try {
    // Create the template first
    const { data: template, error: templateError } = await supabase
      .from('menu_templates')
      .insert({
        restaurant_id: templateData.restaurant_id,
        template_name: templateData.template_name,
        template_description: templateData.template_description,
        menu_price: templateData.menu_price
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating menu template:', templateError);
      throw templateError;
    }

    // Add products to the template
    if (products && products.length > 0) {
      const templateProducts = products.map((product, index) => ({
        template_id: template.id,
        universal_product_id: product.universal_product_id,
        category_id: product.category_id,
        category_name: product.category_name,
        product_name: product.product_name,
        selection_order: product.selection_order || index
      }));

      const { error: productsError } = await supabase
        .from('menu_template_products')
        .insert(templateProducts);

      if (productsError) {
        console.error('Error adding products to menu template:', productsError);
        // Don't throw here, template was created successfully
      }
    }

    return template;
  } catch (error) {
    console.error('Error in createMenuTemplate:', error);
    throw error;
  }
};

// ✅ SPECIAL DISHES FUNCTIONS

export interface SpecialDish {
  id: string;
  restaurant_id: string;
  dish_name: string;
  dish_description: string | null;
  dish_price: number;
  is_active: boolean;
  is_template: boolean;
  status: string;
  total_products_selected: number;
  categories_configured: number;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  image_alt?: string | null;
}

export interface SpecialDishSelection {
  id: string;
  special_dish_id: string;
  universal_product_id: string;
  category_id: string;
  category_name: string;
  product_name: string;
  selection_order: number;
  is_required: boolean;
  selected_at: string;
}

export interface SpecialCombination {
  id: string;
  special_dish_id: string;
  combination_name: string;
  combination_description: string | null;
  combination_price: number;
  entrada_product_id: string | null;
  principio_product_id: string | null;
  proteina_product_id: string;
  acompanamiento_products: string[] | null;
  bebida_product_id: string | null;
  is_available: boolean;
  is_favorite: boolean;
  is_featured: boolean;
  available_today: boolean;
  max_daily_quantity: number | null;
  current_sold_quantity: number;
  generated_at: string;
  updated_at: string;
}

/**
 * Obtener especiales disponibles hoy para un restaurante
 */
export const getAvailableSpecialsToday = async (restaurantId: string): Promise<any> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_special_activations')
      .select(`
        id,
        special_dish_id,
        is_active,
        daily_price_override,
        daily_max_quantity,
        notes,
        activated_at,
        special_dishes:special_dish_id (
          dish_name,
          dish_price,
          dish_description,
          image_url,
          image_alt
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('activation_date', today)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading available specials today:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAvailableSpecialsToday:', error);
    return [];
  }
};

/**
 * Obtener especiales disponibles hoy para un restaurante (alias)
 */
export const getRestaurantSpecialDishes = async (restaurantId: string): Promise<SpecialDish[]> => {
  try {
    const { data, error } = await supabase
      .from('special_dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading restaurant special dishes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRestaurantSpecialDishes:', error);
    return [];
  }
};

/**
 * Crear un nuevo plato especial
 */
export const createSpecialDish = async (restaurantId: string, dishData: {
  dish_name: string;
  dish_description?: string;
  dish_price: number;
  image_url?: string | null;
  image_alt?: string | null;
}): Promise<SpecialDish> => {
  try {
    const { data, error } = await supabase
      .from('special_dishes')
      .insert({
        restaurant_id: restaurantId,
        dish_name: dishData.dish_name,
        dish_description: dishData.dish_description,
        dish_price: dishData.dish_price,
        image_url: dishData.image_url,
        image_alt: dishData.image_alt,
        is_active: true,
        is_template: true,
        status: 'draft',
        total_products_selected: 0,
        categories_configured: 0,
        setup_completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating special dish:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createSpecialDish:', error);
    throw error;
  }
};

/**
 * Actualizar plato especial
 */
export const updateSpecialDish = async (specialDishId: string, updates: Partial<SpecialDish>): Promise<SpecialDish> => {
  try {
    const { data, error } = await supabase
      .from('special_dishes')
      .update(updates)
      .eq('id', specialDishId)
      .select()
      .single();

    if (error) {
      console.error('Error updating special dish:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateSpecialDish:', error);
    throw error;
  }
};

/**
 * Obtener selecciones de productos para un plato especial
 */
export const getSpecialDishSelections = async (specialDishId: string): Promise<SpecialDishSelection[]> => {
  try {
    const { data, error } = await supabase
      .from('special_dish_selections')
      .select('*')
      .eq('special_dish_id', specialDishId)
      .order('selection_order', { ascending: true });

    if (error) {
      console.error('Error loading special dish selections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSpecialDishSelections:', error);
    return [];
  }
};

/**
 * Obtener combinaciones de un plato especial
 */
export const getSpecialCombinations = async (specialDishId: string): Promise<SpecialCombination[]> => {
  try {
    const { data, error } = await supabase
      .from('special_combinations')
      .select('*')
      .eq('special_dish_id', specialDishId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error loading special combinations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSpecialCombinations:', error);
    return [];
  }
};

/**
 * Insertar selecciones de productos para un plato especial
 */
export const insertSpecialDishSelections = async (specialDishId: string, selectedProducts: any): Promise<void> => {
  try {
    // First delete existing selections
    await supabase
      .from('special_dish_selections')
      .delete()
      .eq('special_dish_id', specialDishId);

    // Insert new selections
    const selections = Object.entries(selectedProducts).map(([categoryId, products]: [string, any]) => ({
      special_dish_id: specialDishId,
      universal_product_id: products.product_id,
      category_id: categoryId,
      category_name: products.category_name,
      product_name: products.product_name,
      selection_order: products.selection_order || 0,
      is_required: products.is_required || false,
      selected_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('special_dish_selections')
      .insert(selections);

    if (error) {
      console.error('Error inserting special dish selections:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in insertSpecialDishSelections:', error);
    throw error;
  }
};

/**
 * Generar combinaciones automáticas para un plato especial
 */
export const generateSpecialCombinations = async (specialDishId: string, dishName: string, dishPrice: number): Promise<SpecialCombination[]> => {
  try {
    // Get selections first
    const selections = await getSpecialDishSelections(specialDishId);

    if (selections.length === 0) {
      return [];
    }

    // Group by category
    const categories = selections.reduce((acc, selection) => {
      if (!acc[selection.category_id]) {
        acc[selection.category_id] = [];
      }
      acc[selection.category_id].push(selection);
      return acc;
    }, {} as Record<string, SpecialDishSelection[]>);

    // Generate combinations (simplified - just one combination for now)
    const combination = {
      special_dish_id: specialDishId,
      combination_name: `${dishName} - Combinación Estándar`,
      combination_description: `Combinación automática generada para ${dishName}`,
      combination_price: dishPrice,
      entrada_product_id: categories.entradas?.[0]?.universal_product_id || null,
      principio_product_id: categories.principios?.[0]?.universal_product_id || null,
      proteina_product_id: categories.proteinas?.[0]?.universal_product_id || '',
      acompanamiento_products: categories.acompañamientos?.map(s => s.universal_product_id) || [],
      bebida_product_id: categories.bebidas?.[0]?.universal_product_id || null,
      is_available: true,
      is_favorite: false,
      is_featured: false,
      available_today: true,
      max_daily_quantity: null,
      current_sold_quantity: 0,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('special_combinations')
      .insert(combination)
      .select()
      .single();

    if (error) {
      console.error('Error generating special combinations:', error);
      throw error;
    }

    return [data];
  } catch (error) {
    console.error('Error in generateSpecialCombinations:', error);
    return [];
  }
};

/**
 * Activar/Desactivar especial para hoy
 */
export const toggleSpecialToday = async (restaurantId: string, specialDishId: string, activate?: boolean, maxQuantity?: number, notes?: string): Promise<any> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    if (activate) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('daily_special_activations')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('special_dish_id', specialDishId)
        .eq('activation_date', today)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('daily_special_activations')
          .update({
            is_active: true,
            daily_max_quantity: maxQuantity,
            notes,
            activated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('daily_special_activations')
          .insert({
            restaurant_id: restaurantId,
            special_dish_id: specialDishId,
            activation_date: today,
            is_active: true,
            daily_max_quantity: maxQuantity,
            notes,
            activated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } else {
      // Deactivate
      const { data, error } = await supabase
        .from('daily_special_activations')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurantId)
        .eq('special_dish_id', specialDishId)
        .eq('activation_date', today)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error in toggleSpecialToday:', error);
    throw error;
  }
};

/**
 * Actualizar combinación especial
 */
export const updateSpecialCombination = async (combinationId: string, updates: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('special_combinations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', combinationId);

    if (error) {
      console.error('Error updating special combination:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateSpecialCombination:', error);
    throw error;
  }
};

/**
 * Eliminar plato especial completo
 */
export const deleteSpecialDish = async (specialDishId: string): Promise<void> => {
  try {
    // Delete in order: combinations, selections, activations, then dish
    await supabase.from('special_combinations').delete().eq('special_dish_id', specialDishId);
    await supabase.from('special_dish_selections').delete().eq('special_dish_id', specialDishId);
    await supabase.from('daily_special_activations').delete().eq('special_dish_id', specialDishId);

    const { error } = await supabase
      .from('special_dishes')
      .delete()
      .eq('id', specialDishId);

    if (error) {
      console.error('Error deleting special dish:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteSpecialDish:', error);
    throw error;
  }
};

/**
 * Eliminar combinación especial
 */
export const deleteSpecialCombination = async (combinationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('special_combinations')
      .delete()
      .eq('id', combinationId);

    if (error) {
      console.error('Error deleting special combination:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteSpecialCombination:', error);
    throw error;
  }
};

// ✅ AUTHENTICATION FUNCTIONS

// Función para iniciar sesión con email y contraseña
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in signInUser:', error);
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const signUpUser = async (userData: {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}) => {
  try {
    if (!userData.password) {
      throw new Error('Password is required for user registration');
    }

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone
        }
      }
    });

    if (error) {
      console.error('Error signing up user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in signUpUser:', error);
    throw error;
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async (redirectTo?: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

// Función para asegurar que el perfil del usuario existe desde la sesión actual
export const ensureUserProfileFromSession = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('No authenticated user found');
      return null;
    }

    // Obtener o crear perfil de usuario
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError);
      throw profileError;
    }

    // Si no existe el perfil, crearlo desde los datos de auth
    if (!profile) {
      const profileData = {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        throw createError;
      }

      profile = newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error in ensureUserProfileFromSession:', error);
    throw error;
  }
};

// ✅ USER/ROLE MANAGEMENT FUNCTIONS

// Función para verificar si el usuario tiene alguno de los roles especificados
export const hasAnyRole = async (roles: string[]): Promise<boolean> => {
  try {
    const userRoles = await getActiveRoles();
    return userRoles.some((userRole: any) =>
      userRole.system_role && roles.includes(userRole.system_role.name)
    );
  } catch (error) {
    console.error('Error in hasAnyRole:', error);
    return false;
  }
};

// Función para obtener el ID del restaurante actual del usuario
export const getCurrentRestaurantId = async (): Promise<string | null> => {
  try {
    const profile = await getUserProfile();
    return profile?.restaurant_id || null;
  } catch (error) {
    console.error('Error in getCurrentRestaurantId:', error);
    return null;
  }
};

// ✅ CAJA/SESSION FUNCTIONS

// Función para obtener la sesión activa de caja del restaurante
export const getSesionCajaActiva = async (restaurantId: string) => {
  try {
    const { data: sesion, error } = await supabase
      .from('caja_sesiones')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('estado', 'abierta')
      .order('abierta_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error loading active caja session:', error);
      return null;
    }

    return sesion;
  } catch (error) {
    console.error('Error in getSesionCajaActiva:', error);
    return null;
  }
};

// ✅ MESA/TABLE MANAGEMENT FUNCTIONS

// Función para obtener las mesas de un restaurante
export const getMesasRestaurante = async (restaurantId: string) => {
  try {
    const { data: mesas, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error loading restaurant mesas:', error);
      return [];
    }

    return mesas || [];
  } catch (error) {
    console.error('Error in getMesasRestaurante:', error);
    return [];
  }
};

// Función para obtener los detalles de una mesa específica
export const getDetallesMesa = async (mesaId: string) => {
  try {
    const { data: mesa, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('id', mesaId)
      .single();

    if (error) {
      console.error('Error loading mesa details:', error);
      return null;
    }

    return mesa;
  } catch (error) {
    console.error('Error in getDetallesMesa:', error);
    return null;
  }
};

// Función para crear una orden en una mesa
export const crearOrdenMesa = async (mesaId: string, ordenData: {
  items: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
  }>;
  notas?: string;
}) => {
  try {
    const user = await getCurrentUser();
    const profile = await getUserProfile();

    if (!user || !profile?.restaurant_id) {
      throw new Error('Usuario no autenticado o sin restaurante asignado');
    }

    // Verificar que la mesa pertenece al restaurante
    const mesaDetails = await getDetallesMesa(mesaId);
    if (!mesaDetails || mesaDetails.restaurant_id !== profile.restaurant_id) {
      throw new Error('Mesa no encontrada o no pertenece al restaurante');
    }

    // Verificar sesión de caja activa
    const sesionCaja = await getSesionCajaActiva(profile.restaurant_id);
    if (!sesionCaja) {
      throw new Error('No hay una sesión de caja abierta');
    }

    // Calcular total
    const total = ordenData.items.reduce((sum, item) =>
      sum + (item.cantidad * item.precio_unitario), 0
    );

    // Crear la orden
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .insert({
        mesa_id: mesaId,
        restaurant_id: profile.restaurant_id,
        usuario_id: user.id,
        caja_sesion_id: sesionCaja.id,
        total,
        estado: 'abierta',
        notas: ordenData.notas,
        creada_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ordenError) {
      console.error('Error creating orden:', ordenError);
      throw ordenError;
    }

    // Crear items de la orden
    if (ordenData.items && ordenData.items.length > 0) {
      const ordenItems = ordenData.items.map(item => ({
        orden_id: orden.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        notas: item.notas
      }));

      const { error: itemsError } = await supabase
        .from('orden_items')
        .insert(ordenItems);

      if (itemsError) {
        console.error('Error creating orden items:', itemsError);
        // No lanzamos error aquí, la orden ya está creada
      }
    }

    return orden;
  } catch (error) {
    console.error('Error in crearOrdenMesa:', error);
    throw error;
  }
};

// Función para actualizar el estado básico de una mesa
export const actualizarMesaBasica = async (mesaId: string, updates: {
  estado?: string;
  capacidad?: number;
  notas?: string;
}) => {
  try {
    const { data: mesa, error } = await supabase
      .from('mesas')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', mesaId)
      .select()
      .single();

    if (error) {
      console.error('Error updating mesa:', error);
      throw error;
    }

    return mesa;
  } catch (error) {
    console.error('Error in actualizarMesaBasica:', error);
    throw error;
  }
};

// ✅ ORDER FUNCTIONS

// Función para agregar items a una orden existente
export const agregarItemsAOrden = async (ordenId: string, items: Array<{
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  notas?: string;
}>) => {
  try {
    const user = await getCurrentUser();
    const profile = await getUserProfile();

    if (!user || !profile?.restaurant_id) {
      throw new Error('Usuario no autenticado o sin restaurante asignado');
    }

    // Verificar que la orden existe y pertenece al restaurante
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', ordenId)
      .eq('restaurant_id', profile.restaurant_id)
      .single();

    if (ordenError || !orden) {
      throw new Error('Orden no encontrada o no pertenece al restaurante');
    }

    // Crear items de la orden
    const ordenItems = items.map(item => ({
      orden_id: ordenId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
      notas: item.notas
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('orden_items')
      .insert(ordenItems)
      .select();

    if (itemsError) {
      console.error('Error adding items to orden:', itemsError);
      throw itemsError;
    }

    // Actualizar total de la orden
    const totalIncremento = items.reduce((sum, item) =>
      sum + (item.cantidad * item.precio_unitario), 0
    );

    const { error: updateError } = await supabase
      .from('ordenes')
      .update({
        total: (orden.total || 0) + totalIncremento,
        updated_at: new Date().toISOString()
      })
      .eq('id', ordenId);

    if (updateError) {
      console.error('Error updating orden total:', updateError);
      // No lanzamos error crítico aquí
    }

    return newItems;
  } catch (error) {
    console.error('Error in agregarItemsAOrden:', error);
    throw error;
  }
};

/**
 * Obtener transacciones del día para un restaurante
 * Función de compatibilidad para hooks de caja
 */
export const getTransaccionesDelDia = async (restaurantId: string, fechaISO?: string): Promise<{ transacciones: any[]; totalTransacciones: number }> => {
  try {
    const fecha = fechaISO || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('transacciones_caja')
      .select(`
        *,
        caja_sesiones!inner(restaurant_id),
        users!transacciones_caja_cajero_id_fkey(first_name, last_name, email)
      `)
      .eq('caja_sesiones.restaurant_id', restaurantId)
      .gte('created_at', `${fecha}T00:00:00`)
      .lt('created_at', `${fecha}T23:59:59`);

    if (error) {
      console.error('Error loading transacciones del día:', error);
      return { transacciones: [], totalTransacciones: 0 };
    }

    const transacciones = data || [];
    const totalTransacciones = transacciones.reduce((sum: number, trans: any) => sum + (trans.monto_total || 0), 0);

    return {
      transacciones,
      totalTransacciones
    };
  } catch (error) {
    console.error('Error in getTransaccionesDelDia:', error);
    return { transacciones: [], totalTransacciones: 0 };
  }
};

/**
 * Obtener transacciones y gastos en un rango de fechas
 * Función de compatibilidad para hooks de caja
 */
export const getTransaccionesYGastosEnRango = async (
  restaurantId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<{
  transacciones: any[];
  gastos: any[];
  totalTransacciones: number;
  totalGastos: number;
}> => {
  try {
    // Get transactions
    const { data: transacciones, error: transError } = await supabase
      .from('transacciones_caja')
      .select(`
        *,
        caja_sesiones!inner(restaurant_id),
        users!transacciones_caja_cajero_id_fkey(first_name, last_name)
      `)
      .eq('caja_sesiones.restaurant_id', restaurantId)
      .gte('created_at', fechaInicio)
      .lt('created_at', fechaFin)
      .order('created_at', { ascending: true });

    if (transError) {
      console.error('Error loading transacciones en rango:', transError);
      return { transacciones: [], gastos: [], totalTransacciones: 0, totalGastos: 0 };
    }

    // Get expenses
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos_caja')
      .select(`
        *,
        caja_sesiones!inner(restaurant_id)
      `)
      .eq('caja_sesiones.restaurant_id', restaurantId)
      .gte('registrado_at', fechaInicio)
      .lt('registrado_at', fechaFin)
      .order('registrado_at', { ascending: true });

    if (gastosError) {
      console.error('Error loading gastos en rango:', gastosError);
      return { transacciones: [], gastos: [], totalTransacciones: 0, totalGastos: 0 };
    }

    const totalTransacciones = (transacciones || []).reduce((sum: number, trans: any) => sum + (trans.monto_total || 0), 0);
    const totalGastos = (gastos || []).reduce((sum: number, gasto: any) => sum + (gasto.monto || 0), 0);

    return {
      transacciones: transacciones || [],
      gastos: gastos || [],
      totalTransacciones,
      totalGastos
    };
  } catch (error) {
    console.error('Error in getTransaccionesYGastosEnRango:', error);
    return { transacciones: [], gastos: [], totalTransacciones: 0, totalGastos: 0 };
  }
};

/**
 * Obtener reportes de ventas por período
 * Función de compatibilidad para ReportesAvanzados.tsx
 */
export const getReportesVentas = async (restaurantId: string, periodo: { fechaInicio: string; fechaFin: string }): Promise<{ data: any[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('transacciones_caja')
      .select(`
        *,
        caja_sesiones!inner(restaurant_id),
        users!transacciones_caja_cajero_id_fkey(first_name, last_name)
      `)
      .eq('caja_sesiones.restaurant_id', restaurantId)
      .gte('created_at', periodo.fechaInicio)
      .lt('created_at', periodo.fechaFin)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error in getReportesVentas:', error);
    return { data: null, error };
  }
};

// ✅ PRELOAD USER AND RESTAURANT DATA
// Función para precargar datos de usuario y restaurante al inicio
export const preloadUserAndRestaurant = async (): Promise<{
  user: any | null;
  profile: any | null;
  restaurant: any | null;
  roles: any[];
} | null> => {
  try {
    // Obtener sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.log('No active session found');
      return null;
    }

    const user = session.user;

    // Obtener perfil de usuario
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error loading user profile:', profileError);
      return { user, profile: null, restaurant: null, roles: [] };
    }

    // Obtener restaurante si existe
    let restaurant = null;
    if (profile?.restaurant_id) {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', profile.restaurant_id)
        .single();

      if (!restaurantError) {
        restaurant = restaurantData;
      }
    }

    // Obtener roles del usuario usando la función corregida
    const roles = await getActiveRoles();

    // Cache the data for future use
    const result = {
      user,
      profile,
      restaurant,
      roles
    };

    console.log('✅ User and restaurant data preloaded:', {
      userId: user.id,
      restaurantId: profile?.restaurant_id,
      rolesCount: roles.length
    });

    return result;

  } catch (error) {
    console.error('Error in preloadUserAndRestaurant:', error);
    return null;
  }
};
