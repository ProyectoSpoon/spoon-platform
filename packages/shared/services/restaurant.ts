// packages/shared/services/restaurant.ts
import { supabase } from '../lib/supabase';

// ✅ TIPOS BASADOS EN TU ESTRUCTURA REAL
export interface RestaurantData {
  id?: string;
  owner_id?: string;
  name?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  cuisine_type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  business_hours?: BusinessHours;
  logo_url?: string;
  cover_image_url?: string;
  setup_completed?: boolean;
  setup_step?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  cuisine_type_id?: string;
  country_id?: string;
  department_id?: string;
  city_id?: string;
}

export interface BusinessHours {
  lunes?: DaySchedule;
  martes?: DaySchedule;
  miercoles?: DaySchedule;
  jueves?: DaySchedule;
  viernes?: DaySchedule;
  sabado?: DaySchedule;
  domingo?: DaySchedule;
}

export interface DaySchedule {
  abierto: boolean;
  turnos: {
    horaApertura: string;
    horaCierre: string;
  }[];
}

export interface UserData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  is_active?: boolean;
}

// ✅ SERVICIO PRINCIPAL DE RESTAURANTE
export class RestaurantService {
  
  // Obtener restaurante del usuario autenticado
  static async getUserRestaurant(): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting user restaurant:', error);
      return { data: null, error };
    }
  }

  // Obtener datos del usuario
  static async getUserProfile(): Promise<{ data: UserData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  }

  // Actualizar información general del restaurante
  static async updateBasicInfo(updates: {
    name?: string;
    description?: string;
    cuisine_type?: string;
    contact_phone?: string;
    contact_email?: string;
  }): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating restaurant basic info:', error);
      return { data: null, error };
    }
  }

  // Actualizar ubicación del restaurante
  static async updateLocation(updates: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    city_id?: string;
    department_id?: string;
    country_id?: string;
  }): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating restaurant location:', error);
      return { data: null, error };
    }
  }

  // Actualizar horarios comerciales
  static async updateBusinessHours(business_hours: BusinessHours): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          business_hours,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating business hours:', error);
      return { data: null, error };
    }
  }

  // Actualizar imágenes (logo y portada)
  static async updateImages(updates: {
    logo_url?: string;
    cover_image_url?: string;
  }): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating restaurant images:', error);
      return { data: null, error };
    }
  }

  // Marcar configuración como completada
  static async markSetupComplete(): Promise<{ data: RestaurantData | null, error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          setup_completed: true,
          setup_step: 4,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error marking setup complete:', error);
      return { data: null, error };
    }
  }

  // Obtener tipos de cocina disponibles
  static async getCuisineTypes(): Promise<{ data: any[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('cuisine_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error getting cuisine types:', error);
      return { data: null, error };
    }
  }

  // Obtener países disponibles
  static async getCountries(): Promise<{ data: any[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error getting countries:', error);
      return { data: null, error };
    }
  }

  // Obtener departamentos por país
  static async getDepartmentsByCountry(countryId: string): Promise<{ data: any[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('country_id', countryId)
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error getting departments:', error);
      return { data: null, error };
    }
  }

  // Obtener ciudades por departamento
  static async getCitiesByDepartment(departmentId: string): Promise<{ data: any[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error getting cities:', error);
      return { data: null, error };
    }
  }
}

// ✅ FUNCIONES DE UTILIDAD
export const formatBusinessHours = (hours: BusinessHours | null): string => {
  if (!hours) return 'No configurado';
  
  const days = Object.keys(hours);
  const openDays = days.filter(day => hours[day as keyof BusinessHours]?.abierto);
  
  if (openDays.length === 0) return 'Cerrado todos los días';
  if (openDays.length === 7) return 'Abierto todos los días';
  
  return `Abierto ${openDays.length} días`;
};

export const validateRestaurantData = (data: Partial<RestaurantData>): string[] => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('El nombre del restaurante es requerido');
  }
  
  if (!data.contact_email?.trim()) {
    errors.push('El email de contacto es requerido');
  }
  
  if (!data.contact_phone?.trim()) {
    errors.push('El teléfono de contacto es requerido');
  }
  
  if (!data.address?.trim()) {
    errors.push('La dirección es requerida');
  }
  
  return errors;
};

// ✅ EXPORTAR TODO
export default RestaurantService;