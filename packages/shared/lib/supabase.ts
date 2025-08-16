// ========================================
// SUPABASE CLIENT CONFIGURATION
// File: packages/shared/lib/supabase.ts
// ========================================

// Importar tipos de facturación
export type EstadoFactura = 'emitida' | 'anulada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'digital';

export interface NuevaFactura {
  restaurantId: string;
  transaccionId: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  subtotal: number;
  impuestos?: number;
  detallesOrden: any;
  itemsDetalle: any[];
}

import { createClient } from '@supabase/supabase-js';
import { CATEGORIAS_MENU_CONFIG } from '../constants/menu-dia/menuConstants';

// Verificar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}



// ========================================
// CLIENTE PRINCIPAL DE SUPABASE
// ========================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configurar para persistir sesión en localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configuración para RLS
  db: {
    schema: 'public'
  }
});

// ========================================
// UTILIDAD: CACHÉ EN MEMORIA + DEDUP DE PROMESAS
// ========================================
type CacheEntry<T> = { value: T; ts: number };
const __ttlCache = new Map<string, CacheEntry<any>>();
const __inFlight = new Map<string, Promise<any>>();

function __cacheKey(name: string, key: string) {
  return `${name}::${key}`;
}

export function invalidateCache(name: string, key?: string) {
  if (key) {
    __ttlCache.delete(__cacheKey(name, key));
    return;
  }
  // Invalidar todas las entradas de un nombre
  for (const k of Array.from(__ttlCache.keys())) {
    if (k.startsWith(`${name}::`)) __ttlCache.delete(k);
  }
}

async function withCache<T>(
  name: string,
  key: string,
  ttlMs: number,
  factory: () => Promise<T>
): Promise<T> {
  const k = __cacheKey(name, key);
  const hit = __ttlCache.get(k);
  if (hit && Date.now() - hit.ts < ttlMs) return hit.value as T;
  if (__inFlight.has(k)) return __inFlight.get(k) as Promise<T>;
  const p = (async () => {
    try {
      const val = await factory();
      __ttlCache.set(k, { value: val, ts: Date.now() });
      return val;
    } finally {
      __inFlight.delete(k);
    }
  })();
  __inFlight.set(k, p);
  return p;
}

// ========================================
// TIPOS TYPESCRIPT PARA LAS TABLAS
// ========================================

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  restaurant_id: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  
  // Paso 1: Información General
  name: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  cuisine_type: string | null;
  cuisine_type_id: string | null; // ← NUEVO: FK a cuisine_types
  
  // Paso 2: Ubicación
  address: string | null;
  
  // Campos legacy (mantener por compatibilidad)
  city: string | null;
  state: string | null;
  country: string;
  
  // Nuevos campos con foreign keys
  country_id: string | null;    // ← NUEVO: FK a countries
  department_id: string | null; // ← NUEVO: FK a departments  
  city_id: string | null;       // ← NUEVO: FK a cities
  
  latitude: number | null;
  longitude: number | null;
  
  // Paso 3: Horarios
  business_hours: Record<string, any>;
  
  // Paso 4: Imágenes
  logo_url: string | null;
  cover_image_url: string | null;
  
  // Estado de configuración
  setup_completed: boolean;
  setup_step: number;
  status: string;
  
  created_at: string;
  updated_at: string;
}


// ========================================
// NUEVAS INTERFACES PARA GEOLOCALIZACIÓN
// ========================================

export interface Country {
  id: string;
  name: string;
  code: string;
  iso_code: string;
  phone_code: string | null;
  currency: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  country_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  department_id: string;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  is_capital: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CuisineType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// FUNCIONES UTILITARIAS DE AUTH
// ========================================

/**
 * Obtener el usuario actual autenticado
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Obtener el perfil completo del usuario desde la tabla users
 */
// Pequeño caché en memoria para perfil de usuario (TTL 30s)
let __profileCache: { value: User | null; ts: number } | null = null;
let __profileInFlight: Promise<User | null> | null = null;

export const getUserProfile = async (): Promise<User | null> => {
  // 1) Cache hit (30s)
  if (__profileCache && Date.now() - __profileCache.ts < 30_000) {
    return __profileCache.value;
  }

  // Evitar llamadas paralelas duplicadas
  if (__profileInFlight) {
    return __profileInFlight;
  }

  __profileInFlight = (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        __profileCache = { value: null, ts: Date.now() };
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      __profileCache = { value: data, ts: Date.now() };
      return data;
    } finally {
      __profileInFlight = null;
    }
  })();

  return __profileInFlight;
};

/**
 * Obtener el restaurante del usuario actual
 */
// Pequeño caché en memoria para evitar llamadas repetidas en ventanas cortas
let __restaurantCache: { value: Restaurant | null; ts: number } | null = null;
let __restaurantInFlight: Promise<Restaurant | null> | null = null;

export const getUserRestaurant = async (): Promise<Restaurant | null> => {
  // 1) Cache hit (30s)
  if (__restaurantCache && Date.now() - __restaurantCache.ts < 30_000) {
    return __restaurantCache.value;
  }

  // 2) Obtener usuario autenticado y consultar restaurante por owner_id
  if (__restaurantInFlight) {
    return __restaurantInFlight;
  }

  __restaurantInFlight = (async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        __restaurantCache = { value: null, ts: Date.now() };
        return null;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') {
          __restaurantCache = { value: null, ts: Date.now() };
          return null; // No encontrado
        }
        throw error;
      }

      __restaurantCache = { value: data, ts: Date.now() };
      return data;
    } finally {
      __restaurantInFlight = null;
    }
  })();

  return __restaurantInFlight;
};

/**
 * Registrar un nuevo usuario
 */
export const signUpUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}) => {
  // 1. Crear usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
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

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // 2. Crear perfil en public.users
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      role: 'restaurant_owner'
    })
    .select()
    .single();

  if (profileError) throw profileError;

  return {
    user: authData.user,
    profile: profileData
  };
};

/**
 * Iniciar sesión
 */
export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Actualizar last_login
  if (data.user) {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  return data;
};

/**
 * Cerrar sesión
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ========================================
// FUNCIONES PARA GESTIÓN DE RESTAURANTES
// ========================================

/**
 * Crear un nuevo restaurante
 */
export const createRestaurant = async (restaurantData: Partial<Restaurant>) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      ...restaurantData,
      setup_step: 1,
      setup_completed: false,
      status: 'configuring'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualizar información del restaurante
 */
