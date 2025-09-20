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

// Cliente adicional con Service Role para operaciones administrativas
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

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
// FAVORITOS Y PLANTILLAS (MENU DEL DÍA)
// Helpers CRUD directos a tablas con RLS
// ========================================

// ===== COMBINACIONES FAVORITAS =====
export async function createFavoriteCombination(data: {
  restaurant_id: string;
  combination_name: string;
  combination_description?: string;
  combination_price?: number | null;
  entrada_product_id?: string;
  principio_product_id: string;
  proteina_product_id: string;
  bebida_product_id?: string;
  acompanamiento_products?: string[];
}) {
  // Some environments may not have certain optional columns (e.g., combination_price).
  // Build an insert payload that omits fields likely to be absent to stay schema-compatible.
  const {
    combination_price: _omitPrice, // intentionally omitted
    ...rest
  } = data;

  // Remove undefined fields to avoid sending nulls unintentionally
  const insertRow: Record<string, any> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) insertRow[k] = v;
  }

  // Attempt insert; if Supabase complains about unknown columns (PGRST204),
  // remove the offending column(s) and retry to support schema variations.
  let workingRow: Record<string, any> = { ...insertRow };
  let lastError: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: result, error } = await supabase
      .from('favorite_combinations')
      .insert(workingRow)
      .select()
      .single();
    if (!error) return result as any;
    lastError = error;
    const msg = String(error?.message || '');
    // Try to extract the unknown column name from error message
    const match = msg.match(/\'(.*?)\' column/i) || msg.match(/column \"(.*?)\"/i);
    const unknownCol = match && match[1] ? match[1] : null;
    if (unknownCol && unknownCol in workingRow) {
      const { [unknownCol]: _removed, ...rest } = workingRow;
      workingRow = rest;
      continue; // retry without that column
    }
    break; // Unknown/unhandled error
  }

  // If we reach here, rethrow the last error
  const { data: result, error } = await supabase
    .from('favorite_combinations')
    .insert(workingRow)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getFavoriteCombinations(restaurant_id: string) {
  const { data, error } = await supabase
    .from('favorite_combinations')
    .select('*')
    .eq('restaurant_id', restaurant_id);

  if (error) throw error;
  return data || [];
}

