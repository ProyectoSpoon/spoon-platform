// src/lib/webadminSupabase.ts
// Cliente secundario para conectar directamente al proyecto Supabase usado por el WebAdmin.
// Usa variables de entorno diferentes para no mezclar sesiones ni claves con el cliente principal de la app.
// NOTA: Nunca expongas la service_role key aquí. Solo la anon/public key del proyecto del WebAdmin.

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables (prefijo EXPO_PUBLIC_ para que Metro las inyecte en runtime de Expo RN)
const webAdminSupabaseUrl = process.env.EXPO_PUBLIC_WEBADMIN_SUPABASE_URL;
const webAdminSupabaseAnon = process.env.EXPO_PUBLIC_WEBADMIN_SUPABASE_ANON_KEY;

if (!webAdminSupabaseUrl || !webAdminSupabaseAnon) {
  console.warn('[WebAdminSupabase] Faltan EXPO_PUBLIC_WEBADMIN_SUPABASE_URL / EXPO_PUBLIC_WEBADMIN_SUPABASE_ANON_KEY');
}

// Adaptador de sesión separado (para no mezclar sesión del otro proyecto)
const storageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(`webadmin_${key}`),
  setItem: (key: string, value: string) => AsyncStorage.setItem(`webadmin_${key}`, value),
  removeItem: (key: string) => AsyncStorage.removeItem(`webadmin_${key}`)
};