export const updateRestaurant = async (
  restaurantId: string, 
  updates: Partial<Restaurant>
) => {
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualizar paso de configuración
 */
export const updateSetupStep = async (
  restaurantId: string, 
  step: number,
  completed?: boolean
) => {
  const updates: Partial<Restaurant> = {
    setup_step: step
  };

  if (completed !== undefined) {
    updates.setup_completed = completed;
    if (completed) {
      updates.status = 'active';
    }
  }

  return updateRestaurant(restaurantId, updates);
};

// ========================================
// SUBSCRIPCIONES EN TIEMPO REAL
// ========================================

/**
 * Suscribirse a cambios en el restaurante del usuario
 */
export const subscribeToRestaurantUpdates = (
  restaurantId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`restaurant-${restaurantId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'restaurants',
        filter: `id=eq.${restaurantId}`
      },
      callback
    )
    .subscribe();
};

// ========================================
// PRELOAD: CALENTAR CACHÉS EN CLIENTE
// ========================================

/**
 * Precarga en paralelo el perfil de usuario y el restaurante (calienta cachés de 30s)
 * Útil para layouts/páginas raíz para evitar múltiples llamadas repetidas en navegación.
 */
export const preloadUserAndRestaurant = async () => {
  try {
    await Promise.all([
      getUserProfile().catch(() => null),
      getUserRestaurant().catch(() => null),
    ]);
  } catch {
    // no-op: preloading es best-effort
  }
};

// ========================================
// UTILIDADES PARA DEBUGGING
// ========================================

/**
 * Obtener información de debug del usuario actual
 */
export const getDebugInfo = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const profile = await getUserProfile();
  const restaurant = await getUserRestaurant();

  return {
    session: session ? {
      user_id: session.user.id,
      email: session.user.email,
      expires_at: session.expires_at
    } : null,
    profile,
    restaurant: restaurant ? {
      id: restaurant.id,
      name: restaurant.name,
      setup_step: restaurant.setup_step,
      setup_completed: restaurant.setup_completed
    } : null
  };
};


// ========================================
// NUEVAS INTERFACES PARA PLATOS ESPECIALES
// Agregar al archivo packages/shared/lib/supabase.ts después de las interfaces existentes
// ========================================

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

export interface DailySpecialActivation {
  id: string;
  restaurant_id: string;
  special_dish_id: string;
  activation_date: string;
  is_active: boolean;
  daily_price_override: number | null;
  daily_max_quantity: number | null;
  notes: string | null;
  activated_at: string;
  deactivated_at: string | null;
}

// ========================================
// INTERFACES PARA SISTEMA MAESTRO DE MESAS
// ========================================

export interface RestaurantMesa {
  id: string;
  restaurant_id: string;
  numero: number;
  nombre?: string;
  // Zona fue eliminada de la base de datos; mantener opcional por compatibilidad
  zona?: string;
  capacidad_personas: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'inactiva';
  notas?: string;
  created_at: string;
  updated_at: string;
}

export const getRestaurantSpecialDishes = async (restaurantId: string): Promise<SpecialDish[]> => {
  return withCache(
    'getRestaurantSpecialDishes',
    restaurantId,
    30_000,
    async () => {
      const { data, error } = await supabase
        .from('special_dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  );
};

/**
 * Obtener especiales disponibles hoy para un restaurante
 */
export const getAvailableSpecialsToday = async (restaurantId: string) => {
  return withCache(
    'getAvailableSpecialsToday',
    restaurantId,
    15_000,
    async () => {
      const { data, error } = await supabase
        .rpc('get_available_specials_today', {
          p_restaurant_id: restaurantId
        });
      if (error) throw error;
      return data || [];
    }
  );
};

/**
 * Crear un nuevo plato especial
 */
export const createSpecialDish = async (
  restaurantId: string, 
  dishData: {
    dish_name: string;
    dish_description?: string;
    dish_price: number;
  }
): Promise<SpecialDish> => {
  const { data, error } = await supabase
    .from('special_dishes')
    .insert({
      restaurant_id: restaurantId,
      dish_name: dishData.dish_name,
      dish_description: dishData.dish_description,
      dish_price: dishData.dish_price,
      is_template: true,
      status: 'draft'
    })
    .select()
    .single();

  if (error) throw error;
  // invalidar caches relacionados
  invalidateCache('getRestaurantSpecialDishes', restaurantId);
  invalidateCache('getAvailableSpecialsToday', restaurantId);
  invalidateCache('getSpecialsStatusToday', restaurantId);
  return data;
};

/**
 * Actualizar plato especial
 */
export const updateSpecialDish = async (
  specialDishId: string, 
  updates: Partial<SpecialDish>
): Promise<SpecialDish> => {
  const { data, error } = await supabase
    .from('special_dishes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', specialDishId)
    .select()
    .single();

  if (error) throw error;
  // invalidaciones amplias (no tenemos restaurantId aquí)
  invalidateCache('getRestaurantSpecialDishes');
  invalidateCache('getAvailableSpecialsToday');
  invalidateCache('getSpecialsStatusToday');
  return data;
};

/**
 * Obtener selecciones de productos para un plato especial
 */
export const getSpecialDishSelections = async (specialDishId: string): Promise<SpecialDishSelection[]> => {
  return withCache(
    'getSpecialDishSelections',
    specialDishId,
    30_000,
    async () => {
      const { data, error } = await supabase
        .from('special_dish_selections')
        .select('*')
        .eq('special_dish_id', specialDishId)
        .order('category_name')
        .order('selection_order');
      if (error) throw error;
      return data || [];
    }
  );
};

/**
 * Obtener combinaciones de un plato especial
 */
export const getSpecialCombinations = async (specialDishId: string): Promise<SpecialCombination[]> => {
  return withCache(
    'getSpecialCombinations',
    specialDishId,
    15_000,
    async () => {
      const { data, error } = await supabase
        .from('generated_special_combinations')
        .select('*')
        .eq('special_dish_id', specialDishId)
        .order('generated_at');
      if (error) throw error;
      return data || [];
    }
  );
};

/**
 * Insertar selecciones de productos para un plato especial
 */
export const insertSpecialDishSelections = async (
  specialDishId: string, 
  selectedProducts: any
): Promise<void> => {
  // Primero eliminar selecciones anteriores
  await supabase
    .from('special_dish_selections')
    .delete()
    .eq('special_dish_id', specialDishId);

  const selections: any[] = [];

  Object.entries(selectedProducts).forEach(([categoryId, products]: [string, any]) => {
    const categoryConfig = CATEGORIAS_MENU_CONFIG.find(c => c.id === categoryId);
    const categoryName = categoryConfig?.nombre || categoryId;
    
    products.forEach((product: any, index: number) => {
      selections.push({
        special_dish_id: specialDishId,
        universal_product_id: product.id,
        category_id: categoryConfig?.uuid || product.category_id,
        category_name: categoryName,
        product_name: product.name,
        selection_order: index,
        is_required: true
      });
    });
  });

  if (selections.length > 0) {
    const { error } = await supabase
      .from('special_dish_selections')
      .insert(selections);

    if (error) throw error;
  }
  // invalidar caches dependientes
  invalidateCache('getSpecialDishSelections', specialDishId);
  invalidateCache('getSpecialCombinations', specialDishId);
};

/**
 * Generar combinaciones automáticas para un plato especial
 */
export const generateSpecialCombinations = async (
  specialDishId: string, 
  dishName: string, 
  dishPrice: number
): Promise<SpecialCombination[]> => {
  // Obtener productos seleccionados
  const selections = await getSpecialDishSelections(specialDishId);
  
  // Organizar por categoría
  const productsByCategory: {[category: string]: any[]} = {};
  selections.forEach(selection => {
    if (!productsByCategory[selection.category_name]) {
      productsByCategory[selection.category_name] = [];
    }
    productsByCategory[selection.category_name].push(selection);
  });

  const combinations: any[] = [];

  // Derivar nombres de categorías desde constantes compartidas para evitar hardcodes
  const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
    CATEGORIAS_MENU_CONFIG
      .filter((c) => !!c.nombre)
      .map((c) => [c.id, c.nombre as string])
  );

  // Generar combinación básica (una por ahora, pero se puede expandir)
  const entrada = productsByCategory[CATEGORY_NAMES['entradas']]?.[0];
  const principio = productsByCategory[CATEGORY_NAMES['principios']]?.[0];
  const proteina = productsByCategory[CATEGORY_NAMES['proteinas']]?.[0];
  const acompanamiento = productsByCategory[CATEGORY_NAMES['acompanamientos']]?.[0];
  const bebida = productsByCategory[CATEGORY_NAMES['bebidas']]?.[0];

  if (proteina) {
    combinations.push({
      special_dish_id: specialDishId,
      combination_name: dishName,
      combination_description: `Delicioso ${dishName.toLowerCase()} con ingredientes frescos seleccionados especialmente para ti.`,
      combination_price: dishPrice,
      entrada_product_id: entrada?.universal_product_id || null,
      principio_product_id: principio?.universal_product_id || null,
      proteina_product_id: proteina.universal_product_id,
      acompanamiento_products: acompanamiento ? [acompanamiento.universal_product_id] : null,
      bebida_product_id: bebida?.universal_product_id || null,
      is_available: true,
      is_favorite: false,
      is_featured: true,
      available_today: false
    });
  }

  // Insertar combinaciones
  if (combinations.length > 0) {
    const { data, error } = await supabase
      .from('generated_special_combinations')
      .insert(combinations)
      .select();

    if (error) throw error;
  invalidateCache('getSpecialCombinations', specialDishId);
    return data || [];
  }

  return [];
};

/**
 * Activar/Desactivar especial para hoy
 */
export const toggleSpecialToday = async (
  restaurantId: string,
  specialDishId: string,
  activate: boolean = true,
  maxQuantity?: number,
  notes?: string
) => {
  const { data, error } = await supabase
    .rpc('toggle_special_today', {
      p_restaurant_id: restaurantId,
      p_special_dish_id: specialDishId,
      p_activate: activate,
      p_max_quantity: maxQuantity,
      p_notes: notes
    });

  if (error) throw error;
  // invalidaciones
  invalidateCache('getAvailableSpecialsToday', restaurantId);
  invalidateCache('getSpecialsStatusToday', restaurantId);
  invalidateCache('getSpecialCombinations', specialDishId);
  return data?.[0] || null;
};

/**
 * Actualizar combinación especial
 */
export const updateSpecialCombination = async (
  combinationId: string, 
  updates: any
): Promise<void> => {
  const dbUpdates = {
    updated_at: new Date().toISOString(),
    ...updates
  };

  const { error } = await supabase
    .from('generated_special_combinations')
    .update(dbUpdates)
    .eq('id', combinationId);

  if (error) throw error;
  invalidateCache('getSpecialCombinations');
};

/**
 * Eliminar plato especial completo
 */
export const deleteSpecialDish = async (specialDishId: string): Promise<void> => {
  const { error } = await supabase
    .from('special_dishes')
    .delete()
    .eq('id', specialDishId);

  if (error) throw error;
  invalidateCache('getRestaurantSpecialDishes');
  invalidateCache('getAvailableSpecialsToday');
  invalidateCache('getSpecialsStatusToday');
  invalidateCache('getSpecialCombinations', specialDishId);
};

/**
 * Eliminar combinación especial
 */
export const deleteSpecialCombination = async (combinationId: string): Promise<void> => {
  const { error } = await supabase
    .from('generated_special_combinations')
    .delete()
    .eq('id', combinationId);

  if (error) throw error;
  invalidateCache('getSpecialCombinations');
};

/**
 * Obtener estado de especiales para el dashboard
 */
export const getSpecialsStatusToday = async (restaurantId: string) => {
  return withCache(
    'getSpecialsStatusToday',
    restaurantId,
    15_000,
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: activeSpecials, error: activeError }, { data: allSpecials, error: allError }] = await Promise.all([
        supabase
          .from('daily_special_activations')
          .select(`
            id,
            special_dish_id,
            is_active,
            daily_max_quantity,
            notes,
            special_dishes!inner(
              dish_name,
              dish_price,
              dish_description
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('activation_date', today)
          .eq('is_active', true),
        supabase
          .from('special_dishes')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('setup_completed', true)
          .order('dish_name'),
      ]);
      if (activeError) throw activeError;
      if (allError) throw allError;
      return {
        activeToday: activeSpecials || [],
        allTemplates: allSpecials || []
      };
    }
  );
};