export async function deleteFavoriteCombination(id: string) {
  const { error } = await supabase
    .from('favorite_combinations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateFavoriteCombinationName(id: string, name: string) {
  const { error } = await supabase
    .from('favorite_combinations')
    .update({ combination_name: name })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Ensure a favorite combination exists for the given core components.
 * If none found, it will create one (schema-compatible: omits optional columns).
 * Matching rule: restaurant + principio + proteina + (entrada or null) + (bebida or null).
 * Note: We ignore acompañamientos when matching to avoid array-order issues.
 */
export async function ensureFavoriteCombination(data: {
  restaurant_id: string;
  combination_name: string;
  combination_description?: string | null;
  combination_price?: number | null;
  principio_product_id: string;
  proteina_product_id: string;
  entrada_product_id?: string | null;
  bebida_product_id?: string | null;
  acompanamiento_products?: string[];
}) {
  // Sanitize inputs
  const principioId = data.principio_product_id || null;
  const proteinaId = data.proteina_product_id || null;
  const entradaId = data.entrada_product_id ?? null;
  const bebidaId = data.bebida_product_id ?? null;

  // If required core IDs are missing, skip ensuring
  if (!principioId || !proteinaId) {
    // eslint-disable-next-line no-console
    console.warn('[ensureFavoriteCombination] Missing core IDs, skipping ensure.');
    return null as any;
  }

  // Try to find an existing favorite with same core components
  let q = supabase
    .from('favorite_combinations')
    .select('id')
    .eq('restaurant_id', data.restaurant_id)
    .eq('principio_product_id', principioId)
    .eq('proteina_product_id', proteinaId);
  if (entradaId) {
    q = q.eq('entrada_product_id', entradaId);
  } else {
    q = q.is('entrada_product_id', null);
  }
  if (bebidaId) {
    q = q.eq('bebida_product_id', bebidaId);
  } else {
    q = q.is('bebida_product_id', null);
  }
  const { data: found, error: findError } = await q.limit(1);
  if (findError) throw findError;
  if (Array.isArray(found) && found.length > 0) return found[0];
  // Not found → create (will omit optional columns internally)
  const created = await createFavoriteCombination({
    restaurant_id: data.restaurant_id,
    combination_name: data.combination_name,
    combination_description: data.combination_description ?? null,
    combination_price: data.combination_price ?? null,
    principio_product_id: principioId,
    proteina_product_id: proteinaId,
    entrada_product_id: entradaId,
    bebida_product_id: bebidaId,
    acompanamiento_products: data.acompanamiento_products || [],
  } as any);
  return created;
}

/**
 * Delete a favorite combination by its core components.
 * Matching rule mirrors ensureFavoriteCombination: restaurant + principio + proteina + entrada/null + bebida/null.
 */
export async function deleteFavoriteCombinationByComponents(match: {
  restaurant_id: string;
  principio_product_id?: string | null;
  proteina_product_id?: string | null;
  entrada_product_id?: string | null;
  bebida_product_id?: string | null;
}) {
  const principioId = match.principio_product_id || null;
  const proteinaId = match.proteina_product_id || null;
  const entradaId = match.entrada_product_id ?? null;
  const bebidaId = match.bebida_product_id ?? null;

  if (!principioId || !proteinaId) {
    // eslint-disable-next-line no-console
    console.warn('[deleteFavoriteCombinationByComponents] Missing core IDs, skipping delete.');
    return;
  }

  let q = supabase
    .from('favorite_combinations')
    .select('id')
    .eq('restaurant_id', match.restaurant_id)
    .eq('principio_product_id', principioId)
    .eq('proteina_product_id', proteinaId);
  if (entradaId) {
    q = q.eq('entrada_product_id', entradaId);
  } else {
    q = q.is('entrada_product_id', null);
  }
  if (bebidaId) {
    q = q.eq('bebida_product_id', bebidaId);
  } else {
    q = q.is('bebida_product_id', null);
  }
  const { data: found, error } = await q.limit(1);
  if (error) throw error;
  const target = Array.isArray(found) && found.length > 0 ? found[0] : null;
  if (target?.id) {
    await deleteFavoriteCombination(target.id);
  }
}

// ===== PLANTILLAS DE MENÚ =====
export async function createMenuTemplate(
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
) {
  // Only insert required fields to avoid schema mismatches across envs
  const insertData = {
    restaurant_id: templateData.restaurant_id,
    template_name: templateData.template_name,
  } as const;

  const { data: template, error: templateError } = await supabase
    .from('menu_templates')
    .insert(insertData)
    .select()
    .single();

  if (templateError) throw templateError;

  if (products && products.length > 0) {
    const productsWithTemplateId = products.map((p) => {
      const row: any = {
        template_id: template.id,
        universal_product_id: p.universal_product_id,
        // Populate descriptive fields when available
        category_name: (p as any).category_name ?? null,
        product_name: (p as any).product_name ?? null,
      };
      // Only send category_id where it's available to stay compatible with envs
      if ((p as any).category_id) {
        row.category_id = (p as any).category_id;
      }
      return row;
    });

    let productsError = null as any;
    try {
      const { error } = await supabase
        .from('menu_template_products')
        .insert(productsWithTemplateId);
      productsError = error;
    } catch (e: any) {
      productsError = e;
    }

    // If insert failed due to unknown column 'category_id', retry without it
    if (productsError) {
      const msg = String(productsError?.message || productsError?.hint || '');
      if (/category_id/i.test(msg) && /column/i.test(msg)) {
        const fallbackRows = productsWithTemplateId.map((r: any) => {
          const { category_id, ...rest } = r;
          return rest;
        });
        const { error: retryError } = await supabase
          .from('menu_template_products')
          .insert(fallbackRows);
        if (retryError) throw retryError;
      } else {
        throw productsError;
      }
    }
  }
  return template;
}

export async function getMenuTemplates(restaurant_id: string) {
  const { data, error } = await supabase
    .from('menu_templates')
    .select('*')
    .eq('restaurant_id', restaurant_id);

  if (error) throw error;
  return data || [];
}

export async function getTemplateProducts(template_id: string) {
  const { data, error } = await supabase
    .from('menu_template_products')
    .select('*')
    .eq('template_id', template_id);

  if (error) throw error;
  const items = (data || []) as any[];
  // If some rows are missing product_name or category_id, hydrate from universal_products
  const missingInfoIds = items
    .filter((it) => !it.product_name || !it.category_id)
    .map((it) => it.universal_product_id);

  if (missingInfoIds.length > 0) {
    try {
      const { data: products } = await supabase
        .from('universal_products')
        .select('id,name,category_id')
        .in('id', Array.from(new Set(missingInfoIds)));
      const infoMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]));
      for (const it of items) {
        const info = infoMap.get(it.universal_product_id);
        if (info) {
          if (!it.product_name) it.product_name = info.name || it.product_name;
          if (!it.category_id) it.category_id = info.category_id || it.category_id;
        }
      }
    } catch {
      // ignore hydration failures silently
    }
  }
  return items;
}

