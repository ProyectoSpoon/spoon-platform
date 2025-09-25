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
    .select('*')
    .eq('restaurant_id', restaurantId)
    .gte('registrado_at', `${fecha}T00:00:00`)
    .lt('registrado_at', `${fecha}T23:59:59`);

  if (error) {
    console.error('Error loading gastos del día:', error);
    return { gastos: [], totalGastos: 0 };
  }

  const gastos = data || [];
  const totalGastos = gastos.reduce((sum: number, gasto: any) => sum + (gasto.monto || 0), 0);

  return {
    gastos,
    totalGastos
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