// ========================================
// INTERFACES PARA SISTEMA DE MESAS
// Agregar estas interfaces al final de las interfaces existentes en supabase.ts
// ========================================

export interface OrdenMesa {
  id: string;
  restaurant_id: string;
  numero_mesa: number;
  mesa_id?: string; // FK a generated_tables
  monto_total: number;
  estado: 'activa' | 'pagada' | 'completada';
  nombre_mesero?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ItemOrdenMesa {
  id: string;
  orden_mesa_id: string;
  combinacion_id?: string; // FK a generated_combinations
  combinacion_especial_id?: string; // FK a generated_special_combinations
  tipo_item: 'menu_dia' | 'especial';
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  observaciones_item?: string;
  fecha_creacion: string;
}

// Interfaz para respuesta extendida con datos de productos
export interface ItemOrdenMesaExtendido extends ItemOrdenMesa {
  nombre_producto: string;
  descripcion_producto?: string;
  precio_menu?: number; // Para comparación con precio de la orden
}

// ========================================
// FUNCIONES PRINCIPALES PARA GESTIÓN DE MESAS
// Reemplazar las funciones existentes o agregar al final de supabase.ts
// ========================================

/**
 * Obtener estado de todas las mesas del restaurante (solo órdenes activas)
 */
export const getMesasEstado = async (restaurantId: string) => {
  try {
    const { data: ordenes, error } = await withCache(
      'getMesasEstado',
      restaurantId,
      10_000,
      async () => {
        const { data, error } = await supabase
          .from('ordenes_mesa')
          .select(`
            id,
            numero_mesa,
            monto_total,
            nombre_mesero,
            fecha_creacion,
            items_orden_mesa (
              id,
              cantidad,
              precio_total,
              tipo_item,
              combinacion_id,
              combinacion_especial_id,
              generated_combinations (
                combination_name,
                combination_price
              ),
              generated_special_combinations (
                combination_name,
                combination_price
              )
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('estado', 'activa')
          .order('fecha_creacion', { ascending: false });
        if (error) throw error;
        return data || [];
      }
    ).then((data) => ({ data, error: null as any }));

    

    if (error) {
      console.error('❌ Error en getMesasEstado:', error);
      throw error;
    }

    // Procesar y agrupar por número de mesa
    const mesasOcupadas = ordenes?.reduce((acc, orden) => {
      const mesa = orden.numero_mesa;
      
      if (!acc[mesa]) {
        acc[mesa] = {
          numero: mesa,
          total: 0,
          items: []
        };
      }

      // Sumar al total de la mesa
      acc[mesa].total += orden.monto_total;

      // Procesar items de la orden
      orden.items_orden_mesa?.forEach((item: any) => {
        let nombreProducto = 'Producto sin nombre';
        
        if (item.tipo_item === 'menu_dia' && item.generated_combinations) {
          nombreProducto = item.generated_combinations.combination_name;
        } else if (item.tipo_item === 'especial' && item.generated_special_combinations) {
          nombreProducto = item.generated_special_combinations.combination_name;
        }

        acc[mesa].items.push({
          id: item.id,
          nombre: nombreProducto,
          cantidad: item.cantidad,
          precio: item.precio_total
        });
      });

      return acc;
    }, {} as Record<number, any>);

    
    return mesasOcupadas || {};
  } catch (error) {
    console.error('💥 Error en getMesasEstado:', error);
    throw error;
  }
};

/**
 * Obtener detalles específicos de una mesa
 */
export const getDetallesMesa = async (restaurantId: string, mesaNumero: number) => {
  try {
    const { data: ordenes, error } = await withCache(
      'getDetallesMesa',
      `${restaurantId}:${mesaNumero}`,
      10_000,
      async () => {
        const { data, error } = await supabase
          .from('ordenes_mesa')
          .select(`
            id,
            numero_mesa,
            monto_total,
            nombre_mesero,
            observaciones,
            fecha_creacion,
            items_orden_mesa (
              id,
              cantidad,
              precio_unitario,
              precio_total,
              tipo_item,
              observaciones_item,
              generated_combinations (
                combination_name,
                combination_description,
                combination_price
              ),
              generated_special_combinations (
                combination_name,
                combination_description,
                combination_price
              )
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('numero_mesa', mesaNumero)
          .eq('estado', 'activa')
          .order('fecha_creacion', { ascending: false });
        if (error) throw error;
        return data || [];
      }
    ).then((data) => ({ data, error: null as any }));

    

    if (error) {
      console.error('❌ Error en getDetallesMesa:', error);
      throw error;
    }

    if (!ordenes || ordenes.length === 0) {
      
      return {
        mesa: mesaNumero,
        items: [],
        total: 0,
        ordenes: []
      };
    }

    // Calcular total general
    const totalGeneral = ordenes.reduce((sum, orden) => sum + orden.monto_total, 0);

    // Procesar items de todas las órdenes
    const todosLosItems: any[] = [];
    
    ordenes.forEach((orden) => {
      
      
      orden.items_orden_mesa?.forEach((item: any) => {
        let nombreProducto = 'Producto sin nombre';
        let descripcionProducto = '';
        let precioProducto = item.precio_unitario;
        
        
        
        if (item.tipo_item === 'menu_dia' && item.generated_combinations) {
          nombreProducto = item.generated_combinations.combination_name || 'Menú del día';
          descripcionProducto = item.generated_combinations.combination_description || '';
          precioProducto = item.generated_combinations.combination_price || item.precio_unitario;
        } else if (item.tipo_item === 'especial' && item.generated_special_combinations) {
          nombreProducto = item.generated_special_combinations.combination_name || 'Plato especial';
          descripcionProducto = item.generated_special_combinations.combination_description || '';
          precioProducto = item.generated_special_combinations.combination_price || item.precio_unitario;
        }

        

        todosLosItems.push({
          id: item.id,
          nombre: nombreProducto,
          descripcion: descripcionProducto,
          cantidad: item.cantidad,
          precio_unitario: precioProducto,
          precio_total: item.precio_total,
          tipo: item.tipo_item,
          observaciones: item.observaciones_item
        });
      });
    });

    

    const resultado = {
      mesa: mesaNumero,
      items: todosLosItems,
      total: totalGeneral,
      ordenes: ordenes.map(orden => ({
        id: orden.id,
        mesero: orden.nombre_mesero,
        observaciones: orden.observaciones,
        fecha: orden.fecha_creacion,
        total: orden.monto_total
      }))
    };

    
    return resultado;
  } catch (error) {
    console.error('💥 Error en getDetallesMesa:', error);
    throw error;
  }
};

/**
 * Marcar mesa como pagada (cambiar estado de órdenes activas)
 */
export const cobrarMesa = async (restaurantId: string, mesaNumero: number) => {
  try {
    
    
    // Actualizar todas las órdenes activas de la mesa a estado 'pagada'
    const { error } = await supabase
      .from('ordenes_mesa')
      .update({ 
        estado: 'pagada',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero_mesa', mesaNumero)
      .eq('estado', 'activa');

    if (error) {
      console.error('❌ Error en cobrarMesa:', error);
      throw error;
    }
    
    
  const { data: _mesa } = await supabase
      .from('restaurant_mesas')
      .select('estado')
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero)
      .single();
    
    
  // invalidar caches relacionadas
  invalidateCache('getMesasRestaurante', restaurantId);
  invalidateCache('getMesasEstado', restaurantId);
  invalidateCache('getDetallesMesa', `${restaurantId}:${mesaNumero}`);
  invalidateCache('getEstadoCompletoMesas', restaurantId);
  return { success: true };
  } catch (error) {
    console.error('💥 Error en cobrarMesa:', error);
    throw error;
  }
};

// ========================================
// FUNCIONES ADICIONALES PARA ÓRDENES DE MESA
// ========================================

/**
 * Crear nueva orden de mesa
 */
export const crearOrdenMesa = async (ordenData: {
  restaurantId: string;
  numeroMesa: number;
  nombreMesero?: string;
  observaciones?: string;
  items: {
    combinacionId?: string;
    combinacionEspecialId?: string;
    tipoItem: 'menu_dia' | 'especial';
    cantidad: number;
    precioUnitario: number;
    observacionesItem?: string;
  }[];
}): Promise<OrdenMesa> => {
  try {
    
    
    // 1. Crear la orden principal
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_mesa')
      .insert({
        restaurant_id: ordenData.restaurantId,
        numero_mesa: ordenData.numeroMesa,
        nombre_mesero: ordenData.nombreMesero,
        observaciones: ordenData.observaciones,
        monto_total: 0 // Se calculará automáticamente por el trigger
      })
      .select()
      .single();

    if (ordenError) {
      console.error('❌ Error creando orden:', ordenError);
      throw ordenError;
    }

    

    const { data: mesa } = await supabase
      .from('restaurant_mesas')
      .select('id')
      .eq('restaurant_id', ordenData.restaurantId)
      .eq('numero', ordenData.numeroMesa)
      .single();
    
    if (mesa) {
      await updateEstadoMesa(mesa.id, 'ocupada');
      
    }

    // 2. Agregar los items
    const itemsParaInsertar = ordenData.items.map(item => ({
      orden_mesa_id: orden.id,
      combinacion_id: item.combinacionId || null,
      combinacion_especial_id: item.combinacionEspecialId || null,
      tipo_item: item.tipoItem,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      precio_total: item.cantidad * item.precioUnitario,
      observaciones_item: item.observacionesItem
    }));

    const { error: itemsError } = await supabase
      .from('items_orden_mesa')
      .insert(itemsParaInsertar);

    if (itemsError) {
      console.error('❌ Error creando items:', itemsError);
      throw itemsError;
    }

  // invalidar vistas dependientes
  invalidateCache('getMesasRestaurante', ordenData.restaurantId);
  invalidateCache('getMesasEstado', ordenData.restaurantId);
  invalidateCache('getDetallesMesa');
  invalidateCache('getEstadoCompletoMesas', ordenData.restaurantId);
  return orden;
  } catch (error) {
    console.error('💥 Error en crearOrdenMesa:', error);
    throw error;
  }
};

/**
 * Agregar items a una orden existente
 */
export const agregarItemsAOrden = async (
  ordenId: string,
  items: {
    combinacionId?: string;
    combinacionEspecialId?: string;
    tipoItem: 'menu_dia' | 'especial';
    cantidad: number;
    precioUnitario: number;
    observacionesItem?: string;
  }[]
) => {
  try {
    
    
    const itemsParaInsertar = items.map(item => ({
      orden_mesa_id: ordenId,
      combinacion_id: item.combinacionId || null,
      combinacion_especial_id: item.combinacionEspecialId || null,
      tipo_item: item.tipoItem,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      precio_total: item.cantidad * item.precioUnitario,
      observaciones_item: item.observacionesItem
    }));

    const { error } = await supabase
      .from('items_orden_mesa')
      .insert(itemsParaInsertar);

    if (error) {
      console.error('❌ Error agregando items:', error);
      throw error;
    }

  invalidateCache('getMesasEstado');
  invalidateCache('getEstadoCompletoMesas');
  return { success: true };
  } catch (error) {
    console.error('💥 Error en agregarItemsAOrden:', error);
    throw error;
  }
};

/**
 * Suscribirse a cambios en tiempo real de mesas
 */
export const suscribirseACambiosMesas = (
  restaurantId: string,
  callback: (payload: any) => void
) => {
  
  
  return supabase
    .channel(`mesas-${restaurantId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ordenes_mesa',
        filter: `restaurant_id=eq.${restaurantId}`
      },
      (payload) => {
        
        callback(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'items_orden_mesa'
      },
      (payload) => {
        
        callback(payload);
      }
    )
    .subscribe();
};

// ========================================
// FUNCIONES PARA CONFIGURACIÓN MAESTRA DE MESAS
// ========================================

/**
 * Obtener todas las mesas configuradas de un restaurante
 */
export const getMesasRestaurante = async (restaurantId: string): Promise<RestaurantMesa[]> => {
  try {
    return await withCache(
      'getMesasRestaurante',
      restaurantId,
      30_000,
      async () => {
        const { data, error } = await supabase
          .from('restaurant_mesas')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('numero');
        if (error) throw error;
        return data || [];
      }
    );
  } catch (error) {
    console.error('💥 Error en getMesasRestaurante:', error);
    throw error;
  }
};

/**
 * Configurar mesas iniciales para un restaurante
 */
/**
 * REEMPLAZAR la función configurarMesas existente en supabase.ts con esta versión inteligente
 */

/**
 * Configurar mesas inteligentemente - solo agrega/quita las necesarias
 */
export const configurarMesas = async (
  restaurantId: string, 
  totalMesas: number,
  distribucion?: { [zona: string]: number }
): Promise<RestaurantMesa[]> => {
  try {
    
    
    // 1. CONSULTAR MESAS EXISTENTES
    const mesasExistentes = await getMesasRestaurante(restaurantId);
    const totalActual = mesasExistentes.length;
    
    

    // 2. DETERMINAR QUÉ HACER
    if (totalActual === totalMesas) {
      
      return mesasExistentes;
    }

    if (totalMesas > totalActual) {
      // CASO A: AGREGAR MESAS (tu caso actual: 8 → 12)
  const _mesasParaAgregar = totalMesas - totalActual;
      
      
      const mesasNuevas: any[] = [];
      
      for (let i = totalActual + 1; i <= totalMesas; i++) {
        mesasNuevas.push({
          restaurant_id: restaurantId,
          numero: i,
          nombre: `Mesa ${i}`,
          capacidad_personas: 4,
          estado: 'libre'
        });
      }
      
  const { data: _data, error } = await supabase
        .from('restaurant_mesas')
        .insert(mesasNuevas)
        .select();
        
      if (error) {
        console.error('❌ Error agregando mesas:', error);
        throw error;
      }
      
      
      
  // Retornar todas las mesas (existentes + nuevas)
  invalidateCache('getMesasRestaurante', restaurantId);
      return await getMesasRestaurante(restaurantId);
      
    } else {
      // CASO B: QUITAR MESAS (ej: 12 → 8)
      const mesasParaQuitar = totalActual - totalMesas;
      
      
      // Obtener las mesas con números más altos para eliminar
      const mesasAEliminar = mesasExistentes
        .sort((a, b) => b.numero - a.numero) // Ordenar descendente
        .slice(0, mesasParaQuitar); // Tomar las primeras N (números más altos)
      
      const { error } = await supabase
        .from('restaurant_mesas')
        .delete()
        .in('id', mesasAEliminar.map(m => m.id));
        
      if (error) {
        console.error('❌ Error eliminando mesas:', error);
        throw error;
      }
      
      
      
  // Retornar mesas restantes
  invalidateCache('getMesasRestaurante', restaurantId);
      return await getMesasRestaurante(restaurantId);
    }
    
  } catch (error) {
    console.error('💥 Error en configurarMesas:', error);
    throw error;
  }
};

/**
 * FUNCIÓN ADICIONAL: Reconfigurar completamente (para casos especiales)
 */
export const reconfigurarMesasCompleto = async (
  restaurantId: string, 
  totalMesas: number,
  distribucion?: { [zona: string]: number }
): Promise<RestaurantMesa[]> => {
  try {
    
    
    // 1. ELIMINAR TODAS LAS MESAS EXISTENTES
    const { error: deleteError } = await supabase
      .from('restaurant_mesas')
      .delete()
      .eq('restaurant_id', restaurantId);
      
    if (deleteError) throw deleteError;
    
    
    // 2. CREAR MESAS NUEVAS
    const mesasNuevas: any[] = [];
    
    if (distribucion) {
      // Con distribución por zonas (zona removida del modelo, solo se usaba para numeración)
      let numeroActual = 1;
      Object.entries(distribucion).forEach(([_, cantidad]) => {
        for (let i = 0; i < cantidad; i++) {
          mesasNuevas.push({
            restaurant_id: restaurantId,
            numero: numeroActual,
            nombre: `Mesa ${numeroActual}`,
            capacidad_personas: 4,
            estado: 'libre'
          });
          numeroActual++;
        }
      });
    } else {
      // Sin distribución - todas en zona principal
      for (let i = 1; i <= totalMesas; i++) {
        mesasNuevas.push({
          restaurant_id: restaurantId,
          numero: i,
          nombre: `Mesa ${i}`,
          capacidad_personas: 4,
          estado: 'libre'
        });
      }
    }
    
    const { data, error } = await supabase
      .from('restaurant_mesas')
      .insert(mesasNuevas)
      .select();
      
    if (error) throw error;
    
    
  invalidateCache('getMesasRestaurante', restaurantId);
  return data || [];
    
  } catch (error) {
    console.error('💥 Error en reconfigurarMesasCompleto:', error);
    throw error;
  }
};

/**
 * Actualizar estado de una mesa específica
 */
export const updateEstadoMesa = async (
  mesaId: string, 
  nuevoEstado: 'libre' | 'ocupada' | 'reservada' | 'inactiva'
): Promise<RestaurantMesa> => {
  try {
    
    
    const { data, error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', mesaId)
      .select()
      .single();

    if (error) throw error;
    
  // Invalidar por restaurant_id si se conoce (no lo tenemos aquí); invalidación amplia
  invalidateCache('getMesasRestaurante');
  return data;
  } catch (error) {
    console.error('💥 Error en updateEstadoMesa:', error);
    throw error;
  }
};

/**
 * Crear mesa individual
 */
export const crearMesa = async (mesaData: {
  restaurantId: string;
  numero: number;
  nombre?: string;
  capacidad?: number;
}): Promise<RestaurantMesa> => {
  try {
    
    
    const { data, error } = await supabase
      .from('restaurant_mesas')
      .insert({
        restaurant_id: mesaData.restaurantId,
        numero: mesaData.numero,
        nombre: mesaData.nombre || `Mesa ${mesaData.numero}`,
        capacidad_personas: mesaData.capacidad || 4,
        estado: 'libre'
      })
      .select()
      .single();

    if (error) throw error;
    
  invalidateCache('getMesasRestaurante', mesaData.restaurantId);
  return data;
  } catch (error) {
    console.error('💥 Error en crearMesa:', error);
    throw error;
  }
};

/**
 * Inactivar mesa (no eliminar, solo desactivar)
 */
export const inactivarMesa = async (mesaId: string): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'inactiva',
        updated_at: new Date().toISOString()
      })
      .eq('id', mesaId);

    if (error) throw error;
    
    invalidateCache('getMesasRestaurante');
  } catch (error) {
    console.error('💥 Error en inactivarMesa:', error);
    throw error;
  }
};

/**
 * Verificar si un restaurante tiene mesas configuradas
 */
export const verificarMesasConfiguradas = async (restaurantId: string): Promise<{
  configuradas: boolean;
  totalMesas: number;
  zonas: string[];
}> => {
  try {
    
    
    const { data, error } = await supabase
      .from('restaurant_mesas')
      .select('id')
      .eq('restaurant_id', restaurantId);

    if (error) throw error;

    const configuradas = (data?.length || 0) > 0;
    const totalMesas = data?.length || 0;
  // La columna zona fue eliminada; devolvemos vacío para compatibilidad
  const zonas: string[] = [];

    
    return { configuradas, totalMesas, zonas };
  } catch (error) {
    console.error('💥 Error en verificarMesasConfiguradas:', error);
    throw error;
  }
};

/**
 * Obtener estado completo de mesas (libres + ocupadas) con datos del sistema maestro
 */
export const getEstadoCompletoMesas = async (restaurantId: string) => {
  try {
    return withCache(
      'getEstadoCompletoMesas',
      restaurantId,
      10_000,
      async () => {
        // 1. Obtener todas las mesas configuradas
        const mesas = await getMesasRestaurante(restaurantId);
        // 2. Obtener órdenes activas (como antes)
        const mesasOcupadas = await getMesasEstado(restaurantId);
        // 3. Combinar información
        const estadoCompleto = mesas.map(mesa => ({
          numero: mesa.numero,
          nombre: mesa.nombre,
          // zona eliminada del modelo
          zona: undefined,
          capacidad: mesa.capacidad_personas,
          estado: mesa.estado,
          ocupada: mesasOcupadas[mesa.numero] ? true : false,
          detallesOrden: mesasOcupadas[mesa.numero] || null
        }));
        return {
          mesas: estadoCompleto,
          totalMesas: mesas.length,
          mesasLibres: estadoCompleto.filter(m => !m.ocupada).length,
          mesasOcupadas: estadoCompleto.filter(m => m.ocupada).length,
          // zonas no disponibles
          zonas: [] as string[]
        };
      }
    );
  } catch (error) {
    console.error('💥 Error en getEstadoCompletoMesas:', error);
    throw error;
  }
};

/**
 * Reconfigurar mesas existentes (agregar/quitar mesas)
 */
export const reconfigurarMesas = async (
  restaurantId: string,
  nuevoTotal: number,
  _mantenerExistentes: boolean = true
): Promise<RestaurantMesa[]> => {
  try {
    
    
    const mesasActuales = await getMesasRestaurante(restaurantId);
    const totalActual = mesasActuales.length;
    
    if (nuevoTotal > totalActual) {
      // Agregar mesas nuevas
      const mesasParaAgregar: any[] = [];
      for (let i = totalActual + 1; i <= nuevoTotal; i++) {
        mesasParaAgregar.push({
          restaurant_id: restaurantId,
          numero: i,
          nombre: `Mesa ${i}`,
          capacidad_personas: 4,
          estado: 'libre'
        });
      }
      
  const { data: _data2, error } = await supabase
        .from('restaurant_mesas')
        .insert(mesasParaAgregar)
        .select();
        
      if (error) throw error;
      
      
    } else if (nuevoTotal < totalActual) {
      // Inactivar mesas sobrantes
      const { error } = await supabase
        .from('restaurant_mesas')
        .update({ estado: 'inactiva' })
        .eq('restaurant_id', restaurantId)
        .gt('numero', nuevoTotal);
        
      if (error) throw error;
      
    }
    
    // Devolver configuración actualizada
  invalidateCache('getMesasRestaurante', restaurantId);
  return await getMesasRestaurante(restaurantId);
  } catch (error) {
    console.error('💥 Error en reconfigurarMesas:', error);
    throw error;
  }
};

/**
 * Limpiar configuración de mesas (solo para casos extremos)
 */
export const limpiarConfiguracionMesas = async (restaurantId: string): Promise<void> => {
  try {
    
    
    // Solo inactivar, no eliminar (por integridad referencial)
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ estado: 'inactiva' })
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    
    invalidateCache('getMesasRestaurante', restaurantId);
  } catch (error) {
    console.error('💥 Error en limpiarConfiguracionMesas:', error);
    throw error;
  }
};

// ========================================
// INTERFACES PARA SISTEMA DE CAJA
// ========================================

export interface CajaSesion {
  id: string;
  restaurant_id: string;
  cajero_id: string;
  monto_inicial: number; // En centavos
  estado: 'abierta' | 'cerrada';
  abierta_at: string;
  cerrada_at?: string;
  notas_apertura?: string;
  notas_cierre?: string;
}

export interface TransaccionCaja {
  id: string;
  caja_sesion_id: string;
  orden_id: string;
  tipo_orden: 'mesa' | 'delivery' | 'directa';
  metodo_pago: 'efectivo' | 'tarjeta' | 'digital';
  monto_total: number; // En centavos
  monto_recibido?: number;
  monto_cambio: number;
  procesada_at: string;
  cajero_id: string;
  
  // AGREGAR ESTAS PROPIEDADES:
  restaurant_id?: string; // Agregada para compatibilidad
  caja_sesiones?: {        // Para joins con sesiones
    restaurant_id: string;
    cajero: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

// ========================================
// FUNCIONES PARA GESTIÓN DE CAJA
// ========================================

/**
 * Devuelve los límites UTC para el inicio y fin de un día en zona America/Bogota.
 * Nota: Colombia no usa DST (UTC-5), por lo que es seguro construir las fechas con -05:00.
 */
const getBogotaDayUtcBounds = (fecha?: string) => {
  const dia = fecha || new Date().toISOString().slice(0, 10);
  // Construimos la fecha local Bogotá y dejamos que el motor convierta a UTC
  const start = new Date(`${dia}T00:00:00.000-05:00`);
  const end = new Date(`${dia}T23:59:59.999-05:00`);
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
};

/**
 * Limites UTC para un rango [fechaInicio, fechaFin] en zona America/Bogota.
 * Ambas fechas son YYYY-MM-DD en horario local Bogotá.
 */
const getBogotaRangeUtcBounds = (fechaInicio: string, fechaFin: string) => {
  const start = new Date(`${fechaInicio}T00:00:00.000-05:00`);
  const end = new Date(`${fechaFin}T23:59:59.999-05:00`);
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
};

/**
 * Obtener sesión de caja activa
 */
export const getSesionCajaActiva = async (restaurantId: string): Promise<CajaSesion | null> => {
  try {
    const { data, error } = await supabase
      .from('caja_sesiones')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('estado', 'abierta')
      .order('abierta_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && (error as any).code && (error as any).code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error obteniendo sesión activa:', error);
    throw error;
  }
};

/**
 * Abrir nueva sesión de caja
 */
export const abrirSesionCaja = async (
  restaurantId: string,
  cajeroId: string,
  montoInicial: number,
  notas?: string
): Promise<CajaSesion> => {
  try {
    // Verificar que no haya sesión abierta
    const sesionExistente = await getSesionCajaActiva(restaurantId);
    if (sesionExistente) {
      throw new Error('Ya existe una sesión de caja abierta');
    }

    const { data, error } = await supabase
      .from('caja_sesiones')
      .insert({
        restaurant_id: restaurantId,
        cajero_id: cajeroId,
        monto_inicial: montoInicial,
        estado: 'abierta',
        notas_apertura: notas
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error abriendo caja:', error);
    throw error;
  }
};

/**
 * Cerrar sesión de caja
 */
/**
 * Cerrar sesión de caja CON VALIDACIÓN
 */
export const cerrarSesionCaja = async (
  restaurantId: string,
  sesionId: string,
  notas?: string
): Promise<CajaSesion> => {
  try {
    // 1. VALIDAR antes de cerrar
    const validacion = await validarCierreCaja(restaurantId);
    
    if (!validacion.puedeSerrar) {
      throw new Error(validacion.mensaje);
    }
    
    // 2. Si todo está bien, cerrar normalmente
    const { data, error } = await supabase
      .from('caja_sesiones')
      .update({
        estado: 'cerrada',
        cerrada_at: new Date().toISOString(),
        notas_cierre: notas
      })
      .eq('id', sesionId)
      .select()
      .single();

    if (error) throw error;
    
    
    return data;
    
  } catch (error) {
    console.error('❌ Error cerrando caja:', error);
    throw error;
  }
};

/**
 * Obtener órdenes de mesas pendientes de pago
 */
export const getOrdenesMesasPendientes = async (restaurantId: string) => {
  try {
    const { data, error } = await supabase
      .from('ordenes_mesa')
      .select(`
        id,
        numero_mesa,
        monto_total,
        fecha_creacion,
        nombre_mesero,
        observaciones
      `)
      .eq('restaurant_id', restaurantId)
      .eq('estado', 'activa')
      .is('pagada_at', null)
      .order('fecha_creacion', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo órdenes de mesa:', error);
    throw error;
  }
};

/**
 * Obtener órdenes de delivery pendientes de pago
 */
export const getOrdenesDeliveryPendientes = async (restaurantId: string) => {
  try {
    const { data, error } = await supabase
      .from('delivery_orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        total_amount,
        created_at,
        delivery_address
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'delivered')
      .is('pagada_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo órdenes delivery:', error);
    throw error;
  }
};

/**
 * Procesar pago de una orden
 */
export const procesarPagoOrden = async (
  sesionId: string,
  cajeroId: string,
  ordenId: string,
  tipoOrden: 'mesa' | 'delivery',
  metodoPago: 'efectivo' | 'tarjeta' | 'digital',
  montoTotal: number,
  montoRecibido?: number
): Promise<{ transaccion: TransaccionCaja; cambio: number }> => {
  try {
    const montoCambio = metodoPago === 'efectivo' && montoRecibido 
      ? Math.max(0, montoRecibido - montoTotal)
      : 0;

    // 1. Crear transacción
    const { data: transaccion, error: errorTransaccion } = await supabase
      .from('transacciones_caja')
      .insert({
        caja_sesion_id: sesionId,
        orden_id: ordenId,
        tipo_orden: tipoOrden,
        metodo_pago: metodoPago,
        monto_total: montoTotal,
        monto_recibido: montoRecibido || montoTotal,
        monto_cambio: montoCambio,
        cajero_id: cajeroId
      })
      .select()
      .single();

    if (errorTransaccion) throw errorTransaccion;

    // 2. Actualizar orden como pagada
    const tabla = tipoOrden === 'mesa' ? 'ordenes_mesa' : 'delivery_orders';
    const campoEstado = tipoOrden === 'mesa' ? { estado: 'pagada' } : { status: 'paid' };
    
    const { error: errorUpdate } = await supabase
      .from(tabla)
      .update({
        pagada_at: new Date().toISOString(),
        ...campoEstado
      })
      .eq('id', ordenId);

    if (errorUpdate) throw errorUpdate;

    return {
      transaccion,
      cambio: montoCambio
    };
  } catch (error) {
    console.error('Error procesando pago:', error);
    throw error;
  }
};

/**
 * Obtener transacciones de una sesión de caja
 */
export const getTransaccionesSesion = async (sesionId: string): Promise<TransaccionCaja[]> => {
  try {
    const { data, error } = await supabase
      .from('transacciones_caja')
      .select('*')
      .eq('caja_sesion_id', sesionId)
      .order('procesada_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    throw error;
  }
};

/**
 * Obtener transacciones del día actual para una sesión
 */
export const getTransaccionesDelDia = async (restaurantId: string, fecha?: string): Promise<{
  transacciones: TransaccionCaja[];
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
}> => {
  try {
    const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];
    const { startUtc, endUtc } = getBogotaDayUtcBounds(fechaBusqueda);
    
    // Obtener todas las sesiones del día
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('abierta_at', startUtc)
      .lt('abierta_at', endUtc);

    if (errorSesiones) throw errorSesiones;

    if (!sesiones || sesiones.length === 0) {
      return {
        transacciones: [],
        totalVentas: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalDigital: 0
      };
    }

    // Obtener transacciones de todas las sesiones del día
    const { data: transacciones, error: errorTransacciones } = await supabase
      .from('transacciones_caja')
      .select('*')
      .in('caja_sesion_id', sesiones.map(s => s.id))
      .order('procesada_at', { ascending: false });

    if (errorTransacciones) throw errorTransacciones;

    const transaccionesDelDia = transacciones || [];
    
    // Calcular totales por método de pago
    const totalVentas = transaccionesDelDia.reduce((sum, t) => sum + t.monto_total, 0);
    const totalEfectivo = transaccionesDelDia
      .filter(t => t.metodo_pago === 'efectivo')
      .reduce((sum, t) => sum + t.monto_total, 0);
    const totalTarjeta = transaccionesDelDia
      .filter(t => t.metodo_pago === 'tarjeta')
      .reduce((sum, t) => sum + t.monto_total, 0);
    const totalDigital = transaccionesDelDia
      .filter(t => t.metodo_pago === 'digital')
      .reduce((sum, t) => sum + t.monto_total, 0);

    return {
      transacciones: transaccionesDelDia,
      totalVentas,
      totalEfectivo,
      totalTarjeta,
      totalDigital
    };
  } catch (error) {
    console.error('Error obteniendo transacciones del día:', error);
    throw error;
  }
};

/**
 * Obtener transacciones dentro de un rango de tiempo (Bogotá) por restaurante.
 */
export const getTransaccionesEnRango = async (
  restaurantId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<TransaccionCaja[]> => {
  const { startUtc, endUtc } = getBogotaRangeUtcBounds(fechaInicio, fechaFin);
  const { data, error } = await supabase
    .from('transacciones_caja')
    .select(`*, caja_sesiones!inner(restaurant_id)`) // join para filtrar por restaurante
    .eq('caja_sesiones.restaurant_id', restaurantId)
    .gte('procesada_at', startUtc)
    .lte('procesada_at', endUtc)
    .order('procesada_at', { ascending: false });
  if (error) throw error;
  return (data as any[]) as TransaccionCaja[];
};

/**
 * Obtener gastos dentro de un rango de tiempo (Bogotá) por restaurante.
 */
export const getGastosEnRango = async (
  restaurantId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<any[]> => {
  const { startUtc, endUtc } = getBogotaRangeUtcBounds(fechaInicio, fechaFin);
  const { data, error } = await supabase
    .from('gastos_caja')
    .select(`*, caja_sesiones!inner(restaurant_id)`) // join para filtrar por restaurante
    .eq('caja_sesiones.restaurant_id', restaurantId)
    .gte('registrado_at', startUtc)
    .lte('registrado_at', endUtc)
    .order('registrado_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Paquete combinado: transacciones y gastos en rango con métricas agregadas.
 */
export const getTransaccionesYGastosEnRango = async (
  restaurantId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<{
  transacciones: TransaccionCaja[];
  gastos: any[];
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
  totalGastos: number;
  gastosPorCategoria: any;
}> => {
  const transacciones = await getTransaccionesEnRango(restaurantId, fechaInicio, fechaFin);
  const gastos = await getGastosEnRango(restaurantId, fechaInicio, fechaFin);

  const totalVentas = transacciones.reduce((sum, t) => sum + t.monto_total, 0);
  const totalEfectivo = transacciones.filter(t => t.metodo_pago === 'efectivo').reduce((s, t) => s + t.monto_total, 0);
  const totalTarjeta = transacciones.filter(t => t.metodo_pago === 'tarjeta').reduce((s, t) => s + t.monto_total, 0);
  const totalDigital = transacciones.filter(t => t.metodo_pago === 'digital').reduce((s, t) => s + t.monto_total, 0);

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosPorCategoria = {
    proveedor: gastos.filter((g: any) => g.categoria === 'proveedor').reduce((s: number, g: any) => s + g.monto, 0),
    servicios: gastos.filter((g: any) => g.categoria === 'servicios').reduce((s: number, g: any) => s + g.monto, 0),
    suministros: gastos.filter((g: any) => g.categoria === 'suministros').reduce((s: number, g: any) => s + g.monto, 0),
    otro: gastos.filter((g: any) => g.categoria === 'otro').reduce((s: number, g: any) => s + g.monto, 0)
  };

  return {
    transacciones,
    gastos,
    totalVentas,
    totalEfectivo,
    totalTarjeta,
    totalDigital,
    totalGastos,
    gastosPorCategoria
  };
};

// ========================================
// FUNCIONES PARA GESTIÓN DE GASTOS DE CAJA
// ========================================

/**
 * Crear nuevo gasto de caja
 */
export const crearGastoCaja = async (
  cajaSesionId: string,
  cajeroId: string,
  gastoData: {
    concepto: string;
    monto: number;
    categoria: 'proveedor' | 'servicios' | 'suministros' | 'otro';
    notas?: string;
    comprobante_url?: string;
  }
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('gastos_caja')
      .insert({
        caja_sesion_id: cajaSesionId,
        concepto: gastoData.concepto,
        monto: gastoData.monto,
        categoria: gastoData.categoria,
        comprobante_url: gastoData.comprobante_url,
        registrado_por: cajeroId,
        notas: gastoData.notas
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creando gasto:', error);
    throw error;
  }
};

/**
 * Obtener gastos de una sesión de caja
 */
export const getGastosSesion = async (cajaSesionId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('gastos_caja')
      .select('*')
      .eq('caja_sesion_id', cajaSesionId)
      .order('registrado_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    throw error;
  }
};

/**
 * Obtener gastos del día para un restaurante
 */
export const getGastosDelDia = async (
  restaurantId: string, 
  fecha?: string
): Promise<{
  gastos: any[];
  totalGastos: number;
  gastosPorCategoria: {
    proveedor: number;
    servicios: number;
    suministros: number;
    otro: number;
  };
}> => {
  try {
    const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];
    const { startUtc, endUtc } = getBogotaDayUtcBounds(fechaBusqueda);
    
    // Obtener sesiones del día
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('abierta_at', startUtc)
      .lt('abierta_at', endUtc);

    if (errorSesiones) throw errorSesiones;

    if (!sesiones || sesiones.length === 0) {
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

    // Obtener gastos de todas las sesiones del día
    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos_caja')
      .select('*')
      .in('caja_sesion_id', sesiones.map(s => s.id))
      .order('registrado_at', { ascending: false });

    if (errorGastos) throw errorGastos;

    const gastosDelDia = gastos || [];
    
    // Calcular totales por categoría
    const totalGastos = gastosDelDia.reduce((sum, g) => sum + g.monto, 0);
    const gastosPorCategoria = {
      proveedor: gastosDelDia.filter(g => g.categoria === 'proveedor').reduce((sum, g) => sum + g.monto, 0),
      servicios: gastosDelDia.filter(g => g.categoria === 'servicios').reduce((sum, g) => sum + g.monto, 0),
      suministros: gastosDelDia.filter(g => g.categoria === 'suministros').reduce((sum, g) => sum + g.monto, 0),
      otro: gastosDelDia.filter(g => g.categoria === 'otro').reduce((sum, g) => sum + g.monto, 0)
    };

    return {
      gastos: gastosDelDia,
      totalGastos,
      gastosPorCategoria
    };
  } catch (error) {
    console.error('Error obteniendo gastos del día:', error);
    throw error;
  }
};

/**
 * Eliminar gasto de caja
 */
export const eliminarGastoCaja = async (gastoId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gastos_caja')
      .delete()
      .eq('id', gastoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    throw error;
  }
};

/**
 * Actualizar transacciones del día para incluir gastos
 */
export const getTransaccionesYGastosDelDia = async (restaurantId: string, fecha?: string): Promise<{
  transacciones: TransaccionCaja[];
  gastos: any[];
  totalVentas: number;
  totalGastos: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalDigital: number;
  gastosPorCategoria: any;
}> => {
  try {
    // Obtener transacciones (función existente)
    const datosTransacciones = await getTransaccionesDelDia(restaurantId, fecha);
    
    // Obtener gastos
    const datosGastos = await getGastosDelDia(restaurantId, fecha);

    return {
      ...datosTransacciones,
      gastos: datosGastos.gastos,
      totalGastos: datosGastos.totalGastos,
      gastosPorCategoria: datosGastos.gastosPorCategoria
    };
  } catch (error) {
    console.error('Error obteniendo transacciones y gastos:', error);
    throw error;
  }
};

// Generar nueva factura
export async function generarFactura(data: {
  restaurantId: string;
  transaccionId: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  metodoPago: string;
  detalles: any;
}) {
  // 1. Generar número consecutivo
  const { data: numeroFactura, error: errorNumero } = await supabase
    .rpc('generar_numero_factura', { p_restaurant_id: data.restaurantId });
    
  if (errorNumero) throw errorNumero;
  
  // 2. Crear registro de factura
  const { data: factura, error } = await supabase
    .from('facturas')
    .insert({
      restaurant_id: data.restaurantId,
      numero_factura: numeroFactura,
      transaccion_id: data.transaccionId,
      cliente_nombre: data.clienteNombre,
      cliente_documento: data.clienteDocumento,
      subtotal: data.subtotal,
      impuestos: data.impuestos,
      total: data.total,
      metodo_pago: data.metodoPago,
      datos_json: data.detalles,
      generada_por: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
    
  return { factura, error };
}

// Buscar facturas con filtros avanzados
export async function buscarFacturas(restaurantId: string, filtros: {
  fechaInicio?: string;
  fechaFin?: string;
  numeroFactura?: string;
  clienteNombre?: string;
  metodoPago?: string;
  estado?: string; // AGREGADO
  limite?: number;
}) {
  let query = supabase
    .from('facturas')
    .select(`
      id,
      numero_factura,
      cliente_nombre,
      total,
      metodo_pago,
      estado,
      generada_at,
      transacciones_caja (
        monto_total,
        procesada_at
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('generada_at', { ascending: false });
    
  if (filtros.fechaInicio) {
    query = query.gte('generada_at', filtros.fechaInicio);
  }
  if (filtros.fechaFin) {
    query = query.lte('generada_at', filtros.fechaFin);
  }
  if (filtros.numeroFactura) {
    query = query.ilike('numero_factura', `%${filtros.numeroFactura}%`);
  }
  if (filtros.clienteNombre) {
    query = query.ilike('cliente_nombre', `%${filtros.clienteNombre}%`);
  }
  if (filtros.metodoPago) {
    query = query.eq('metodo_pago', filtros.metodoPago);
  }
  if (filtros.estado) { // AGREGADO
    query = query.eq('estado', filtros.estado);
  }
  if (filtros.limite) {
    query = query.limit(filtros.limite);
  }
  
  return await query;
}

// Reportes estadísticos avanzados
export async function getReportesVentas(restaurantId: string, periodo: {
  fechaInicio: string;
  fechaFin: string;
}) {
  const { data, error } = await supabase
    .from('transacciones_caja')
    .select(`
      *,
      caja_sesiones!inner(restaurant_id)
    `)
    .eq('caja_sesiones.restaurant_id', restaurantId)
    .gte('procesada_at', periodo.fechaInicio)
    .lte('procesada_at', periodo.fechaFin);
    
  if (error) return { data: null, error };
  
  // Procesar estadísticas
  const stats = {
    totalVentas: data.reduce((sum, t) => sum + t.monto_total, 0),
    totalTransacciones: data.length,
    ventasPorMetodo: data.reduce((acc, t) => {
      acc[t.metodo_pago] = (acc[t.metodo_pago] || 0) + t.monto_total;
      return acc;
    }, {} as Record<string, number>),
    ventasPorDia: data.reduce((acc, t) => {
      const fecha = new Date(t.procesada_at).toISOString().split('T')[0];
      acc[fecha] = (acc[fecha] || 0) + t.monto_total;
      return acc;
    }, {} as Record<string, number>),
    ventasPorHora: data.reduce((acc, t) => {
      const hora = new Date(t.procesada_at).getHours();
      acc[hora] = (acc[hora] || 0) + t.monto_total;
      return acc;
    }, {} as Record<number, number>)
  };
  
  return { data: stats, error: null };
}

// ========================================
// FUNCIONES ADICIONALES DE FACTURACIÓN
// ========================================

// Obtener factura por ID
export async function obtenerFacturaPorId(facturaId: string) {
  const { data, error } = await supabase
    .from('facturas')
    .select(`
      *,
      transacciones_caja (
        monto_total,
        procesada_at,
        caja_sesiones (
          cajero:users(first_name, last_name, email)
        )
      )
    `)
    .eq('id', facturaId)
    .single();
    
  return { data, error };
}

// Anular factura
export async function anularFactura(facturaId: string, motivo: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('facturas')
    .update({
      estado: 'anulada',
      motivo_anulacion: motivo,
      anulada_at: new Date().toISOString(),
      anulada_por: user?.id
    })
    .eq('id', facturaId)
    .select()
    .single();
    
  return { data, error };
}

// Vista previa del próximo número
export async function getProximoNumeroFactura(restaurantId: string) {
  const { data, error } = await supabase
    .rpc('preview_numero_factura', { p_restaurant_id: restaurantId });
    
  return { data, error };
}

// Formatear monto
export function formatearMonto(centavos: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(centavos / 100);
}

// ========================================
// FUNCIONES DE ADMINISTRADOR MANUAL PARA MESAS
// Agregar estas funciones al final de supabase.ts
// ========================================

/**
 * Poner mesa en mantenimiento con notas (MANUAL)
 */
export const ponerMesaMantenimiento = async (
  restaurantId: string,
  mesaNumero: number,
  motivo: string
): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'mantenimiento',
        notas: `MANTENIMIENTO: ${motivo} - ${new Date().toLocaleString('es-CO')}`,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error poniendo mesa en mantenimiento:', error);
    throw error;
  }
};

/**
 * Activar mesa manualmente (cambiar de inactiva/mantenimiento a libre)
 */
export const activarMesaManual = async (
  restaurantId: string,
  mesaNumero: number
): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'libre',
        notas: `ACTIVADA MANUALMENTE: ${new Date().toLocaleString('es-CO')}`, 
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error activando mesa:', error);
    throw error;
  }
};

/**
 * Reservar mesa con datos del cliente (MANUAL)
 */
export const reservarMesaManual = async (
  restaurantId: string,
  mesaNumero: number,
  datosReserva: {
    nombreCliente: string;
    telefono?: string;
    horaReserva?: string;
    observaciones?: string;
  }
): Promise<void> => {
  try {
    
    
    // Crear notas de reserva completas
    const notasReserva = [
      `RESERVA: ${datosReserva.nombreCliente}`,
      datosReserva.telefono ? `Tel: ${datosReserva.telefono}` : null,
      datosReserva.horaReserva ? `Hora: ${datosReserva.horaReserva}` : null, 
      datosReserva.observaciones ? `Obs: ${datosReserva.observaciones}` : null,
      `Fecha: ${new Date().toLocaleString('es-CO')}`
    ].filter(Boolean).join(' - ');
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'reservada',
        notas: notasReserva,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error reservando mesa:', error);
    throw error;
  }
};

/**
 * Liberar reserva manualmente (cambiar de reservada a libre)  
 */
export const liberarReservaManual = async (
  restaurantId: string,
  mesaNumero: number
): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'libre',
        notas: `RESERVA LIBERADA: ${new Date().toLocaleString('es-CO')}`,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error liberando reserva:', error);
    throw error;
  }
};