export async function deleteMenuTemplate(id: string) {
  // Primero eliminar los productos asociados para evitar conflictos de FK
  const { error: childErr } = await supabase
    .from('menu_template_products')
    .delete()
    .eq('template_id', id);
  if (childErr) throw childErr;

  const { error } = await supabase
    .from('menu_templates')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ========================================
// INSTRUMENTACIÓN / WRAPPERS DE SEGURIDAD AUTH
// ========================================

let __lastAccessToken: string | null = null;
// Escuchar cambios de auth para guardar último token (debug)
try {
  supabase.auth.onAuthStateChange((_event, session) => {
    __lastAccessToken = session?.access_token || null;
  });
} catch { /* no-op en SSR */ }

/**
 * Forzar verificación de sesión antes de consultas. Intenta refresh si hay refresh_token.
 * Devuelve la sesión final (o null si no hay). Loggea advertencia si no hay token.
 */
export async function ensureSession(options?: { silent?: boolean }) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session;
    // Intentar refresh proactivo (solo navegador)
    if (typeof window !== 'undefined') {
      try {
        const { data } = await supabase.auth.refreshSession();
        if (data.session?.access_token) return data.session;
      } catch {/* ignore */}
    }
    if (!options?.silent) {
      // eslint-disable-next-line no-console
      console.warn('[auth][ensureSession] Sin sesión JWT activa. Las políticas RLS verán auth.uid() = null.');
    }
    return null;
  } catch (e) {
    if (!options?.silent) {
      // eslint-disable-next-line no-console
      console.warn('[auth][ensureSession] Error obteniendo sesión', e);
    }
    return null;
  }
}

/**
 * Wrapper seguro para supabase.from(table) que garantiza un intento de obtener/refresh sesión
 * antes de ejecutar la query, para mitigar llamadas con auth.uid() = null.
 */
export async function safeFrom(table: string) {
  const session = await ensureSession({ silent: true });
  if (!session) {
    // eslint-disable-next-line no-console
    console.warn(`[auth][safeFrom] Ejecutando consulta a '${table}' sin JWT activo (auth.uid() será null).`);
  }
  return supabase.from(table);
}

