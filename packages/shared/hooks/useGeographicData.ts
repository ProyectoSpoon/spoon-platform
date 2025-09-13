import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
  is_active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  country_id: string;
  is_active: boolean;
}

export interface City {
  id: string;
  name: string;
  department_id: string;
  latitude: number;
  longitude: number;
  is_capital: boolean;
  population?: number;
  is_active: boolean;
}

export interface GeographicDataState {
  countries: Country[];
  departments: Department[];
  cities: City[];
  loading: boolean;
  error: string | null;
}

export function useGeographicData() {
  const [state, setState] = useState<GeographicDataState>({
    countries: [],
    departments: [],
    cities: [],
    loading: false,
    error: null,
  });

  // Cargar países
  const loadCountries = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🌍 Cargando países...');
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error cargando países:', error);
        throw error;
      }

      console.log('✅ Países cargados:', data?.length || 0);
      setState(prev => ({
        ...prev,
        countries: data || [],
        loading: false,
      }));

      return data || [];
    } catch (error: any) {
      console.error('💥 Error en loadCountries:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return [];
    }
  }, []);

  // Cargar departamentos por país
  const loadDepartments = useCallback(async (countryId: string) => {
    if (!countryId) {
      setState(prev => ({ ...prev, departments: [], cities: [] }));
      return [];
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🏛️ Cargando departamentos para país:', countryId);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('country_id', countryId)
        .order('name');

      if (error) {
        console.error('❌ Error cargando departamentos:', error);
        throw error;
      }

      console.log('✅ Departamentos cargados:', data?.length || 0);
      setState(prev => ({
        ...prev,
        departments: data || [],
        cities: [], // Limpiar ciudades al cambiar país
        loading: false,
      }));

      return data || [];
    } catch (error: any) {
      console.error('💥 Error en loadDepartments:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return [];
    }
  }, []);

  // Cargar ciudades por departamento
  const loadCities = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setState(prev => ({ ...prev, cities: [] }));
      return [];
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🏙️ Cargando ciudades para departamento:', departmentId);
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('department_id', departmentId)
        .order('is_capital', { ascending: false })
        .order('population', { ascending: false })
        .order('name');

      if (error) {
        console.error('❌ Error cargando ciudades:', error);
        throw error;
      }

      console.log('✅ Ciudades cargadas:', data?.length || 0);
      setState(prev => ({
        ...prev,
        cities: data || [],
        loading: false,
      }));

      return data || [];
    } catch (error: any) {
      console.error('💥 Error en loadCities:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return [];
    }
  }, []);

  // Función utilitaria para obtener coordenadas de una ciudad
  const getCityCoordinates = useCallback((cityId: string): { latitude?: number; longitude?: number } => {
    const city = state.cities.find(c => c.id === cityId);
    if (!city) return {};
    
    return {
      latitude: city.latitude,
      longitude: city.longitude,
    };
  }, [state.cities]);

  // Auto-cargar países al montar el hook
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return {
    ...state,
    loadCountries,
    loadDepartments,
    loadCities,
    getCityCoordinates,
  };
}