/**
 * Inactivar mesa manualmente (poner fuera de servicio)
 */
export const inactivarMesaManual = async (
  restaurantId: string,
  mesaNumero: number,
  motivo: string
): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        estado: 'inactiva',
        notas: `INACTIVA: ${motivo} - ${new Date().toLocaleString('es-CO')}`,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error inactivando mesa:', error);
    throw error;
  }
};

/**
 * Eliminar orden de mesa manualmente (para casos especiales)
 */
export const eliminarOrdenMesa = async (
  restaurantId: string, 
  mesaNumero: number
): Promise<void> => {
  try {
    
    
    // 1. Obtener órdenes activas de la mesa
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenes_mesa')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('numero_mesa', mesaNumero)
      .eq('estado', 'activa');

    if (errorOrdenes) throw errorOrdenes;

    if (!ordenes || ordenes.length === 0) {
      
      return;
    }

    // 2. Eliminar items de las órdenes
    const { error: errorItems } = await supabase
      .from('items_orden_mesa')
      .delete()
      .in('orden_mesa_id', ordenes.map(o => o.id));

    if (errorItems) throw errorItems;

    // 3. Eliminar las órdenes
    const { error: errorOrden } = await supabase
      .from('ordenes_mesa')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('numero_mesa', mesaNumero)
      .eq('estado', 'activa');

    if (errorOrden) throw errorOrden;

    
  } catch (error) {
    console.error('💥 Error eliminando orden:', error);
    throw error;
  }
};