// Helper de depuración accesible en consola
if (typeof window !== 'undefined') {
  (window as any).debugSupabaseAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    // eslint-disable-next-line no-console
    console.log('[debugSupabaseAuth]', {
      hasSession: !!session,
      userId: session?.user?.id,
      expiresAt: session?.expires_at,
      tokenShort: session?.access_token ? session.access_token.slice(0, 24) + '…' : null,
      lastAccessTokenShort: __lastAccessToken ? __lastAccessToken.slice(0,24)+'…' : null
    });
    return session;
  };
}

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
        .maybeSingle();

      if (error) {
        console.error('Error al obtener restaurante:', error);
        __restaurantCache = { value: null, ts: Date.now() };
        return null;
      }

      // Si no hay restaurante, data será null (no es error)
      if (!data) {
        __restaurantCache = { value: null, ts: Date.now() };
        return null;
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
      role: 'restaurant_owner',
      is_active: true
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
    image_url?: string | null;
    image_alt?: string | null;
  }
): Promise<SpecialDish> => {
  let data: any; let error: any;
  try {
    const result = await supabase
      .from('special_dishes')
      .insert({
        restaurant_id: restaurantId,
        dish_name: dishData.dish_name,
        dish_description: dishData.dish_description,
        dish_price: dishData.dish_price,
        is_template: true,
        status: 'draft',
        image_url: dishData.image_url || null,
        image_alt: dishData.image_alt || null
      })
      .select()
      .single();
    data = result.data; error = result.error;
    if (error && /image_url|image_alt/i.test(error.message)) {
      // Fallback sin columnas nuevas (DB aún no migrada)
      const legacy = await supabase
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
      data = legacy.data; error = legacy.error;
    }
  } catch (e:any) {
    throw e;
  }
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
  let data: any; let error: any;
  const payload = { ...updates, updated_at: new Date().toISOString() } as any;
  try {
    const result = await supabase
      .from('special_dishes')
      .update(payload)
      .eq('id', specialDishId)
      .select()
      .single();
    data = result.data; error = result.error;
    if (error && /image_url|image_alt/i.test(error.message)) {
      // Retirar claves desconocidas y reintentar
      delete payload.image_url; delete payload.image_alt;
      const legacy = await supabase
        .from('special_dishes')
        .update(payload)
        .eq('id', specialDishId)
        .select()
        .single();
      data = legacy.data; error = legacy.error;
    }
  } catch (e:any) {
    throw e;
  }
  if (error) throw error;
  // invalidaciones amplias (no tenemos restaurantId aquí)
  invalidateCache('getRestaurantSpecialDishes');
  invalidateCache('getAvailableSpecialsToday');
  invalidateCache('getSpecialsStatusToday');
  return data;
};

