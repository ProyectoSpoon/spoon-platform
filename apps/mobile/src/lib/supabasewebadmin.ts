// src/lib/supabasewebadmin.ts
// ========================================
// SPOON MOBILE - WEBADMIN API CLIENT
// Archivo único para toda la comunicación con el webadmin
// ========================================

// ========================================
// CONFIGURACIÓN Y TIPOS
// ========================================

import { Platform } from 'react-native';
import { getTodaySpecialsDirect, getNearbyRestaurantsDirect } from './webadminSupabase';
// @ts-ignore - expo-constants puede no tener tipos exactos según versión
import Constants from 'expo-constants';

const RAW_WEBADMIN_API_BASE = process.env.EXPO_PUBLIC_WEBADMIN_API || 'http://localhost:3000';
let cachedResolvedBase: string | null = null;
let warnedLocalhost = false;

function resolveWebAdminBase(): string {
  if (cachedResolvedBase) return cachedResolvedBase;
  let base = RAW_WEBADMIN_API_BASE;
  // Si está apuntando a localhost y estamos en un dispositivo (no web / no simulador iOS en macOS desde Windows dev)
  if ((base.includes('localhost') || base.includes('127.0.0.1')) && Platform.OS !== 'web') {
    // Intentar deducir host de la URL de debug de Expo
    const hostCandidate: string | undefined = (Constants as any)?.expoConfig?.hostUri
      || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost
      || (Constants as any)?.manifest?.debuggerHost;
    if (hostCandidate) {
      const host = hostCandidate.split(':')[0];
      if (host && host.length && host !== 'localhost' && host !== '127.0.0.1') {
        const original = base;
        // Reemplazar host manteniendo puerto (si definido en base) o usar 3000 por defecto
        const portMatch = original.match(/:(\d+)(?:$|\/)/);
        const port = portMatch ? portMatch[1] : '3000';
        base = `http://${host}:${port}`;
        if (__DEV__) console.log(`[WebAdminAPI] Reemplazando base localhost -> ${base}`);
      }
    }
    if (!warnedLocalhost && base.includes('localhost')) {
      warnedLocalhost = true;
      console.warn('[WebAdminAPI] Usando localhost en un dispositivo; establece EXPO_PUBLIC_WEBADMIN_API con la IP LAN (ej: http://192.168.x.x:3000) para evitar fallos de red.');
    }
  }
  cachedResolvedBase = base;
  return base;
}

const WEBADMIN_API_BASE = resolveWebAdminBase();

// Interfaces para responses del WebAdmin
export interface ApiRestaurant {
  id: string;
  name: string;
  cuisine_type: string;
  latitude: number;
  longitude: number;
  address: string;
  contact_phone: string;
  business_hours: any;
  logo_url?: string;
  cover_image_url?: string;
  description?: string;
  distance?: number;
  isOpen?: boolean;
  owner_name?: string;
  location?: {
    country?: string;
    department?: string;
    city?: string;
  };
}

export interface ApiSpecial {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'special' | 'daily_menu';
  restaurant: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    logo_url?: string;
  };
  distance?: number;
}

export interface ApiSearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'special' | 'daily_menu';
  restaurant: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    logo_url?: string;
  };
  distance?: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
  color?: string;
  description?: string;
  display_order?: number;
}

// ========================================
// SISTEMA DE CACHE
// ========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia global de cache
const cache = new CacheService();

// Cache keys constants
export const CACHE_KEYS = {
  NEARBY_RESTAURANTS: (lat: number, lng: number) => `restaurants:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}`,
  RESTAURANT_DETAILS: (id: string) => `restaurant:details:${id}`,
  TODAYS_SPECIALS: (lat?: number, lng?: number) => 
    lat && lng ? `specials:today:${lat.toFixed(3)}:${lng.toFixed(3)}` : 'specials:today:all',
  SEARCH_RESULTS: (query: string, lat?: number, lng?: number) =>
    lat && lng ? `search:${query}:${lat.toFixed(3)}:${lng.toFixed(3)}` : `search:${query}:all`,
  CATEGORIES: 'categories:all'
};

// ========================================
// ERROR HANDLING
// ========================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Sin conexión a internet') {
    super(message);
    this.name = 'NetworkError';
  }
}

