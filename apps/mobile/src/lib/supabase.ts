// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables de entorno (usando process.env para Expo/React Native con babel plugin o dotenv)
// Asegúrate de definir SUPABASE_URL y SUPABASE_ANON_KEY en un archivo .env (o app.config) y exponerlas si usas Expo.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Faltan variables de entorno EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}
if (supabaseAnonKey === 'REEMPLAZA_CON_TU_ANON_KEY') {
  console.error('[Supabase] Estás usando el placeholder REEMPLAZA_CON_TU_ANON_KEY. Ve al dashboard de Supabase -> Settings -> API y copia la anon public key.');
}
if (typeof __DEV__ !== 'undefined') {
  try {
    if (supabaseAnonKey) {
      const safePreview = supabaseAnonKey.length > 12 
        ? supabaseAnonKey.slice(0,6) + '...' + supabaseAnonKey.slice(-6) 
        : '[short key]';
      console.log('[Supabase][Debug] URL:', supabaseUrl, 'AnonKey length:', supabaseAnonKey.length, 'preview:', safePreview);
    } else {
      console.log('[Supabase][Debug] No anon key en runtime');
    }
  } catch {}
}

// Adaptador AsyncStorage para React Native (persistencia de sesión)
const asyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key)
};

// Cliente principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: asyncStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// ========================================
// TIPOS TYPESCRIPT
// ========================================

// Perfil de usuario principal (versión extendida consolidada)
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  onboarding_completed: boolean;
  profile_completion_percentage: number;
  dietary_preferences: string[];
  cuisine_preferences: string[];
  price_range_preference: 'low' | 'medium' | 'high' | 'any';
  notifications_enabled: boolean;
  location_enabled: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
  is_active: boolean;
}

export interface UserLocation {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantFavorite {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_image_url?: string;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters?: any;
  results_count: number;
  created_at: string;
}

export interface RestaurantReview {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name?: string;
  rating: number;
  comment?: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface PushNotificationToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  device_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
  // Paso 1: signUp mínimo (reduce causas de error en auth.users)
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Enriquecer mensaje común "Database error saving new user"
    if (error.message === 'Database error saving new user') {
      error.message = 'Error de base de datos creando usuario. Verifica: (1) Email provider habilitado en Auth Settings, (2) No hay políticas o triggers que bloqueen inserts en auth.users, (3) Email no registrado previamente.';
    }
    throw error;
  }

  // Paso 2: metadatos (opcional) - update user metadata si disponible
  try {
    if (data.user) {
      await supabase.auth.updateUser({
        data: { full_name: fullName, phone }
      });
    }
  } catch (e) {
    console.warn('[Supabase] update metadata falló:', (e as any)?.message);
  }