export const webadminSupabase = (webAdminSupabaseUrl && webAdminSupabaseAnon)
  ? createClient(webAdminSupabaseUrl, webAdminSupabaseAnon, {
      auth: {
        storage: storageAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

// =============================
// Tipos básicos (ajusta según tu schema real)
// =============================
export interface WA_Restaurant {
  id: string;
  name: string;
  cuisine_type?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  description?: string;
  created_at?: string;
}

export interface WA_Special {
  id: string;
  name: string;
  description?: string;
  price: number;          // Asumimos precio en centavos o unidades — ajustar si es DECIMAL.
  type?: 'special' | 'daily_menu';
  restaurant_id: string;
  date?: string;          // YYYY-MM-DD si existe.
  active?: boolean;
  created_at?: string;
  // Relación manual opcional cuando hagamos un join client-side
  restaurant?: WA_Restaurant;
}

// =============================
// Helpers genéricos
// =============================
function ensureClient() {
  if (!webadminSupabase) {
    throw new Error('[WebAdminSupabase] Cliente no inicializado (variables de entorno faltantes)');
  }
  return webadminSupabase;
}

// Especiales activos directamente desde special_dishes (plantillas) cuando se usan sin activaciones separadas
export async function getActiveSpecialDishesDirect(options?: { onlyActive?: boolean; limit?: number }) {
  const client = ensureClient();
  let query = client.from('special_dishes').select('id,dish_name,dish_description,dish_price,is_active,restaurant_id,created_at').order('created_at', { ascending: false });
  if (options?.onlyActive) query = query.eq('is_active', true);
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];
  const restaurantIds = Array.from(new Set(rows.map(r => r.restaurant_id).filter(Boolean)));
  let restaurantMap = new Map<string, any>();
  if (restaurantIds.length) {
    const { data: restData, error: restErr } = await client
      .from('restaurants')
      .select('id,name,address,latitude,longitude,logo_url')
      .in('id', restaurantIds);
    if (!restErr && restData) {
      restaurantMap = new Map(restData.map(r => [r.id, r]));
    }
  }
  return rows.map(row => ({
    id: row.id,
    name: row.dish_name,
    description: row.dish_description,
    price: row.dish_price,
    type: 'special',
    restaurant_id: row.restaurant_id,
    is_active: row.is_active,
    created_at: row.created_at,
    restaurant: restaurantMap.get(row.restaurant_id) || undefined
  }));
}

// Detalle de un plato especial (plantilla) con items y restaurante opcional
export async function getSpecialDishDetailsDirect(id: string, options?: { includeItems?: boolean; includeRestaurant?: boolean }) {
  const client = ensureClient();
  const { data, error } = await client
    .from('special_dishes')
    .select('id,dish_name,dish_description,dish_price,is_active,restaurant_id,created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let selections: any[] = [];
  if (options?.includeItems) {
    const { data: selData } = await client
      .from('special_dish_selections')
      .select('category_name,product_name,selection_order')
      .eq('special_dish_id', id)
      .order('selection_order', { ascending: true });
    selections = selData || [];
  }
  let restaurant: any = null;
  if (options?.includeRestaurant && data.restaurant_id) {
    try {
      restaurant = await fetchRestaurantProgressive(data.restaurant_id);
    } catch (e:any) {
      if (__DEV__) console.log('[getSpecialDishDetailsDirect] fetchRestaurantProgressive error:', e.message || e);
    }
  }
  return {
    id: data.id,
    name: data.dish_name,
    description: data.dish_description,
    price: data.dish_price,
    is_active: data.is_active,
    restaurant_id: data.restaurant_id,
    created_at: data.created_at,
    items: selections,
    restaurant
  };
}

// Helper progresivo para obtener restaurante probando conjuntos de columnas.
export async function fetchRestaurantProgressive(id: string) {
  const client = ensureClient();
  const columnSets = [
    'id,name',
    'id,name,address,contact_phone,cuisine_type',
    'id,name,address,contact_phone,cuisine_type,status,setup_completed',
    'id,name,address,contact_phone,contact_email,cuisine_type,city,state,country',
    'id,name,address,contact_phone,contact_email,cuisine_type,city,state,country,business_hours,logo_url,latitude,longitude'
  ];
  let result: any = null;
  for (let i=0;i<columnSets.length;i++) {
    const cols = columnSets[i];
    try {
      const { data, error } = await client
        .from('restaurants')
        .select(cols)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        result = { ...(result || {}), ...data }; // merge incremental
        if (__DEV__) console.log(`[fetchRestaurantProgressive] Tier ${i+1} ok (${cols})`);
      }
    } catch (e:any) {
      if (__DEV__) console.log(`[fetchRestaurantProgressive] Tier ${i+1} fallo (${cols}):`, e.message || e);
      // continuar intentando con siguiente set (quizá columna inexistente)
      continue;
    }
  }
  if (!result && __DEV__) console.log('[fetchRestaurantProgressive] Ningún tier devolvió datos', { id });
  return result;
}

// =============================
// Consultas Directas (ajusta nombres de tabla / columnas si difieren)
// =============================

// Obtiene especiales del día con detección automática de la tabla
export async function getTodaySpecialsDirect(options?: { date?: string; includeRestaurant?: boolean; onlyActive?: boolean; preferRPC?: boolean }) {
  const client = ensureClient();
  const today = options?.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const envTable = process.env.EXPO_PUBLIC_WEBADMIN_SPECIALS_TABLE?.trim();
  // Tablas reales según documentación: special_dishes (plantillas), daily_special_activations (activaciones),
  // generated_special_combinations (combinaciones listas), además de fallback a env override.
  const candidateTables = envTable
    ? [envTable]
    : ['generated_special_combinations', 'daily_special_activations', 'special_dishes'];

  const preferRPC = options?.preferRPC ?? (process.env.EXPO_PUBLIC_WEBADMIN_SPECIALS_SOURCE === 'rpc');

  // 1. Intentar RPC documentada: get_available_specials_today()
  if (preferRPC) {
    try {
      const { data, error } = await (client as any).rpc('get_available_specials_today');
      if (error) throw error;
      if (Array.isArray(data)) {
        const mapped = data.map((row: any) => ({
          id: row.id || row.special_id || row.combination_id,
          name: row.name || row.dish_name || row.combination_name || 'Especial',
          description: row.description || row.dish_description || row.combination_description || '',
          price: row.price || row.dish_price || row.combination_price || 0,
          type: 'special',
          restaurant_id: row.restaurant_id,
          restaurant: row.restaurant ? {
            id: row.restaurant.id,
            name: row.restaurant.name,
            address: row.restaurant.address,
            latitude: row.restaurant.latitude,
            longitude: row.restaurant.longitude,
            logo_url: row.restaurant.logo_url,
          } : undefined,
          activation_date: row.activation_date || row.menu_date
        }));
        if (__DEV__) console.log('[WebAdminSupabase] Especiales vía RPC get_available_specials_today()', mapped.length);
        return mapped as WA_Special[];
      }
    } catch (e: any) {
      if (__DEV__) console.log('[WebAdminSupabase] RPC get_available_specials_today falló:', e.message || e);
    }
  }

  let lastError: any = null;
  for (const table of candidateTables) {
    // Atajo: si la tabla es special_dishes y queremos una lectura directa optimizada
    if (table === 'special_dishes') {
      try {
        const direct = await getActiveSpecialDishesDirect({ onlyActive: options?.onlyActive });
        if (__DEV__) console.log('[WebAdminSupabase] Especiales vía getActiveSpecialDishesDirect', direct.length);
        if (direct.length > 0) return direct as any;
        // si no hay resultados, seguimos con flujo genérico (por si otras tablas contienen activaciones)
      } catch (e: any) {
        if (__DEV__) console.log('[WebAdminSupabase] Falló getActiveSpecialDishesDirect:', e.message || e);
        // Continúa con flujo genérico
      }
    }
    try {
      let query = client.from(table).select('*');
      // Filtrar por fecha si la columna existe: hacemos un intento ligero
      // No hay introspección directa sin RLS, así que probamos agregando filtro y si da error capturamos
      // Estrategia: primero sin filtro para no fallar por columna inexistente, luego filtramos en memoria.
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      let rows = (data || []) as any[];

      // Filtrado en memoria por columnas posibles (según doc: menu_date, activation_date, available_today, is_active)
      const dateColumn = ['menu_date', 'activation_date', 'date', 'dia', 'day', 'special_date'].find(col => rows.length && rows[0].hasOwnProperty(col));
      if (dateColumn) {
        rows = rows.filter(r => (r[dateColumn] || '').startsWith(today));
      }
      if (options?.onlyActive) {
        const activeCol = ['is_active', 'active', 'available_today', 'habilitado', 'status'].find(col => rows.length && rows[0].hasOwnProperty(col));
        if (activeCol) rows = rows.filter(r => {
          const val = r[activeCol];
            if (activeCol === 'status') return ['active','activa'].includes(String(val).toLowerCase());
          return !!val;
        });
      }

      let specials = rows as WA_Special[];

      if (options?.includeRestaurant && specials.length) {
        const restaurantIds = Array.from(new Set(specials.map(s => s.restaurant_id).filter(Boolean)));
        if (restaurantIds.length) {
          const { data: restData, error: restErr } = await client
            .from('restaurants')
            .select('id,name,cuisine_type,address,latitude,longitude,logo_url,description')
            .in('id', restaurantIds);
          if (!restErr && restData) {
            const map = new Map(restData.map(r => [r.id, r]));
            specials = specials.map(s => ({ ...s, restaurant: map.get(s.restaurant_id) as WA_Restaurant | undefined }));
          }
        }
      }
  if (__DEV__) console.log(`[WebAdminSupabase] Usando tabla candidata de especiales: ${table} (obtenidos ${specials.length})`);
      // Intento de map a shape WA_Special si faltan campos
      const mapped = specials.map((s: any) => ({
        id: s.id,
        name: s.name || s.dish_name || s.combination_name || 'Especial',
        description: s.description || s.dish_description || s.combination_description || '',
        price: s.price || s.dish_price || s.menu_price || s.combination_price || 0,
        type: s.type || (s.is_special ? 'special' : 'daily_menu'),
        restaurant_id: s.restaurant_id,
        restaurant: (s as any).restaurant,
        date: s[dateColumn || 'activation_date'] || today,
        active: s.is_active ?? s.active ?? s.available_today ?? true
      }));
  if (mapped.length > 0) return mapped as WA_Special[];
  // seguir probando siguientes tablas si este dataset está vacío
    } catch (err: any) {
      lastError = err;
      if (__DEV__) console.log(`[WebAdminSupabase] Falló tabla candidata "${table}":`, err.message || err);
      continue; // probar siguiente
    }
  }
  throw lastError || new Error('No se pudo obtener especiales (todas las tablas candidatas fallaron)');
}

export async function getRestaurantByIdDirect(id: string) {
  const client = ensureClient();
  const { data, error } = await client
    .from('restaurants')
    .select('id,name,cuisine_type,address,latitude,longitude,logo_url,description,created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as WA_Restaurant | null;
}

export async function getRestaurantSpecialsDirect(restaurantId: string, options?: { limit?: number; activeOnly?: boolean }) {
  const client = ensureClient();
  let query = client.from('specials').select('*').eq('restaurant_id', restaurantId);
  if (options?.activeOnly) query = query.eq('active', true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data as WA_Special[];
}

// Nearby restaurants directo (simple filtrado en cliente). Ajustar a RPC/geofiltro real si existe.
export async function getNearbyRestaurantsDirect(lat: number, lng: number, options?: { radiusKm?: number; limit?: number }) {
  const client = ensureClient();
  const { data, error } = await client
    .from('restaurants')
    .select('id,name,cuisine_type,address,latitude,longitude,logo_url,description,created_at')
    .limit(options?.limit || 200); // límite razonable
  if (error) throw error;
  const radius = options?.radiusKm ?? 10;
  const R = 6371; // km
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number')) return Infinity;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  const enriched = (data || []).map(r => ({
    ...r,
    distance: haversine(lat, lng, r.latitude as number, r.longitude as number)
  }))
  .filter(r => r.distance <= radius)
  .sort((a,b) => a.distance - b.distance)
  .slice(0, options?.limit || 50);
  return enriched as (WA_Restaurant & { distance: number })[];
}

// =============================
// (Opcional) Invalidar sesión secundaria
// =============================
export async function signOutWebAdmin() {
  const client = ensureClient();
  await client.auth.signOut();
}

// =============================
// Menú del día (generated_combinations + daily_menus)
// =============================
export interface WA_TodayMenuCombination {
  id?: string; // si existe
  combination_name: string;
  combination_description?: string | null;
  combination_price: number;
  is_available: boolean;
  menu_date: string; // YYYY-MM-DD
  daily_menu_id?: string;
  restaurant_id?: string; // si la tabla lo expone directamente o vía daily_menus
}

export interface WA_TodayMenuCombinationExpanded extends WA_TodayMenuCombination {
  entrada?: string | null;
  principio?: string | null;
  proteina?: string | null;
  bebida?: string | null;
  // Lista de nombres de acompañamientos (si la tabla expone un array de IDs "acompanamiento_products")
  acompanamientos?: string[];
}

// Nueva función: obtiene combinaciones incluyendo nombres de productos (entrada, principio, proteína, bebida)
export async function getTodayMenuCombinationsExpandedDirect(options?: { restaurantId?: string }) {
  const client = ensureClient();
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();
  const today = localISO.slice(0,10);
  // Intento adelantado: realizar un SELECT directo con los mismos JOINs de la SQL proporcionada por el usuario.
  try {
    let joinQuery = client.from('generated_combinations').select(`
      id,combination_name,combination_price,is_available,daily_menu_id,acompanamiento_products,
      daily_menus!inner(menu_date,restaurant_id),
      entrada:entrada_product_id (id,name),
      principio:principio_product_id (id,name),
      proteina:proteina_product_id (id,name),
      bebida:bebida_product_id (id,name)
    `).eq('is_available', true).eq('daily_menus.menu_date', today);
    if (options?.restaurantId) joinQuery = joinQuery.eq('daily_menus.restaurant_id', options.restaurantId);
    const { data: joinRows, error: joinErr } = await joinQuery.order('combination_name', { ascending: true });
    if (!joinErr && joinRows && joinRows.length) {
      if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] JOIN directo estilo SQL usuario OK', joinRows.length);
      // Recolectar ids de acompañamientos para obtener nombres
      const acompIds = Array.from(new Set(joinRows.flatMap(r => Array.isArray(r.acompanamiento_products) ? r.acompanamiento_products : []).filter(Boolean).map((v:any)=>String(v))));
      let acompMap = new Map<string,string>();
      if (acompIds.length) {
        try {
          const { data: acompProducts } = await client.from('universal_products').select('id,name').in('id', acompIds);
          if (acompProducts) acompMap = new Map(acompProducts.map(p => [String(p.id), p.name]));
        } catch (e:any) { if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] error cargando acompañamientos', e.message || e); }
      }
      const mapped: WA_TodayMenuCombinationExpanded[] = joinRows.map(r => {
        const acompNames = (Array.isArray(r.acompanamiento_products) ? r.acompanamiento_products : []).map((id:any)=> acompMap.get(String(id)) || null).filter(Boolean) as string[];
        return {
          id: r.id,
          combination_name: r.combination_name,
          combination_price: r.combination_price || 0,
          is_available: !!r.is_available,
          menu_date: r.daily_menus?.menu_date || today,
          daily_menu_id: r.daily_menu_id,
          restaurant_id: r.daily_menus?.restaurant_id,
          entrada: r.entrada?.name || null,
          principio: r.principio?.name || null,
          proteina: r.proteina?.name || null,
          bebida: r.bebida?.name || null,
          acompanamientos: acompNames.length ? acompNames : undefined,
        };
      });
      // Si al menos ya tenemos nombres reales retornamos aquí (evitamos procesos extra)
      const haveAnyNames = mapped.some(m => m.entrada || m.principio || m.proteina || m.bebida);
      if (haveAnyNames) {
        if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Retornando resultados del JOIN directo.');
        return mapped;
      }
    } else if (joinErr && __DEV__) {
      console.log('[getTodayMenuCombinationsExpandedDirect] JOIN directo falló, continuando con fallback:', joinErr.message || joinErr);
    }
  } catch (e:any) {
    if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Excepción en JOIN directo, usando fallback progresivo:', e.message || e);
  }
  // Paso 1: daily_menus de hoy
  let dmQuery = client.from('daily_menus').select('id,menu_date,restaurant_id').eq('menu_date', today);
  if (options?.restaurantId) dmQuery = dmQuery.eq('restaurant_id', options.restaurantId);
  const { data: menus, error: dmErr } = await dmQuery;
  if (dmErr) throw dmErr;
  const menuIds = (menus || []).map(m => m.id);
  if (!menuIds.length) return [] as WA_TodayMenuCombinationExpanded[];
  const menuMap = new Map<string, { id: string; menu_date: string; restaurant_id?: string }>(
    menuIds.map(id => {
      const m = (menus || []).find(mm => mm.id === id) as { id: string; menu_date: string; restaurant_id?: string } | undefined;
      return [id, m as any];
    })
  );
  // Paso 2: generated_combinations (incluir ids de productos)
  // Intentamos incluir el campo array "acompanamiento_products" si existe junto a los ids esperados.
  // Más adelante intentaremos detectar nombres alternativos si vienen null.
  let gcSelectBase = 'id,combination_name,combination_price,is_available,daily_menu_id,entrada_product_id,principio_product_id,proteina_product_id,bebida_product_id,acompanamiento_products';
  let combos: any[] | null = null;
  let gcErr: any = null;
  try {
    const { data, error } = await client
      .from('generated_combinations')
      .select(gcSelectBase)
      .in('daily_menu_id', menuIds)
      .eq('is_available', true)
      .order('combination_name', { ascending: true });
    if (error) throw error;
    combos = data || [];
  } catch (e: any) {
    gcErr = e;
    if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] fallo select con acompanamiento_products, reintentando sin ese campo:', e.message || e);
    const { data, error } = await client
      .from('generated_combinations')
      .select('id,combination_name,combination_price,is_available,daily_menu_id,entrada_product_id,principio_product_id,proteina_product_id,bebida_product_id')
      .in('daily_menu_id', menuIds)
      .eq('is_available', true)
      .order('combination_name', { ascending: true });
    if (error) throw error;
    combos = data || [];
  }
  if (gcErr && !combos) throw gcErr;
  if (!combos || !combos.length) return [] as WA_TodayMenuCombinationExpanded[];
  // Si todos los nombres clave vienen null, intentar un segundo fetch con joins anidados (si existen FKs declarados)
  const needsJoinNames = combos.every(c => !c.entrada_product_id && !c.principio_product_id && !c.proteina_product_id && !c.bebida_product_id);
  if (needsJoinNames) {
    const joinSelectCandidates = [
      'id,combination_name,combination_price,is_available,daily_menu_id,acompanamiento_products,entrada:entrada_product_id (id,name),principio:principio_product_id (id,name),proteina:proteina_product_id (id,name),bebida:bebida_product_id (id,name)',
      // Posibles nombres de FK explícitos
      'id,combination_name,combination_price,is_available,daily_menu_id,acompanamiento_products,entrada:universal_products!generated_combinations_entrada_product_id_fkey(id,name),principio:universal_products!generated_combinations_principio_product_id_fkey(id,name),proteina:universal_products!generated_combinations_proteina_product_id_fkey(id,name),bebida:universal_products!generated_combinations_bebida_product_id_fkey(id,name)'
    ];
    for (const sel of joinSelectCandidates) {
      try {
        const { data: joinData, error: joinErr } = await client
          .from('generated_combinations')
          .select(sel)
          .in('daily_menu_id', menuIds)
          .eq('is_available', true)
          .order('combination_name', { ascending: true });
        if (joinErr) throw joinErr;
        if (joinData && joinData.length) {
          if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Fetch con joins exitoso usando select:', sel);
          // Mapear a formato esperado (inyectamos *_product_id para pipeline posterior)
          combos.forEach((c:any, idx:number) => {
            const jd:any = joinData.find((j:any)=> j.id === c.id) || joinData[idx];
            if (jd?.entrada?.name) c._entrada_name = jd.entrada.name;
            if (jd?.principio?.name) c._principio_name = jd.principio.name;
            if (jd?.proteina?.name) c._proteina_name = jd.proteina.name;
            if (jd?.bebida?.name) c._bebida_name = jd.bebida.name;
          });
          break; // no probar otros selects
        }
      } catch (e:any) {
        if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Falló select joins', sel, e.message || e);
        continue;
      }
    }
  }
  // Paso 3: recolectar product ids
  // Detectar si todos los campos esperados vinieron null para probar nombres alternativos
  const allNullPrimary = combos.every(c => !c.entrada_product_id && !c.principio_product_id && !c.proteina_product_id && !c.bebida_product_id);
  if (allNullPrimary && __DEV__) {
    console.log('[getTodayMenuCombinationsExpandedDirect] Todos los *_product_id vienen null. Intentando detectar columnas alternativas. Keys ejemplo:', Object.keys(combos[0] || {}));
  }

  // Fallback extremo: intentar select('*') para introspección si seguimos sin datos de nombres después de joins
  if (needsJoinNames) {
    try {
      const { data: starData, error: starErr } = await client
        .from('generated_combinations')
        .select('*')
        .in('daily_menu_id', menuIds)
        .eq('is_available', true)
        .order('combination_name', { ascending: true });
      if (!starErr && starData && starData.length) {
        if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] select * fallback ok. Example keys:', Object.keys(starData[0]||{}));
        // Fusionar propiedades adicionales en combos base
        const comboMap = new Map<string, any>(combos.map(c => [c.id, c]));
        starData.forEach((row:any) => {
          const target = comboMap.get(row.id);
          if (target) Object.assign(target, row);
        });
      }
    } catch (e:any) {
      if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] select * fallback error', e.message || e);
    }
  }

  // Función helper para extraer posible id dada una fila y lista de candidatos
  function extractId(row: any, candidates: string[]): string | undefined {
    for (const key of candidates) {
      if (row[key]) return row[key];
    }
    return undefined;
  }

  const altEntradaKeys = ['entrada_id','entrada','entrada_product','entrada_prod_id'];
  const altPrincipioKeys = ['principio_id','principio','base_id','base_product_id','base'];
  const altProteinaKeys = ['proteina_id','proteina','protein_id','protein_product_id'];
  const altBebidaKeys = ['bebida_id','bebida','drink_id','drink_product_id','bebida_product'];
  const altAcompanamientoArrayKeys = ['acompanamientos','acompanamiento','acompanamiento_ids','acompaniamiento_products','acompaniamientos_products','side_products','side_product_ids'];
  const altAcompanamientoTextKeys = ['acompanamientos_text','acompanamiento_text','sides_text'];

  // Construir lista de ids candidata incluyendo alternativas
  const productIds = Array.from(new Set((combos.flatMap(c => {
    const entradaIdRaw = c.entrada_product_id || extractId(c, altEntradaKeys);
    const principioIdRaw = c.principio_product_id || extractId(c, altPrincipioKeys);
    const proteinaIdRaw = c.proteina_product_id || extractId(c, altProteinaKeys);
    const bebidaIdRaw = c.bebida_product_id || extractId(c, altBebidaKeys);
    let acompList: any[] = [];
    if (Array.isArray(c.acompanamiento_products)) acompList = c.acompanamiento_products;
    else {
      const altArrayKey = altAcompanamientoArrayKeys.find(k => Array.isArray(c[k]));
      if (altArrayKey) acompList = c[altArrayKey];
      else {
        const altTextKey = altAcompanamientoTextKeys.find(k => typeof c[k] === 'string');
        if (altTextKey) {
          acompList = (c[altTextKey] as string).split(',').map((s:string)=>s.trim()).filter(Boolean);
        }
      }
    }
    const entradaId = entradaIdRaw ? String(entradaIdRaw) : undefined;
    const principioId = principioIdRaw ? String(principioIdRaw) : undefined;
    const proteinaId = proteinaIdRaw ? String(proteinaIdRaw) : undefined;
    const bebidaId = bebidaIdRaw ? String(bebidaIdRaw) : undefined;
    const acompStr = acompList.map(v => String(v));
    return [entradaId, principioId, proteinaId, bebidaId, ...acompStr];
  }) as string[]).filter(Boolean)));
  let productMap = new Map<string,string>();
  if (productIds.length) {
    const { data: products, error: prodErr } = await client.from('universal_products').select('id,name').in('id', productIds);
    if (!prodErr && products) productMap = new Map(products.map(p => [p.id, p.name]));
  }
  // Paso 4: map final
  let mapped: WA_TodayMenuCombinationExpanded[] = combos.map(c => {
    // Extraer alternativos si los principales son null
  const entradaId = (c.entrada_product_id || extractId(c, altEntradaKeys)) ? String(c.entrada_product_id || extractId(c, altEntradaKeys)) : undefined;
  const principioId = (c.principio_product_id || extractId(c, altPrincipioKeys)) ? String(c.principio_product_id || extractId(c, altPrincipioKeys)) : undefined;
  const proteinaId = (c.proteina_product_id || extractId(c, altProteinaKeys)) ? String(c.proteina_product_id || extractId(c, altProteinaKeys)) : undefined;
  const bebidaId = (c.bebida_product_id || extractId(c, altBebidaKeys)) ? String(c.bebida_product_id || extractId(c, altBebidaKeys)) : undefined;
    let acompIds: string[] = [];
    if (Array.isArray(c.acompanamiento_products)) acompIds = c.acompanamiento_products;
    else {
      const altArrayKey = altAcompanamientoArrayKeys.find(k => Array.isArray(c[k]));
      if (altArrayKey) acompIds = c[altArrayKey];
      else {
        const altTextKey = altAcompanamientoTextKeys.find(k => typeof c[k] === 'string');
        if (altTextKey) acompIds = (c[altTextKey] as string).split(',').map((s:string)=>s.trim()).filter(Boolean);
      }
    }
    // Heurística para nombres directos en columnas (ej: entrada_nombre, bebida_name, etc.)
    const directNameKeys = Object.keys(c);
    function findDirectName(prefixes: string[]): string | undefined {
      const key = directNameKeys.find(k => prefixes.some(p => k.toLowerCase().startsWith(p)) && typeof c[k] === 'string');
      return key ? c[key] : undefined;
    }
    const directEntrada = findDirectName(['entrada_nombre','entrada_name']);
    const directPrincipio = findDirectName(['principio_nombre','principio_name','base_nombre','base_name']);
    const directProteina = findDirectName(['proteina_nombre','proteina_name','protein_nombre','protein_name']);
    const directBebida = findDirectName(['bebida_nombre','bebida_name','drink_nombre','drink_name']);
    return {
      id: c.id,
      combination_name: c.combination_name,
      combination_price: c.combination_price || 0,
      is_available: !!c.is_available,
      menu_date: menuMap.get(c.daily_menu_id)?.menu_date || today,
      daily_menu_id: c.daily_menu_id,
      restaurant_id: menuMap.get(c.daily_menu_id)?.restaurant_id,
      entrada: directEntrada || c._entrada_name || (entradaId ? (productMap.get(entradaId) || null) : null),
      principio: directPrincipio || c._principio_name || (principioId ? (productMap.get(principioId) || null) : null),
      proteina: directProteina || c._proteina_name || (proteinaId ? (productMap.get(proteinaId) || null) : null),
      bebida: directBebida || c._bebida_name || (bebidaId ? (productMap.get(bebidaId) || null) : null),
      acompanamientos: acompIds.length ? acompIds.map(id => productMap.get(id)).filter(Boolean) as string[] : undefined,
    };
  });
  if (__DEV__) {
    const debugMissing = mapped.filter(m => !m.entrada || !m.principio || !m.proteina || !m.bebida).slice(0,3);
    if (debugMissing.length) console.log('[getTodayMenuCombinationsExpandedDirect] IDs presentes pero faltan nombres para algunos combos (mostrar sample)', debugMissing);
  }
  if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] mapped combos', mapped.length, mapped.slice(0,3));

  // Fallback adicional: si la mayoría de combos siguen sin nombres (entrada/principio/proteína/bebida vacíos) intentar leer tablas de items/componentes
  const unresolvedRatio = mapped.length ? mapped.filter(m => !m.entrada && !m.principio && !m.proteina && !m.bebida).length / mapped.length : 0;
  if (unresolvedRatio > 0.6) {
    if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Alta proporción sin componentes directos, intentando tablas de items');
    const client2 = client;
    const comboIds = mapped.map(m => m.id).filter(Boolean) as string[];
    const candidateItemTables = [
      'combination_items',
      'combination_components',
      'generated_combination_items',
      'generated_combination_products'
    ];
    interface RawItem { id?: string; combination_id?: string; product_id?: string; category?: string; category_name?: string; type?: string; product_name?: string; name?: string; }
    let rawItems: RawItem[] = [];
    for (const tbl of candidateItemTables) {
      try {
        const { data, error } = await client2
          .from(tbl as any)
          .select('id,combination_id,product_id,category,category_name,type,product_name,name')
          .in('combination_id', comboIds);
        if (error) throw error;
        if (data && data.length) {
          rawItems = data as any[];
          if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Tabla de items encontrada:', tbl, 'items=', rawItems.length);
          break;
        }
      } catch (e:any) {
        if (__DEV__) console.log('[getTodayMenuCombinationsExpandedDirect] Tabla', tbl, 'no disponible o sin datos:', e.message || e);
        continue;
      }
    }
    if (rawItems.length) {
      // Obtener nombres de productos faltantes
      const prodIdsFromItems = Array.from(new Set(rawItems.map(r => r.product_id).filter(Boolean))) as string[];
      const missingIds = prodIdsFromItems.filter(id => !productMap.has(id));
      if (missingIds.length) {
        try {
          const { data: prodData } = await client2.from('universal_products').select('id,name').in('id', missingIds);
          if (prodData) prodData.forEach(p => productMap.set(p.id, p.name));
        } catch {}
      }
      // Index items por combo
      const byCombo = new Map<string, RawItem[]>();
      rawItems.forEach(it => {
        const cid = it.combination_id;
        if (!cid) return;
        if (!byCombo.has(cid)) byCombo.set(cid, []);
        byCombo.get(cid)!.push(it);
      });
      function normCat(v?: string) {
        if (!v) return '';
        return v.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
      }
      mapped = mapped.map(m => {
        if (m.entrada || m.principio || m.proteina || m.bebida) return m; // ya resuelto parcialmente
        const items = byCombo.get(m.id || '') || [];
        if (!items.length) return m;
        let entrada = m.entrada; let principio = m.principio; let proteina = m.proteina; let bebida = m.bebida; const acomp: string[] = m.acompanamientos ? [...m.acompanamientos] : [];
        items.forEach(it => {
          const cat = normCat(it.category || it.category_name || it.type);
          const prodName = it.product_name || it.name || (it.product_id ? productMap.get(it.product_id) : undefined);
          if (!prodName) return;
            if (!entrada && /entrada|starter/.test(cat)) entrada = prodName;
            else if (!principio && /principio|base|grano|carbo/.test(cat)) principio = prodName;
            else if (!proteina && /proteina|protein|carne|pollo|res|cerdo|pescado/.test(cat)) proteina = prodName;
            else if (!bebida && /bebida|drink|jugo|refresco|gaseosa/.test(cat)) bebida = prodName;
            else if (/acomp|guarnicion|side/.test(cat)) acomp.push(prodName);
        });
        return { ...m, entrada, principio, proteina, bebida, acompanamientos: acomp.length ? acomp : m.acompanamientos };
      });
    } else if (__DEV__) {
      console.log('[getTodayMenuCombinationsExpandedDirect] No se encontraron tablas de items para resolver componentes.');
    }
  }
  if (__DEV__) {
    const sample = mapped.slice(0,3).map(m => ({ nombre: m.combination_name, entrada: m.entrada, principio: m.principio, proteina: m.proteina, bebida: m.bebida, acomp: m.acompanamientos }));
    console.log('[getTodayMenuCombinationsExpandedDirect] Resultado final tras fallback items:', sample);
  }
  return mapped;
}