function handleAPIError(error: any): APIError | NetworkError {
  const isAbort = error?.name === 'AbortError' || /timeout/i.test(error?.message || '');
  const status = error?.status || error?.statusCode;
  const is404 = status === 404 || /404/.test(error?.message || '');
  const isNetwork = !error?.response && (error?.message?.includes('Network request failed') || error?.message?.includes('fetch'));
  if (isAbort) {
    if (__DEV__) console.log('⏱️ Abort/timeout (silencioso):', error?.message || error);
    return new NetworkError('Tiempo de espera agotado');
  }
  if (isNetwork) {
    if (__DEV__) console.log('🌐 Network issue (silencioso):', error?.message || error);
    return new NetworkError();
  }
  // Silenciar 404 para permitir fallbacks sin ruido
  if (is404) {
    if (__DEV__) console.log('🔍 404 (silencioso):', error?.message || 'Recurso no encontrado');
  } else {
    console.error('🚨 API Error:', error);
  }
  
  // Error de red
  // (ya manejado arriba isNetwork)
  
  // Error HTTP
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    const message = error.message || 'Error desconocido';
    
    switch (status) {
      case 404:
        return new APIError('No encontrado', status, error);
      case 500:
        return new APIError('Error interno del servidor', status, error);
      case 400:
        return new APIError('Solicitud inválida', status, error);
      case 429:
        return new APIError('Demasiadas solicitudes, intenta más tarde', status, error);
      default:
        return new APIError(message, status, error);
    }
  }
  
  // Error genérico
  return new APIError(error.message || 'Error desconocido', undefined, error);
}

// ========================================
// UTILIDADES HELPER
// ========================================