  // Paso 3: upsert fila perfil aplicación
  try {
    if (data.user) {
      await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  } catch (e) {
    console.warn('[Supabase] upsert users falló (verificar políticas RLS en tabla users):', (e as any)?.message);
  }
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Actualizar última actividad
  if (data.user) {
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ========================================
// FUNCIONES DE PERFIL
// ========================================

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ========================================
// FUNCIONES DE UBICACIONES
// ========================================

export const getUserLocations = async (userId: string): Promise<UserLocation[]> => {
  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addUserLocation = async (locationData: Omit<UserLocation, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_locations')
    .insert(locationData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserLocation = async (locationId: string, updates: Partial<UserLocation>) => {
  const { data, error } = await supabase
    .from('user_locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserLocation = async (locationId: string) => {
  const { error } = await supabase
    .from('user_locations')
    .delete()
    .eq('id', locationId);

  if (error) throw error;
};

// ========================================
// FUNCIONES DE FAVORITOS
// ========================================

export const getUserFavorites = async (userId: string): Promise<RestaurantFavorite[]> => {
  const { data, error } = await supabase
    .from('restaurant_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addToFavorites = async (userId: string, restaurantId: string, restaurantName?: string, restaurantImageUrl?: string) => {
  const { data, error } = await supabase
    .from('restaurant_favorites')
    .insert({
      user_id: userId,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      restaurant_image_url: restaurantImageUrl
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromFavorites = async (userId: string, restaurantId: string) => {
  const { error } = await supabase
    .from('restaurant_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
};

export const isRestaurantFavorite = async (userId: string, restaurantId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('restaurant_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

// ========================================
// FUNCIONES DE HISTORIAL DE BÚSQUEDA
// ========================================

export const addSearchHistory = async (userId: string, query: string, filters?: any, resultsCount: number = 0) => {
  const { data, error } = await supabase
    .from('search_history')
    .insert({
      user_id: userId,
      query,
      filters,
      results_count: resultsCount
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSearchHistory = async (userId: string, limit: number = 20): Promise<SearchHistory[]> => {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const clearSearchHistory = async (userId: string) => {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

// ========================================
// FUNCIONES DE RESEÑAS
// ========================================

export const addRestaurantReview = async (reviewData: Omit<RestaurantReview, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .insert(reviewData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRestaurantReviews = async (restaurantId: string): Promise<RestaurantReview[]> => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getUserReviews = async (userId: string): Promise<RestaurantReview[]> => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateRestaurantReview = async (reviewId: string, updates: Partial<RestaurantReview>) => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRestaurantReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('restaurant_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
};

// Convenience helpers aligned to new screens API naming
export const getUserReview = async (restaurantId: string, userId: string): Promise<RestaurantReview | null> => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

export const createReview = async (data: { restaurant_id: string; rating: number; comment?: string; food_rating?: number; service_rating?: number; ambiance_rating?: number; }) => {
  const { data: inserted, error } = await supabase
    .from('restaurant_reviews')
    .insert({ ...data })
    .select()
    .single();
  if (error) throw error;
  return inserted;
};

export const updateReview = async (reviewId: string, updates: Partial<Pick<RestaurantReview, 'rating' | 'comment' | 'food_rating' | 'service_rating' | 'ambiance_rating'>>) => {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('restaurant_reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
  return true;
};

// ========================================
// FUNCIONES DE ANALYTICS
// ========================================

export const trackUserEvent = async (userId: string, eventType: string, eventData?: any, latitude?: number, longitude?: number) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      latitude,
      longitude
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ========================================
// FUNCIONES DE PUSH NOTIFICATIONS
// ========================================

export const savePushToken = async (userId: string, token: string, platform: 'ios' | 'android', deviceId?: string) => {
  const { data, error } = await supabase
    .from('push_notification_tokens')
    .upsert({
      user_id: userId,
      token,
      platform,
      device_id: deviceId,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removePushToken = async (userId: string, token: string) => {
  const { error } = await supabase
    .from('push_notification_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('token', token);

  if (error) throw error;
};

// ========================================
// FUNCIONES DE CONFIGURACIÓN
// ========================================

export const getAppSettings = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*');

  if (error) throw error;
  
  // Convertir a objeto clave-valor
  const settings: Record<string, any> = {};
  data?.forEach(setting => {
    settings[setting.key] = setting.value;
  });
  
  return settings;
};

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// ========================================
// SUSCRIPCIONES EN TIEMPO REAL
// ========================================

export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// ========================================
// NUEVAS FUNCIONES (Tablas extendidas usuario)
// ========================================

// ---------- CATEGORÍAS DE COMIDA ----------
export const getFoodCategories = async (): Promise<FoodCategory[]> => {
  const { data, error } = await supabase
    .from('food_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return data || [];
};

export const getUserFoodCategories = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_food_categories')
    .select('category_name')
    .eq('user_id', userId);
  if (error) throw error;
  return data?.map(i => i.category_name) || [];
};

export const updateUserFoodCategories = async (userId: string, categories: string[]) => {
  // Eliminar existentes
  await supabase.from('user_food_categories').delete().eq('user_id', userId);
  if (categories.length) {
    const { error } = await supabase
      .from('user_food_categories')
      .insert(categories.map(c => ({ user_id: userId, category_name: c })));
    if (error) throw error;
  }
  // Recalcular completitud
  await supabase.rpc('calculate_profile_completion', { p_user_id: userId });
};

// ---------- PRIVACIDAD ----------
export const getUserPrivacySettings = async (userId: string): Promise<UserPrivacySettings | null> => {
  const { data, error } = await supabase
    .from('user_privacy_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data;
};

export const updateUserPrivacySettings = async (userId: string, settings: Partial<UserPrivacySettings>) => {
  const { data, error } = await supabase
    .from('user_privacy_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ---------- NOTIFICACIONES ----------
export const getUserNotificationSettings = async (userId: string): Promise<UserNotificationSettings | null> => {
  const { data, error } = await supabase
    .from('user_notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data;
};

export const updateUserNotificationSettings = async (userId: string, settings: Partial<UserNotificationSettings>) => {
  const { data, error } = await supabase
    .from('user_notification_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ---------- PREFERENCIAS ----------
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data;
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...preferences })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ---------- DISPOSITIVOS ----------
export const getUserDevices = async (userId: string): Promise<UserDevice[]> => {
  const { data, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const registerDevice = async (deviceData: Omit<UserDevice, 'id' | 'created_at' | 'updated_at'>) => {
  await supabase.from('user_devices').update({ is_current: false }).eq('user_id', deviceData.user_id);
  const { data, error } = await supabase
    .from('user_devices')
    .insert({ ...deviceData, is_current: true })
    .select()
    .single();
  if (error) throw error;
  await supabase.rpc('log_user_activity', {
    p_user_id: deviceData.user_id,
    p_activity_type: 'device_login',
    p_description: `Login from ${deviceData.device_name}`,
    p_metadata: { device_type: deviceData.device_type },
    p_device_id: data.id
  });
  return data;
};

export const removeDevice = async (deviceId: string) => {
  const { error } = await supabase.from('user_devices').delete().eq('id', deviceId);
  if (error) throw error;
};

// ---------- SEGURIDAD ----------
export const getUserSecuritySettings = async (userId: string): Promise<UserSecuritySettings | null> => {
  const { data, error } = await supabase
    .from('user_security_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && (error as any).code !== 'PGRST116') throw error;
  return data;
};

export const updateUserSecuritySettings = async (userId: string, settings: Partial<UserSecuritySettings>) => {
  const { data, error } = await supabase
    .from('user_security_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ---------- LOG DE ACTIVIDAD ----------
export const getUserActivityLog = async (userId: string, limit: number = 50): Promise<UserActivityLog[]> => {
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

export const logUserActivity = async (
  userId: string,
  activityType: string,
  description: string,
  metadata?: any,
  deviceId?: string
) => {
  const { data, error } = await supabase.rpc('log_user_activity', {
    p_user_id: userId,
    p_activity_type: activityType,
    p_description: description,
    p_metadata: metadata,
    p_device_id: deviceId
  });
  if (error) throw error;
  return data;
};

// ---------- PERFIL COMPLETO (AGREGADO) ----------
export const getCompleteUserProfile = async (userId: string) => {
  const [
    profile,
    foodCategories,
    privacySettings,
    notificationSettings,
    preferences,
    securitySettings,
    devices
  ] = await Promise.all([
    getUserProfile(),
    getUserFoodCategories(userId),
    getUserPrivacySettings(userId),
    getUserNotificationSettings(userId),
    getUserPreferences(userId),
    getUserSecuritySettings(userId),
    getUserDevices(userId)
  ]);
  return { profile, foodCategories, privacySettings, notificationSettings, preferences, securitySettings, devices };
};

// ---------- AVATAR ----------
export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  await supabase.rpc('calculate_profile_completion', { p_user_id: userId });
  return data;
};

export const removeUserAvatar = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  await supabase.rpc('calculate_profile_completion', { p_user_id: userId });
  return data;
};

// ========================================
// NUEVOS TIPOS TYPESCRIPT
// ========================================

export interface UserFoodCategory {
  id: string;
  user_id: string;
  category_name: string;
  selected_at: string;
}

export interface UserPrivacySettings {
  id: string;
  user_id: string;
  perfil_publico: boolean;
  mostrar_actividad: boolean;
  mostrar_ubicacion: boolean;
  mostrar_favoritos: boolean;
  mostrar_resenas: boolean;
  mostrar_fotos: boolean;
  mostrar_estadisticas: boolean;
  permitir_conexiones: boolean;
  conexiones_amigos: boolean;
  conexiones_ubicacion: boolean;
  conexiones_gustos: boolean;
  modo_explorador: boolean;
  explorar_restaurantes: boolean;
  explorar_eventos: boolean;
  notificar_cercania: boolean;
  radio_explorador: number;
  compartir_analiticas: boolean;
  personalizar_anuncios: boolean;
  compartir_terceros: boolean;
  guardar_historial: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationSettings {
  id: string;
  user_id: string;
  notificaciones_push: boolean;
  pedidos: boolean;
  ofertas: boolean;
  promociones: boolean;
  resenas_nuevas: boolean;
  conexiones: boolean;
  recordatorios: boolean;
  notificaciones_email: boolean;
  email_resumen: boolean;
  email_ofertas: boolean;
  eventos: boolean;
  frecuencia_email: 'nunca' | 'diario' | 'semanal' | 'mensual';
  modo_no_molestar: boolean;
  hora_inicio_no_molestar: number;
  hora_fin_no_molestar: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  idioma: 'es' | 'en' | 'fr' | 'pt';
  region: string;
  tema: 'light' | 'dark' | 'system';
  unidad_distancia: 'km' | 'miles';
  unidad_moneda: string;
  ubicacion_automatica: boolean;
  mostrar_distancia_restaurantes: boolean;
  radio_busqueda_default: number;
  created_at: string;
  updated_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  device_model?: string;
  operating_system?: string;
  app_version?: string;
  is_current: boolean;
  last_active_at: string;
  first_login_at: string;
  login_count: number;
  login_city?: string;
  login_country?: string;
  login_ip_hash?: string;
  session_token?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  biometric_enabled: boolean;
  two_factor_enabled: boolean;
  backup_codes?: any;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  password_changed_at: string;
  failed_login_attempts: number;
  account_locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
  color?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: any;
  device_id?: string;
  ip_hash?: string;
  user_agent?: string;
  created_at: string;
}

// (Eliminado bloque duplicado de helpers de reviews)