// Obtiene las combinaciones disponibles hoy. Intenta filtrar por restaurantId si la columna existe
export async function getTodayMenuCombinationsDirect(options?: { restaurantId?: string }) {
  const client = ensureClient();
  // Usar fecha local (no UTC) para coincidir con CURRENT_DATE del backend
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();
  const today = localISO.slice(0,10); // YYYY-MM-DD fecha local
  const utcToday = new Date().toISOString().slice(0,10);
  const dateCandidates = Array.from(new Set([today, utcToday]));

  // Estrategia:
  // 1. Intentar join directo si la relación existe (Supabase genera notación daily_menus!inner(...))
  // 2. Si falla, hacer dos pasos: obtener daily_menus de hoy y luego generated_combinations in (...)
  // 3. Filtrar por restaurantId si podemos detectar la columna en combos o menús
  let lastError: any = null;
  let rows: any[] = [];
  // Intento 1: join directo (probar fechas candidatas)
  for (const dateCandidate of dateCandidates) {
    try {
      let sel = 'id,combination_name,combination_description,combination_price,is_available,daily_menu_id,daily_menus!inner(menu_date,restaurant_id)';
      let query = client.from('generated_combinations').select(sel).eq('is_available', true).eq('daily_menus.menu_date', dateCandidate);
      if (options?.restaurantId) query = query.eq('daily_menus.restaurant_id', options.restaurantId);
      const { data, error } = await query.order('combination_name', { ascending: true });
      if (error) throw error;
      rows = data || [];
      if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Join directo', { dateCandidate, count: rows.length });
      if (rows.length) {
        const mapped: WA_TodayMenuCombination[] = rows.map(r => ({
          id: r.id,
          combination_name: r.combination_name,
          combination_description: r.combination_description,
          combination_price: r.combination_price || 0,
          is_available: !!r.is_available,
          menu_date: r.daily_menus?.menu_date || dateCandidate,
          daily_menu_id: r.daily_menu_id,
          restaurant_id: r.daily_menus?.restaurant_id || r.restaurant_id
        }));
        const avail = mapped.filter(m => m.is_available);
        if (avail.length > 0) return avail;
      }
    } catch (e:any) {
      lastError = e;
      if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Join directo fecha', dateCandidate, 'falló:', e.message || e);
    }
  }
  if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Join directo sin resultados en fechas candidatas');

  // Intento 2: dos pasos
  try {
    // Paso A: obtener daily_menus de hoy
    let todayMenus: any[] = [];
    for (const dateCandidate of dateCandidates) {
      let dmQuery = client.from('daily_menus').select('id,menu_date,restaurant_id').eq('menu_date', dateCandidate);
      if (options?.restaurantId) dmQuery = dmQuery.eq('restaurant_id', options.restaurantId);
      const { data: menus, error: dmErr } = await dmQuery;
      if (dmErr) throw dmErr;
      if (menus && menus.length) {
        todayMenus = menus;
        if (__DEV__) console.log('[getTodayMenuCombinationsDirect] daily_menus encontrados', { dateCandidate, count: menus.length });
        break;
      }
    }
    const menuIds = todayMenus.map(m => m.id);
    if (menuIds.length === 0) return [];
    // Paso B: obtener generated_combinations para esos daily_menu_id
    let gcQuery = client.from('generated_combinations').select('id,combination_name,combination_description,combination_price,is_available,daily_menu_id');
    gcQuery = gcQuery.in('daily_menu_id', menuIds).eq('is_available', true);
    const { data: combos, error: gcErr } = await gcQuery.order('combination_name', { ascending: true });
    if (gcErr) throw gcErr;
  const menuMap = new Map<string, { id: string; menu_date: string; restaurant_id?: string }>(todayMenus.map(m => [m.id, m as { id: string; menu_date: string; restaurant_id?: string }]));
    const mapped: WA_TodayMenuCombination[] = (combos || []).map(c => ({
      id: c.id,
      combination_name: c.combination_name,
      combination_description: c.combination_description,
      combination_price: c.combination_price || 0,
      is_available: !!c.is_available,
      menu_date: menuMap.get(c.daily_menu_id)?.menu_date || today,
      daily_menu_id: c.daily_menu_id,
      restaurant_id: menuMap.get(c.daily_menu_id)?.restaurant_id
    }));
  if (mapped.length > 0) return mapped.filter(m => m.is_available);
    // Fallback final: intentar SIN filtrar por restaurantId si se especificó y no hubo resultados
    if (options?.restaurantId) {
      if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Sin combos filtrando por restaurante, probando sin filtro');
      return await getTodayMenuCombinationsDirect({ restaurantId: undefined });
    }
    return mapped;
  } catch (e:any) {
    lastError = e;
    if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Estrategia dos pasos falló:', e.message || e);
  }

  // Intento 3: lectura directa sin fecha (último recurso)
  try {
    const { data: raw, error: rawErr } = await client
      .from('generated_combinations')
      .select('id,combination_name,combination_description,combination_price,is_available,daily_menu_id')
      .eq('is_available', true)
      .order('combination_name', { ascending: true });
    if (rawErr) throw rawErr;
    if (raw && raw.length) {
      if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Fallback crudo sin fecha', raw.length);
      // Intento 3a: cruzar manualmente con daily_menus para filtrar por fecha si hay data
      try {
        const dmIds = Array.from(new Set(raw.map(r => r.daily_menu_id).filter(Boolean)));
        if (dmIds.length) {
          const { data: dmData, error: dmErr } = await client.from('daily_menus').select('id,menu_date,restaurant_id').in('id', dmIds);
          if (!dmErr && dmData) {
            const dmMap = new Map<string, { id: string; menu_date: string; restaurant_id?: string }>(dmData.map(d => [d.id, d as { id: string; menu_date: string; restaurant_id?: string }]));
            const filtered = raw.filter(r => {
              const dm = dmMap.get(r.daily_menu_id);
              return !!dm && dateCandidates.includes(dm.menu_date);
            });
            if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Fallback crudo filtrado por daily_menus', { total: raw.length, filtered: filtered.length });
            if (filtered.length) {
              return filtered.map(r => ({
                id: r.id,
                combination_name: r.combination_name,
                combination_description: r.combination_description,
                combination_price: r.combination_price || 0,
                is_available: !!r.is_available,
                menu_date: dmMap.get(r.daily_menu_id)?.menu_date || today,
                daily_menu_id: r.daily_menu_id,
                restaurant_id: dmMap.get(r.daily_menu_id)?.restaurant_id
              }));
            }
          }
        }
      } catch (e:any) {
        if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Error en cruce manual daily_menus:', e.message || e);
      }
      return raw.map(r => ({
        id: r.id,
        combination_name: r.combination_name,
        combination_description: r.combination_description,
        combination_price: r.combination_price || 0,
        is_available: !!r.is_available,
        menu_date: today,
        daily_menu_id: r.daily_menu_id
      }));
    }
  } catch (e:any) {
    if (__DEV__) console.log('[getTodayMenuCombinationsDirect] Fallback crudo falló', e.message || e);
  }

  throw lastError || new Error('No se pudo obtener el menú del día');
}

// =============================
// Notas de seguridad / RLS
// =============================
// 1. Asegúrate de que las políticas RLS en el proyecto WebAdmin permitan SELECT para tablas públicas
//    (specials, restaurants) a rol "anon" si deseas exponerlas.
// 2. Si requieren auth, deberás implementar login separado (email+password o magic link) usando client.auth.
// 3. No mezclar keys: cada proyecto Supabase (móvil vs webadmin) debe tener su propio anon public key aquí.