// Calcular distancia usando fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Verificar si restaurante está abierto
function checkIfRestaurantIsOpen(businessHours: any): boolean {
  if (!businessHours) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde medianoche
  
  const todayHours = businessHours[currentDay];
  if (!todayHours || !todayHours.open || !todayHours.close) return false;
  
  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

// Formatear precio en pesos colombianos
export function formatPrice(centavos: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(centavos);
}

// ========================================
// CLASE PRINCIPAL DE API
// ========================================

export class WebAdminAPI {
  // Getter dinámico para soportar hot reload si cambia env (solo dev)
  private static get baseUrl() { return cachedResolvedBase || resolveWebAdminBase(); }
  
  // ========================================
  // RESTAURANTES CERCANOS
  // ========================================
  
  static async getNearbyRestaurants(params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }): Promise<ApiRestaurant[]> {
    // Guard si no hay base URL configurada: usar acceso directo
    const baseConfigured = !!RAW_WEBADMIN_API_BASE && !RAW_WEBADMIN_API_BASE.endsWith('localhost:3000');
    if (!baseConfigured) {
      console.log('[WebAdminAPI] Base URL no configurada (o localhost). Usando getNearbyRestaurantsDirect()');
      const direct = await getNearbyRestaurantsDirect(params.lat, params.lng, { radiusKm: params.radius, limit: params.limit });
      // Adaptar shape al esperado (añadir isOpen simple = true por defecto)
      return direct.map(r => ({
        id: r.id,
        name: r.name,
        cuisine_type: r.cuisine_type || '',
        latitude: r.latitude as number,
        longitude: r.longitude as number,
        address: r.address || '',
        contact_phone: '',
        business_hours: null,
        logo_url: r.logo_url,
        cover_image_url: undefined,
        description: r.description,
        distance: r.distance,
        isOpen: true
      }));
    }
    const cacheKey = CACHE_KEYS.NEARBY_RESTAURANTS(params.lat, params.lng);
    
    // Try cache first
    const cached = cache.get<ApiRestaurant[]>(cacheKey);
    if (cached) {
      console.log('📦 Using cached nearby restaurants');
      return cached;
    }
    
    try {
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radius: (params.radius || 10).toString(),
        limit: (params.limit || 20).toString()
      });
      
      console.log(`🌐 Fetching nearby restaurants: ${this.baseUrl}/api/mobile/restaurants/nearby?${searchParams}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `${this.baseUrl}/api/mobile/restaurants/nearby?${searchParams}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let body: any = null;
        try { body = await response.text(); } catch {}
        console.error('❌ Specials response not ok', response.status, body);
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const result = await response.json().catch(e => {
        console.error('❌ Error parsing specials JSON', e);
        throw new APIError('Formato de respuesta inválido', 500);
      });
      
      if (!result.success) {
        throw new APIError(result.error || 'Error desconocido');
      }
      
      // Cache for 2 minutes (restaurants don't change frequently)
      cache.set(cacheKey, result.data, 2 * 60 * 1000);
      
      console.log(`✅ Fetched ${result.data.length} nearby restaurants`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching nearby restaurants:', error);
      throw handleAPIError(error);
    }
  }
  
  // ========================================
  // DETALLE DE RESTAURANTE
  // ========================================
  
  static async getRestaurantDetails(restaurantId: string): Promise<ApiRestaurant> {
    const cacheKey = CACHE_KEYS.RESTAURANT_DETAILS(restaurantId);
    
    // Try cache first
    const cached = cache.get<ApiRestaurant>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached restaurant details for ${restaurantId}`);
      return cached;
    }
    
    try {
      console.log(`🌐 Fetching restaurant details: ${restaurantId}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${this.baseUrl}/api/mobile/restaurants/${restaurantId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new APIError('Restaurante no encontrado', 404);
        }
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Restaurante no encontrado');
      }
      
      // Process business hours to add isOpen status
      const restaurantData = {
        ...result.data,
        isOpen: checkIfRestaurantIsOpen(result.data.business_hours)
      };
      
      // Cache for 10 minutes
      cache.set(cacheKey, restaurantData, 10 * 60 * 1000);
      
      console.log(`✅ Fetched restaurant details: ${restaurantData.name}`);
      return restaurantData;
      
    } catch (error: any) {
      const msg = String(error?.message || '');
      const aborted = error?.name === 'AbortError' || /abort|tiempo de espera|timeout/i.test(msg);
      const status = error?.status || error?.statusCode;
      if (aborted) {
        if (__DEV__) console.log(`⏱️ Abort/timeout silencioso restaurant ${restaurantId}:`, msg);
      } else if (status === 404) {
        if (__DEV__) console.log(`🔍 404 detalle restaurante (silencioso): ${restaurantId}`);
      } else {
        console.error(`❌ Error fetching restaurant details for ${restaurantId}:`, error);
      }
      throw handleAPIError(error);
    }
  }
  
  // ========================================
  // ESPECIALIDADES DEL DÍA
  // ========================================
  
  static async getTodaysSpecials(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    limit?: number;
  }): Promise<ApiSpecial[]> {
    const baseConfigured = !!RAW_WEBADMIN_API_BASE && !RAW_WEBADMIN_API_BASE.endsWith('localhost:3000');
    if (!baseConfigured) {
      console.log('[WebAdminAPI] Base URL no configurada (o localhost). Usando getTodaySpecialsDirect()');
      const direct = await getTodaySpecialsDirect({ includeRestaurant: true, onlyActive: true });
      return direct.map((s: any) => ({
        id: s.id,
        name: s.name || s.nombre,
        description: s.description || s.descripcion || '',
        price: s.price,
        type: s.type || 'special',
        restaurant: {
          id: s.restaurant?.id || s.restaurant_id,
          name: s.restaurant?.name || 'Restaurante',
          address: s.restaurant?.address || '',
          latitude: s.restaurant?.latitude || 0,
          longitude: s.restaurant?.longitude || 0,
          logo_url: s.restaurant?.logo_url
        }
      }));
    }
    const cacheKey = CACHE_KEYS.TODAYS_SPECIALS(params?.lat, params?.lng);
    
    // Try cache first
    const cached = cache.get<ApiSpecial[]>(cacheKey);
    if (cached) {
      console.log('📦 Using cached today specials');
      return cached;
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.lat) searchParams.set('lat', params.lat.toString());
      if (params?.lng) searchParams.set('lng', params.lng.toString());
      if (params?.radius) searchParams.set('radius', params.radius.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      
      console.log(`🌐 Fetching today's specials`, {
        url: `${this.baseUrl}/api/mobile/specials/today` ,
        params: Object.fromEntries(searchParams.entries())
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
      
      const response = await fetch(
        `${this.baseUrl}/api/mobile/specials/today?${searchParams}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Error obteniendo especiales');
      }
      
      // Cache for 5 minutes (specials can change during day)
      cache.set(cacheKey, result.data, 5 * 60 * 1000);
      
      console.log(`✅ Fetched ${result.data.length} today's specials`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching today specials:', error);
      throw handleAPIError(error);
    }
  }
  
  // ========================================
  // BÚSQUEDA EN MENÚS
  // ========================================
  
  static async searchMenu(params: {
    query: string;
    lat?: number;
    lng?: number;
    radius?: number;
    limit?: number;
  }): Promise<ApiSearchResult[]> {
    const cacheKey = CACHE_KEYS.SEARCH_RESULTS(params.query, params.lat, params.lng);
    
    // Try cache first for exact same search
    const cached = cache.get<ApiSearchResult[]>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached search results for: ${params.query}`);
      return cached;
    }
    
    try {
      if (!params.query || params.query.length < 2) {
        throw new APIError('Query debe tener al menos 2 caracteres', 400);
      }
      
      const searchParams = new URLSearchParams({
        query: params.query
      });
      
      if (params.lat) searchParams.set('lat', params.lat.toString());
      if (params.lng) searchParams.set('lng', params.lng.toString());
      if (params.radius) searchParams.set('radius', params.radius.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      
      console.log(`🌐 Searching menu for: ${params.query}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for search
      
      const response = await fetch(
        `${this.baseUrl}/api/mobile/search/menu?${searchParams}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Error en búsqueda');
      }
      
      // Cache for 3 minutes (search results can be dynamic)
      cache.set(cacheKey, result.data, 3 * 60 * 1000);
      
      console.log(`✅ Found ${result.data.length} search results for: ${params.query}`);
      return result.data;
      
    } catch (error) {
      console.error(`❌ Error searching menu for "${params.query}":`, error);
      throw handleAPIError(error);
    }
  }
  
  // ========================================
  // CATEGORÍAS DE COMIDA
  // ========================================
  
  static async getCategories(): Promise<ApiCategory[]> {
    const cacheKey = CACHE_KEYS.CATEGORIES;
    
    // Try cache first
    const cached = cache.get<ApiCategory[]>(cacheKey);
    if (cached) {
      console.log('📦 Using cached categories');
      return cached;
    }
    
    try {
      console.log('🌐 Fetching categories');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `${this.baseUrl}/api/mobile/categories`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Error obteniendo categorías');
      }
      
      // Cache for 30 minutes (categories rarely change)
      cache.set(cacheKey, result.data, 30 * 60 * 1000);
      
      console.log(`✅ Fetched ${result.data.length} categories`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw handleAPIError(error);
    }
  }
  
  // ========================================
  // UTILIDADES DE CACHE
  // ========================================
  
  static clearCache(): void {
    cache.clear();
    console.log('🗑️ Cache cleared');
  }
  
  static invalidateRestaurantCache(restaurantId?: string): void {
    if (restaurantId) {
      cache.invalidate(CACHE_KEYS.RESTAURANT_DETAILS(restaurantId));
      cache.invalidatePattern(`restaurants:nearby`);
      cache.invalidatePattern(`specials:today`);
    } else {
      cache.invalidatePattern('restaurants');
      cache.invalidatePattern('specials');
    }
    console.log('🗑️ Restaurant cache invalidated');
  }
  
  static invalidateSearchCache(): void {
    cache.invalidatePattern('search:');
    console.log('🗑️ Search cache invalidated');
  }
  
  static getCacheStats() {
    return cache.getStats();
  }
  
  // ========================================
  // HEALTH CHECK
  // ========================================
  
  static async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const baseConfigured = !!RAW_WEBADMIN_API_BASE && !RAW_WEBADMIN_API_BASE.endsWith('localhost:3000');
      if (!baseConfigured) {
        // Intentar una pequeña consulta directa para validar conectividad Supabase
        try {
          await getTodaySpecialsDirect({ onlyActive: true });
          return { status: 'ok', message: 'Modo directo (API REST no configurada)' };
        } catch (e: any) {
          return { status: 'error', message: 'Modo directo falló: ' + (e?.message || 'sin detalles') };
        }
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return { status: 'error', message: `HTTP ${response.status}` };
      }
      
      return { status: 'ok', message: 'WebAdmin API is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message || 'Health check failed' };
    }
  }
}

// ========================================
// FUNCIONES DE CONVENIENCIA
// ========================================

// Para HomeScreen
export const obtenerRestaurantesCercanos = WebAdminAPI.getNearbyRestaurants;
export const obtenerEspecialidadesDelDia = WebAdminAPI.getTodaysSpecials;

// Para RestaurantDetailScreen  
export const obtenerDetalleRestaurante = WebAdminAPI.getRestaurantDetails;

// Para SearchScreen
export const buscarEnMenu = WebAdminAPI.searchMenu;
export const obtenerCategorias = WebAdminAPI.getCategories;

// Utilities
export const limpiarCache = WebAdminAPI.clearCache;
export const verificarSaludAPI = WebAdminAPI.healthCheck;

// ========================================
// CONFIGURACIÓN POR DEFECTO
// ========================================

export const WEBADMIN_CONFIG = {
  BASE_URL: WEBADMIN_API_BASE,
  DEFAULT_RADIUS: 10, // km
  DEFAULT_LIMIT: 20,
  DEFAULT_TIMEOUT: 10000, // ms
  CACHE_TIMES: {
    RESTAURANTS: 2 * 60 * 1000,      // 2 minutos
    RESTAURANT_DETAILS: 10 * 60 * 1000, // 10 minutos
    SPECIALS: 5 * 60 * 1000,         // 5 minutos
    SEARCH: 3 * 60 * 1000,           // 3 minutos
    CATEGORIES: 30 * 60 * 1000       // 30 minutos
  }
} as const;

// ========================================
// LOGGING Y DEBUG
// ========================================

export const DEBUG = {
  enableLogging: __DEV__,
  logAPIRequests: __DEV__,
  logCacheHits: __DEV__,
  
  log: (...args: any[]) => {
    if (DEBUG.enableLogging) {
      console.log('[WebAdmin API]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    console.error('[WebAdmin API Error]', ...args);
  }
};

// Export default para conveniencia
export default WebAdminAPI;

// ========================================
// TIPOS AUXILIARES PARA COMPONENTES
// ========================================

export type RestaurantForHomeScreen = {
  id: string;
  nombre: string;
  rating: string;
  reviewCount: number;
  distancia: string;
  categoria: string;
  direccion: string;
  telefono?: string;
  estaAbierto: boolean;
  horarios: any;
  imagen: string;
  isFavorite: boolean;
  latitude: number;
  longitude: number;
  description?: string;
};

export type SpecialForHomeScreen = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  restaurante: string;
  tipoPlato: 'special' | 'daily_menu';
  distancia?: string;
  imagen: string;
};

export type SearchResultForScreen = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  restaurante: string;
  tipoItem: 'special' | 'daily_menu';
  distancia?: string;
  imagen: string;
};

// ========================================
// REVIEWS API - AGREGAR AL FINAL
// ========================================
// Tipos de Reviews
export interface ApiReview {
  id: string;
  rating: number;
  comment: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface RestaurantStats {
  rating_average: number; // promedio global
  rating_count: number;   // cantidad de ratings válidos
  reviews_count: number;  // cantidad de reseñas (con o sin comentario)
  favorites_count: number; // favoritos (si el backend lo expone)
}

// Nuevas claves de cache para reviews (extensión)
(CACHE_KEYS as any).RESTAURANT_REVIEWS = (id: string, limit: number, offset: number) => `restaurant:reviews:${id}:${limit}:${offset}`;
(CACHE_KEYS as any).RESTAURANT_STATS = (id: string) => `restaurant:stats:${id}`;

// Métodos añadidos a la clase existente (declarada arriba) vía asignación directa
;(WebAdminAPI as any).getRestaurantReviews = async function(params: {
  restaurantId: string;
  limit?: number;
  offset?: number;
  order?: 'created_at_desc' | 'created_at_asc' | 'rating_desc' | 'rating_asc';
}): Promise<{ reviews: ApiReview[]; stats: RestaurantStats | null; total: number }> {
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;
  const order = params.order ?? 'created_at_desc';
  const cacheKey = (CACHE_KEYS as any).RESTAURANT_REVIEWS(params.restaurantId, limit, offset);
  const cached = cache.get<{ reviews: ApiReview[]; stats: RestaurantStats | null; total: number }>(cacheKey);
  if (cached) return cached;
  try {
    const searchParams = new URLSearchParams({ limit: String(limit), offset: String(offset), order });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${WEBADMIN_API_BASE}/api/mobile/restaurants/${params.restaurantId}/reviews?${searchParams}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new APIError(`HTTP ${response.status}`, response.status);
    const result = await response.json();
    if (!result.success) throw new APIError(result.error || 'Error obteniendo reseñas');
    const payload = {
      reviews: result.data.reviews as ApiReview[] || [],
      stats: result.data.stats as RestaurantStats || null,
      total: result.data.total ?? (result.data.stats?.reviews_count || 0)
    };
    cache.set(cacheKey, payload, 2 * 60 * 1000);
    return payload;
  } catch (error) {
    throw handleAPIError(error);
  }
};

;(WebAdminAPI as any).getRestaurantStats = async function(restaurantId: string): Promise<RestaurantStats> {
  const cacheKey = (CACHE_KEYS as any).RESTAURANT_STATS(restaurantId);
  const cached = cache.get<RestaurantStats>(cacheKey);
  if (cached) return cached;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${WEBADMIN_API_BASE}/api/mobile/restaurants/${restaurantId}/reviews/stats`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new APIError(`HTTP ${response.status}`, response.status);
    const result = await response.json();
    if (!result.success) throw new APIError(result.error || 'Error obteniendo estadísticas');
    const stats: RestaurantStats = result.data;
    cache.set(cacheKey, stats, 5 * 60 * 1000);
    return stats;
  } catch (error) {
    throw handleAPIError(error);
  }
};

;(WebAdminAPI as any).submitReview = async function(restaurantId: string, reviewData: {
  rating: number;
  comment?: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
}, authToken?: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${WEBADMIN_API_BASE}/api/mobile/restaurants/${restaurantId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
      body: JSON.stringify(reviewData),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new APIError(`HTTP ${response.status}`, response.status);
    const result = await response.json();
    if (!result.success) throw new APIError(result.error || 'Error enviando reseña');
    cache.invalidate((CACHE_KEYS as any).RESTAURANT_STATS(restaurantId));
    cache.invalidatePattern(`restaurant:reviews:${restaurantId}`);
    return result.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

;(WebAdminAPI as any).deleteReview = async function(restaurantId: string, reviewId: string, authToken?: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${WEBADMIN_API_BASE}/api/mobile/restaurants/${restaurantId}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new APIError(`HTTP ${response.status}`, response.status);
    const result = await response.json();
    if (!result.success) throw new APIError(result.error || 'Error eliminando reseña');
    cache.invalidate((CACHE_KEYS as any).RESTAURANT_STATS(restaurantId));
    cache.invalidatePattern(`restaurant:reviews:${restaurantId}`);
    return true;
  } catch (error) {
    throw handleAPIError(error);
  }
};

;(WebAdminAPI as any).getMyReview = async function(restaurantId: string, userId: string, authToken?: string): Promise<ApiReview | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${WEBADMIN_API_BASE}/api/mobile/restaurants/${restaurantId}/reviews/mine?user_id=${userId}`, {
      headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.status === 404) return null;
    if (!response.ok) throw new APIError(`HTTP ${response.status}`, response.status);
    const result = await response.json();
    if (!result.success) throw new APIError(result.error || 'Error obteniendo mi reseña');
    return result.data as ApiReview;
  } catch (error) {
    throw handleAPIError(error);
  }
};

export const obtenerReviewsRestaurante = (WebAdminAPI as any).getRestaurantReviews;
export const obtenerEstadisticasRestaurante = (WebAdminAPI as any).getRestaurantStats;
export const enviarReview = (WebAdminAPI as any).submitReview;
export const obtenerMiReview = (WebAdminAPI as any).getMyReview;
export const eliminarMiReview = (WebAdminAPI as any).deleteReview;