/**
 * Obtener historial de cambios de una mesa específica
 */
export const getHistorialMesa = async (
  restaurantId: string,
  mesaNumero: number
): Promise<{
  mesaActual: RestaurantMesa | null;
  ordenesHistoricas: any[];
  cambiosRecientes: string[];
}> => {
  try {
    
    
    // 1. Obtener información actual de la mesa
    const { data: mesa, error: errorMesa } = await supabase
      .from('restaurant_mesas')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero)
      .single();

    if (errorMesa && errorMesa.code !== 'PGRST116') throw errorMesa;

    // 2. Obtener órdenes históricas (últimas 10)
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenes_mesa')
      .select(`
        id,
        estado,
        monto_total,
        fecha_creacion,
        nombre_mesero,
        observaciones,
        pagada_at
      `)
      .eq('restaurant_id', restaurantId)
      .eq('numero_mesa', mesaNumero)
      .order('fecha_creacion', { ascending: false })
      .limit(10);

    if (errorOrdenes) throw errorOrdenes;

    // 3. Crear lista de cambios recientes basada en notas
    const cambiosRecientes: string[] = [];
    if (mesa?.notas) {
      cambiosRecientes.push(`Último cambio: ${mesa.notas}`);
    }
    if (mesa?.updated_at) {
      cambiosRecientes.push(`Actualizada: ${new Date(mesa.updated_at).toLocaleString('es-CO')}`);
    }

    return {
      mesaActual: mesa,
      ordenesHistoricas: ordenes || [],
      cambiosRecientes
    };
  } catch (error) {
    console.error('💥 Error obteniendo historial:', error);
    throw error;
  }
};