// ==============================
// SUBIDA DE IMAGEN PARA ESPECIALES
// ==============================
export const uploadSpecialDishImage = async (file: File | Blob): Promise<string> => {
  const bucket = 'special-dishes';
  const originalName = (file as any).name || 'image';
  const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase().replace(/[^a-z0-9]/g,'') : 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('No se pudo obtener URL pública');
  return data.publicUrl;
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
  const today = require('@spoon/shared/utils/datetime').getBogotaDateISO();
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
              precio_unitario,
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
        const cantidad = item.cantidad || 1;
        const precioTotal = item.precio_total || 0;
        const precioUnitario = item.precio_unitario != null
          ? item.precio_unitario
          : (cantidad > 0 ? precioTotal / cantidad : precioTotal);

        acc[mesa].items.push({
          id: item.id,
          nombre: nombreProducto,
          cantidad,
          precio_unitario: precioUnitario,
          precio_total: precioTotal,
          tipo_item: item.tipo_item,
          combinacion_id: item.combinacion_id,
          combinacion_especial_id: item.combinacion_especial_id
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

/**
 * Cobrar mesa registrando transacción en caja si existe sesión activa.
 * Fallback a cobrarMesa simple si no hay sesión.
 */
export const cobrarMesaConTransaccion = async (
  restaurantId: string,
  mesaNumero: number,
  metodo: 'efectivo' | 'tarjeta' | 'digital' = 'efectivo',
  montoRecibido?: number
) => {
  try {
    // Obtener sesión activa
    const sesion = await getSesionCajaActiva(restaurantId);
    if (!sesion) {
      // Sin sesión, cobrar “plano”
      await cobrarMesa(restaurantId, mesaNumero);
      return { success: true, viaTransaccion: false };
    }

    // Necesitamos total de la mesa antes de marcar pagada
    const detalles = await getDetallesMesa(restaurantId, mesaNumero);
  const total = Number(detalles.total) || 0;

    // Crear transacción usando procesarPagoOrden para mantener consistencia
    // Creamos una orden “virtual” referenciando la primera orden activa si existe
    // Buscar orden activa real
    const { data: ordenActiva } = await supabase
      .from('ordenes_mesa')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('numero_mesa', mesaNumero)
      .eq('estado', 'activa')
      .maybeSingle();

    if (!ordenActiva) {
      // Si no hay orden activa (race condition), sólo marcar pagada (no transacción)
      await cobrarMesa(restaurantId, mesaNumero);
      return { success: true, viaTransaccion: false };
    }

  // Reusar lógica de procesarPagoOrden (definida más arriba)
  await procesarPagoOrden(
      sesion.id,
      sesion.cajero_id,
      ordenActiva.id,
      'mesa',
      metodo,
      total,
      montoRecibido
    );
  console.log('[cobrarMesaConTransaccion] Transacción registrada mesa', mesaNumero, 'total', total, 'metodo', metodo);
  // Invalidar caches para reflejar cambios en UI y métricas
  invalidateCache('getMesasRestaurante', restaurantId);
  invalidateCache('getMesasEstado', restaurantId);
  invalidateCache('getDetallesMesa', `${restaurantId}:${mesaNumero}`);
  invalidateCache('getEstadoCompletoMesas', restaurantId);
  invalidateCache('getTransaccionesDelDia', restaurantId);
  invalidateCache('getTransaccionesSesion', sesion.id);
  // Warm cache inmediata para ingresos (ventas) del día
  try {
    await getTransaccionesDelDia(restaurantId);
  } catch (warmErr) {
    console.warn('No se pudo recalentar cache de transacciones del día:', warmErr);
  }
    return { success: true, viaTransaccion: true };
  } catch (e) {
    console.error('Error en cobrarMesaConTransaccion, fallback a cobrarMesa simple:', e);
    try {
      await cobrarMesa(restaurantId, mesaNumero);
      return { success: true, viaTransaccion: false };
    } catch (e2) {
      console.error('Fallo también el fallback cobrarMesa:', e2);
      throw e2;
    }
  }
};

/**
 * Registrar cobro (histórico) sin alterar lógica existente de cierre de orden.
 * Crea un registro en tabla 'cobros_mesa' (debes crearla si no existe) con breakdown básico.
 */
export const registrarCobroMesa = async (params: {
  restaurantId: string;
  mesaNumero: number;
  total: number;
  items: { nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  metodo?: string;
  referencia?: string;
}) => {
  try {
    const { restaurantId, mesaNumero, total, items, metodo = 'efectivo', referencia } = params;

    // Intento de inserción; si la tabla no existe, log y salir silencioso
    const { error } = await supabase
      .from('cobros_mesa')
      .insert({
        restaurant_id: restaurantId,
        numero_mesa: mesaNumero,
        total,
        items_json: items,
        metodo_pago: metodo,
        referencia,
        created_at: new Date().toISOString()
      });
    if (error) {
      // No rompemos el flujo principal de cobro
      console.warn('⚠️ No se pudo registrar cobro (cobros_mesa):', error.message);
      return { success: false, logged: false };
    }
    return { success: true, logged: true };
  } catch (e) {
    console.warn('⚠️ Error registrando cobro:', e);
    return { success: false, logged: false };
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
      try {
        await updateEstadoMesa(mesa.id, 'ocupada', ordenData.restaurantId);
      } catch (e) {
        console.warn('⚠️ No se pudo actualizar estado de la mesa a ocupada (continuando)', e);
      }
    } else {
      console.warn('⚠️ No se encontró mesa para actualizar a ocupada tras crear orden', ordenData.numeroMesa);
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
 * Actualizar cantidad de un item existente de una orden
 */
export const actualizarCantidadItemOrden = async (
  itemId: string,
  nuevaCantidad: number
) => {
  try {
    if (nuevaCantidad < 1) throw new Error('Cantidad debe ser >= 1');
    const { error } = await supabase
      .from('items_orden_mesa')
  .update({ cantidad: nuevaCantidad })
      .eq('id', itemId);
    if (error) throw error;
    invalidateCache('getEstadoCompletoMesas');
    return { success: true };
  } catch (error) {
    console.error('💥 Error en actualizarCantidadItemOrden:', error);
    throw error;
  }
};

/**
 * Eliminar un item de una orden
 */
export const eliminarItemOrden = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('items_orden_mesa')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
    invalidateCache('getEstadoCompletoMesas');
    return { success: true };
  } catch (error) {
    console.error('💥 Error en eliminarItemOrden:', error);
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
  nuevoEstado: 'libre' | 'ocupada' | 'reservada' | 'inactiva',
  restaurantId?: string
): Promise<RestaurantMesa> => {
  try {
    
    
    let query = supabase
      .from('restaurant_mesas')
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', mesaId);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    
  // Invalidar por restaurant_id si se conoce (no lo tenemos aquí); invalidación amplia
  invalidateCache('getMesasRestaurante');
  return data as RestaurantMesa;
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
// Unidades: Interfaces DB-facing usan CENTAVOS para montos persistidos/agregados.
// La UI/APP trabaja en PESOS y convierte según necesidad.
// ========================================

export interface CajaSesion {
  id: string;
  restaurant_id: string;
  cajero_id: string;
  monto_inicial: number; // Centavos (persistencia)
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
  monto_total: number; // Centavos (persistencia)
  monto_recibido?: number;
  monto_cambio: number;
  procesada_at: string;
  cajero_id: string;
  // Para joins con sesiones (cuando se haga select con inner join)
  caja_sesiones?: {
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

// Fecha actual (YYYY-MM-DD) según zona Bogotá evitando usar toISOString directo (que da día UTC)
const getTodayBogotaDateString = (): string => {
  const now = new Date();
  // Bogotá UTC-5: restar 5 horas para obtener día local antes de cortar
  const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  return bogota.toISOString().slice(0, 10);
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
  saldo_final_reportado?: number | null; // opcional (puede no existir en schema actual)
  total_ventas_centavos: number;
  total_efectivo_centavos: number;
  total_gastos_centavos: number;
};

export const getCierresCajaRecientes = async (
  restaurantId: string,
  limite = 30
): Promise<CierreCajaResumen[]> => {
  // 1. Sesiones cerradas recientes
  const { data: sesiones, error: errSes } = await supabase
    .from('caja_sesiones')
    // usamos * para soportar futura columna saldo_final_reportado sin modificar código
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('estado', 'cerrada')
    .not('cerrada_at', 'is', null)
    .order('cerrada_at', { ascending: false })
    .limit(limite);
  if (errSes) throw errSes;
  if (!sesiones || !sesiones.length) return [] as CierreCajaResumen[];

  const ids = sesiones.map(s => s.id);

  // 2. Transacciones agrupadas
  const { data: agregTrans, error: errTrans } = await supabase
    .from('transacciones_caja')
    .select('caja_sesion_id, monto_total, metodo_pago')
    .in('caja_sesion_id', ids);
  if (errTrans) throw errTrans;

  // 3. Gastos agrupados
  const { data: agregGastos, error: errG } = await supabase
    .from('gastos_caja')
    .select('caja_sesion_id, monto')
    .in('caja_sesion_id', ids);
  if (errG) throw errG;

  const transPorSesion: Record<string, { total: number; efectivo: number }> = {};
  (agregTrans || []).forEach(t => {
    const sid = (t as any).caja_sesion_id;
    if (!transPorSesion[sid]) transPorSesion[sid] = { total: 0, efectivo: 0 };
    const monto = (t as any).monto_total || 0;
    transPorSesion[sid].total += monto;
    if ((t as any).metodo_pago === 'efectivo') transPorSesion[sid].efectivo += monto;
  });

  const gastosPorSesion: Record<string, number> = {};
  (agregGastos || []).forEach(g => {
    const sid = (g as any).caja_sesion_id;
    const monto = (g as any).monto || 0;
    gastosPorSesion[sid] = (gastosPorSesion[sid] || 0) + monto;
  });

  return (sesiones as any[]).map((s: any) => ({
    id: String(s.id),
    abierta_at: String(s.abierta_at),
    cerrada_at: String(s.cerrada_at),
    cajero_id: String(s.cajero_id),
    monto_inicial: Number(s.monto_inicial),
  saldo_final_reportado: s.saldo_final_reportado == null ? null : Number(s.saldo_final_reportado),
    total_ventas_centavos: transPorSesion[s.id]?.total || 0,
    total_efectivo_centavos: transPorSesion[s.id]?.efectivo || 0,
    total_gastos_centavos: gastosPorSesion[s.id] || 0
  })) as CierreCajaResumen[];
};

/**
 * Detalle de un cierre (sesión de caja cerrada) con agregados básicos.
 * No incluye todavía diferencia real (faltan campos de saldo final reportado en schema actual).
 */
export const getCierreCajaDetalle = async (sesionId: string): Promise<{
  sesion: any;
  transacciones: any[];
  gastos: any[];
  agregados: {
    total_ventas_centavos: number;
    total_efectivo_centavos: number;
    total_tarjeta_centavos: number;
    total_digital_centavos: number;
    total_gastos_centavos: number;
    efectivo_teorico_centavos: number; // monto_inicial + efectivo - gastos
  };
}> => {
  // 1. Sesión
  const { data: sesion, error: errS } = await supabase
    .from('caja_sesiones')
    .select('*')
    .eq('id', sesionId)
    .maybeSingle();
  if (errS) throw errS;
  if (!sesion) throw new Error('Sesión no encontrada');

  // 2. Transacciones de la sesión
  const { data: transacciones, error: errT } = await supabase
    .from('transacciones_caja')
    .select('*')
    .eq('caja_sesion_id', sesionId)
    .order('procesada_at', { ascending: false });
  if (errT) throw errT;

  // 3. Gastos de la sesión
  const { data: gastos, error: errG } = await supabase
    .from('gastos_caja')
    .select('*')
    .eq('caja_sesion_id', sesionId)
    .order('registrado_at', { ascending: false });
  if (errG) throw errG;

  const totalVentas = (transacciones || []).reduce((s, t: any) => s + (t.monto_total || 0), 0);
  const totalEfectivo = (transacciones || []).filter(t => t.metodo_pago === 'efectivo').reduce((s, t: any) => s + (t.monto_total || 0), 0);
  const totalTarjeta = (transacciones || []).filter(t => t.metodo_pago === 'tarjeta').reduce((s, t: any) => s + (t.monto_total || 0), 0);
  const totalDigital = (transacciones || []).filter(t => t.metodo_pago === 'digital').reduce((s, t: any) => s + (t.monto_total || 0), 0);
  const totalGastos = (gastos || []).reduce((s, g: any) => s + (g.monto || 0), 0);
  const efectivoTeorico = (sesion.monto_inicial || 0) + totalEfectivo - totalGastos;

  return {
    sesion,
    transacciones: transacciones || [],
    gastos: gastos || [],
    agregados: {
      total_ventas_centavos: totalVentas,
      total_efectivo_centavos: totalEfectivo,
      total_tarjeta_centavos: totalTarjeta,
      total_digital_centavos: totalDigital,
      total_gastos_centavos: totalGastos,
      efectivo_teorico_centavos: efectivoTeorico
    }
  };
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
  cajero_id: cajeroId,
  // Campo de timestamp usado por reportes diarios
  procesada_at: new Date().toISOString()
      })
      .select()
      .single();

    if (errorTransaccion) throw errorTransaccion;

    // DEBUG: verificación RLS / visibilidad inmediata
    try {
      const { data: txCheck, error: txCheckError } = await supabase
        .from('transacciones_caja')
        .select('id, caja_sesion_id, procesada_at, monto_total, metodo_pago')
        .eq('id', transaccion.id)
        .maybeSingle();
      if (txCheckError) {
        console.warn('[transacciones_caja][debug] Relectura post-insert falló:', txCheckError.message);
      } else if (!txCheck) {
        console.warn('[transacciones_caja][debug] Relectura devolvió null (posible RLS):', transaccion.id);
      } else {
        console.log('[transacciones_caja][debug] Insert visible:', txCheck);
      }
    } catch (dbgErr) {
      console.warn('[transacciones_caja][debug] Error verificación post-insert:', dbgErr);
    }

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
  const fechaBusqueda = fecha || getTodayBogotaDateString();
  const { startUtc, endUtc } = getBogotaDayUtcBounds(fechaBusqueda);
  // Log unificado para rango Bogotá
  console.log('[getTransaccionesDelDia][debug] fecha', fechaBusqueda, 'startUtc', startUtc, 'endUtc', endUtc);
  console.log('[getTransaccionesDelDia][debug] fecha', fechaBusqueda, 'startUtc', startUtc, 'endUtc', endUtc);
    // 1) Obtener sesiones del restaurante que se solapan con el día Bogotá
  const { data: sesiones, error: errorSesiones } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .lte('abierta_at', endUtc)
      .or(`cerrada_at.gte.${startUtc},cerrada_at.is.null`);
    if (errorSesiones) throw errorSesiones;
  console.log('[getTransaccionesDelDia][debug] sesiones candidatas', sesiones?.map(s=>s.id));

    if (!sesiones || sesiones.length === 0) {
      return {
        transacciones: [],
        totalVentas: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalDigital: 0
      };
    }

    // 2) Obtener transacciones de esas sesiones dentro del día
    const { data: transacciones, error: errorTransacciones } = await supabase
      .from('transacciones_caja')
      .select('*')
      .in('caja_sesion_id', sesiones.map(s => s.id))
      .gte('procesada_at', startUtc)
      .lt('procesada_at', endUtc)
      .order('procesada_at', { ascending: false });

    if (errorTransacciones) throw errorTransacciones;
  console.log('[getTransaccionesDelDia][debug] transacciones recuperadas', (transacciones||[]).length, 'primer elemento', transacciones && transacciones[0]);

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
  const ahoraIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('gastos_caja')
      .insert({
        caja_sesion_id: cajaSesionId,
        concepto: gastoData.concepto,
        monto: gastoData.monto,
        categoria: gastoData.categoria,
        comprobante_url: gastoData.comprobante_url,
        registrado_por: cajeroId,
    notas: gastoData.notas,
    // Aseguramos timestamp de registro para filtros diarios
    registrado_at: ahoraIso
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
  const fechaBusqueda = fecha || getTodayBogotaDateString();
    const { startUtc, endUtc } = getBogotaDayUtcBounds(fechaBusqueda);
    // 1) Obtener sesiones del restaurante que se solapan con el día Bogotá
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .lte('abierta_at', endUtc)
      .or(`cerrada_at.gte.${startUtc},cerrada_at.is.null`);

    if (errorSesiones) throw errorSesiones;

    if (!sesiones || sesiones.length === 0) {
      console.log('[getGastosDelDia][debug] sin sesiones para rango');
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

    // 2) Obtener gastos de esas sesiones dentro del día
    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos_caja')
      .select('*')
      .in('caja_sesion_id', sesiones.map(s => s.id))
      .gte('registrado_at', startUtc)
      .lt('registrado_at', endUtc)
      .order('registrado_at', { ascending: false });

  if (errorGastos) throw errorGastos;
  console.log('[getGastosDelDia][debug] gastos recuperados', (gastos||[]).length);

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

// Formatear monto (en PESOS)
export function formatearMonto(pesos: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(pesos);
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

//SISTEMA DE ROLES COMPLETADO - RESUMEN FINAL
//¡PERFECTO! 🎉 El sistema de roles está 100% implementado en la base de datos.
//📊 RESUMEN COMPLETO
//🗄️ Tablas creadas (5):

//✅ system_roles - 6 roles en español
//✅ permissions - 20 permisos modulares
//✅ role_permissions - Matriz de permisos por rol
//✅ restaurant_role_configs - Configuración personalizada
//✅ user_roles - Asignación usuarios ↔ roles

//📋 Datos insertados:

//✅ 6 roles: propietario, gerente, cajero, mesero, cocinero, administrador
//✅ 20 permisos en 5 módulos: caja(6), config(4), menu(4), ordenes(4), mesas(2)
//✅ Jerarquía correcta: propietario(20) > gerente(18) > cajero(7) > mesero(6) > cocinero(5)
//✅ 1 usuario migrado correctamente

//⚙️ Funcionalidad:

//✅ Función RPC get_user_permissions() funcionando
//✅ 12 políticas RLS protegiendo datos por restaurante
//✅ Migración automática de usuarios existentes

//🔒 Seguridad implementada:

//✅ Separación total por restaurante
//✅ Control granular de permisos
//✅ Solo propietarios pueden gestionar usuarios
//✅ Administradores tienen acceso técnico completo