/**
 * Actualizar notas de una mesa (para mantenimiento, reservas, etc.)
 */
export const actualizarNotasMesa = async (
  restaurantId: string,
  mesaNumero: number,
  nuevasNotas: string
): Promise<void> => {
  try {
    
    
    const { error } = await supabase
      .from('restaurant_mesas')
      .update({ 
        notas: `${nuevasNotas} - Actualizado: ${new Date().toLocaleString('es-CO')}`,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .eq('numero', mesaNumero);

    if (error) throw error;
    
  } catch (error) {
    console.error('💥 Error actualizando notas:', error);
    throw error;
  }
};

/**
 * Actualizar información básica de una mesa
 * - Soporta cambio de número (único por restaurante), nombre y capacidad_personas, y estado
 */
export const actualizarMesaBasica = async (
  restaurantId: string,
  numeroActual: number,
  cambios: {
    numero?: number;
    nombre?: string;
    capacidad?: number;
    estado?: 'libre' | 'ocupada' | 'reservada' | 'inactiva' | 'mantenimiento';
  }
): Promise<RestaurantMesa> => {
  try {
    // Validaciones básicas
    if (typeof cambios.nombre === 'string' && cambios.nombre.length > 100) {
      throw new Error('El nombre no puede superar 100 caracteres');
    }
    if (typeof cambios.capacidad === 'number') {
      if (!Number.isInteger(cambios.capacidad) || cambios.capacidad < 1) {
        throw new Error('La capacidad debe ser un entero mayor o igual a 1');
      }
    }
    if (typeof cambios.numero === 'number') {
      if (!Number.isInteger(cambios.numero) || cambios.numero < 1) {
        throw new Error('El número de mesa debe ser un entero mayor o igual a 1');
      }
    }

    // Si se cambia el número, verificar unicidad
    if (typeof cambios.numero === 'number' && cambios.numero !== numeroActual) {
      const { data: existe, error: errExiste } = await supabase
        .from('restaurant_mesas')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('numero', cambios.numero)
        .maybeSingle();
      if (errExiste && errExiste.code !== 'PGRST116') throw errExiste;
      if (existe) {
        throw new Error(`El número de mesa ${cambios.numero} ya está en uso`);
      }
    }

    // Construir payload
    const payload: any = { updated_at: new Date().toISOString() };
    if (typeof cambios.nombre === 'string') payload.nombre = cambios.nombre.trim();
    if (typeof cambios.capacidad === 'number') payload.capacidad_personas = cambios.capacidad;
    if (typeof cambios.estado === 'string') payload.estado = cambios.estado;
    if (typeof cambios.numero === 'number') payload.numero = cambios.numero;

    const { data, error } = await supabase
      .from('restaurant_mesas')
      .update(payload)
      .eq('restaurant_id', restaurantId)
      .eq('numero', numeroActual)
      .select()
      .single();

    if (error) throw error;

    invalidateCache('getMesasRestaurante', restaurantId);
    return data as RestaurantMesa;
  } catch (error) {
    console.error('💥 Error actualizando mesa:', error);
    throw error;
  }
};

/**
 * Validar si se puede cerrar la caja (sin órdenes pendientes)
 */
/**
 * Validar si se puede cerrar la caja (sin órdenes pendientes)
 */
export const validarCierreCaja = async (restaurantId: string): Promise<{
  puedeSerrar: boolean;
  ordenesPendientes: any[];
  totalPendiente: number;
  mensaje: string;
}> => {
  try {
    
    
    // Obtener órdenes de mesa pendientes
    const ordenesMesa = await getOrdenesMesasPendientes(restaurantId);
    
    // Obtener órdenes de delivery pendientes  
    const ordenesDelivery = await getOrdenesDeliveryPendientes(restaurantId);
    
    // NORMALIZAR los datos para evitar errores de TypeScript
    const mesasNormalizadas = ordenesMesa.map(orden => ({
      id: orden.id,
      tipo: 'mesa' as const,
      identificador: `Mesa ${orden.numero_mesa}`,
      total: orden.monto_total, // ← Normalizado
      fecha: orden.fecha_creacion
    }));
    
    const deliveryNormalizado = ordenesDelivery.map(orden => ({
      id: orden.id,
      tipo: 'delivery' as const,
      identificador: orden.customer_name,
      total: orden.total_amount, // ← Normalizado
      fecha: orden.created_at
    }));
    
    const todasLasPendientes = [...mesasNormalizadas, ...deliveryNormalizado];
    
    // Ahora puedo usar .total sin problemas
    const totalPendiente = todasLasPendientes.reduce((sum, orden) => {
      return sum + (orden.total || 0);
    }, 0);
    
    const puedeSerrar = todasLasPendientes.length === 0;
    
    let mensaje = '';
    if (!puedeSerrar) {
      const mesasPendientes = mesasNormalizadas.map(o => o.identificador).join(', ');
      const deliveryPendientes = deliveryNormalizado.length > 0 ? 
        `${deliveryNormalizado.length} delivery(s)` : '';
      
      mensaje = `No puedes cerrar la caja. Tienes pagos pendientes:\n\n`;
      if (mesasPendientes) mensaje += `🍽️ Mesas: ${mesasPendientes}\n`;
      if (deliveryPendientes) mensaje += `🚚 Delivery: ${deliveryPendientes}\n`;
      mensaje += `\n💰 Total pendiente: ${formatearMonto(totalPendiente * 100)}`;
      mensaje += `\n\n⚠️ Cobra todas las órdenes antes de cerrar la caja.`;
    }
    
    return {
      puedeSerrar,
      ordenesPendientes: todasLasPendientes,
      totalPendiente,
      mensaje
    };
    
  } catch (error) {
    console.error('❌ Error validando cierre de caja:', error);
    throw error;
  }
};

