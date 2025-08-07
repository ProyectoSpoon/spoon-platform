// apps/web/src/app/config-restaurante/ubicacion/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getUserRestaurant, supabase } from '@spoon/shared';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  Input,
  toast 
} from '@spoon/shared';

interface UbicacionData {
  address: string;
  country_id: string;
  department_id: string;
  city_id: string;
  latitude?: number;
  longitude?: number;
}

interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  country_id: string;
}

interface City {
  id: string;
  name: string;
  department_id: string;
  latitude: number;
  longitude: number;
  is_capital: boolean;
  population?: number;
}

// Componente de mapa simple
const MapaSimple = ({ lat, lng, address }: { lat: number; lng: number; address: string }) => (
  <div className="h-64 w-full bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-inner relative overflow-hidden">
    {/* Efectos de fondo tipo mapa */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-green-500 rounded-full"></div>
      <div className="absolute bottom-20 left-24 w-12 h-12 bg-orange-500 rounded-full"></div>
      <div className="absolute bottom-32 right-32 w-14 h-14 bg-purple-500 rounded-full"></div>
    </div>
    
    {/* Grid tipo mapa */}
    <div className="absolute inset-0 opacity-5">
      <div className="grid grid-cols-8 grid-rows-6 h-full">
        {Array.from({ length: 48 }, (_, i) => (
          <div key={i} className="border border-gray-400"></div>
        ))}
      </div>
    </div>
    
    {/* Marcador principal */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="relative">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </div>
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-black opacity-20 rounded-full blur-sm"></div>
        </div>
        
        {/* Info bubble */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg border-2 border-red-500 whitespace-nowrap max-w-48">
          <div className="text-xs font-semibold text-gray-800 truncate">
            {address || 'Tu restaurante aquí'}
          </div>
          <div className="text-xs text-gray-500">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      </div>
    </div>
    
    {/* Logo de ubicación */}
    <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
      📍 Spoon Maps
    </div>
  </div>
);

export default function UbicacionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UbicacionData>({
    address: '',
    country_id: '',
    department_id: '',
    city_id: '',
    latitude: 4.6097102,
    longitude: -74.081749
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Estados para datos geográficos
  const [countries, setCountries] = useState<Country[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  // Cargar países
  const loadCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCountries(data || []);
      
      // Auto-seleccionar Colombia si está disponible
      const colombia = data?.find(c => c.code === 'COL');
      if (colombia && !formData.country_id) {
        setFormData(prev => ({ ...prev, country_id: colombia.id }));
      }
    } catch (error) {
      console.error('Error cargando países:', error);
      toast.error('Error cargando países');
    }
  };

  // Cargar departamentos por país
  const loadDepartments = async (countryId: string) => {
    if (!countryId) {
      setDepartments([]);
      return;
    }

    try {
      setLoadingGeoData(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('country_id', countryId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      toast.error('Error cargando departamentos');
    } finally {
      setLoadingGeoData(false);
    }
  };

  // Cargar ciudades por departamento
  const loadCities = async (departmentId: string) => {
    if (!departmentId) {
      setCities([]);
      return;
    }

    try {
      setLoadingGeoData(true);
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('is_capital', { ascending: false })
        .order('population', { ascending: false })
        .order('name', { ascending: true });  

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error cargando ciudades:', error);
      toast.error('Error cargando ciudades');
    } finally {
      setLoadingGeoData(false);
    }
  };

  // Actualizar coordenadas cuando cambia la ciudad
  useEffect(() => {
    if (formData.city_id) {
      const selectedCity = cities.find(c => c.id === formData.city_id);
      if (selectedCity) {
        setFormData(prev => ({
          ...prev,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude
        }));
      }
    }
  }, [formData.city_id, cities]);

  // Efectos para cargar datos geográficos en cascada
  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      loadDepartments(formData.country_id);
      // Limpiar selecciones dependientes
      setFormData(prev => ({ 
        ...prev, 
        department_id: '', 
        city_id: '',
        latitude: 4.6097102,
        longitude: -74.081749
      }));
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.department_id) {
      loadCities(formData.department_id);
      // Limpiar ciudad
      setFormData(prev => ({ 
        ...prev, 
        city_id: '',
        latitude: 4.6097102,
        longitude: -74.081749
      }));
    }
  }, [formData.department_id]);

  // Cargar datos existentes del restaurante
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [profile, restaurant] = await Promise.all([
          getUserProfile(),
          getUserRestaurant()
        ]);
        
        if (profile) {
          setUserInfo(profile);
          console.log('👤 Usuario cargado:', profile.email);
        }
        
        if (restaurant) {
          console.log('🏪 Restaurante encontrado:', restaurant.id);
          setRestaurantId(restaurant.id);
          
          // Cargar datos existentes de ubicación
          setFormData({
            address: restaurant.address || '',
            country_id: restaurant.country_id || '',
            department_id: restaurant.department_id || '',
            city_id: restaurant.city_id || '',
            latitude: restaurant.latitude || 4.6097102,
            longitude: restaurant.longitude || -74.081749
          });
          
          // Si hay datos existentes, cargar departamentos y ciudades
          if (restaurant.country_id) {
            await loadDepartments(restaurant.country_id);
            if (restaurant.department_id) {
              await loadCities(restaurant.department_id);
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast.error('Error al cargar la información de ubicación');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.address.trim()) {
      toast.error('La dirección es requerida');
      return false;
    }
    
    if (!formData.country_id) {
      toast.error('Selecciona un país');
      return false;
    }
    
    if (!formData.department_id) {
      toast.error('Selecciona un departamento');
      return false;
    }
    
    if (!formData.city_id) {
      toast.error('Selecciona una ciudad');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      if (!restaurantId) {
        toast.error('No se encontró información del restaurante');
        return;
      }

    const { error } = await supabase
      .from('restaurants')
      .update({
        address: formData.address,
        country_id: formData.country_id,
        department_id: formData.department_id,
        city_id: formData.city_id,
        latitude: formData.latitude,
        longitude: formData.longitude,
        // Mantener campos legacy por compatibilidad
        city: cities.find(c => c.id === formData.city_id)?.name || '',
        state: departments.find(d => d.id === formData.department_id)?.name || '',
        country: countries.find(c => c.id === formData.country_id)?.name || '',
        updated_at: new Date().toISOString()
        // ❌ FALTA: setup_step: 2
      })
        .eq('id', restaurantId);

      if (error) throw error;
      
      toast.success('Ubicación guardada correctamente');
      
      // Navegar a siguiente paso
      router.push('/config-restaurante/horario-comercial');
      
    } catch (error) {
      console.error('❌ Error guardando ubicación:', error);
      toast.error('Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/config-restaurante/informacion-general');
  };

  const isFormValid = formData.address.trim() && formData.country_id && formData.department_id && formData.city_id;
  
  const selectedCountry = countries.find(c => c.id === formData.country_id);
  const selectedDepartment = departments.find(d => d.id === formData.department_id);
  const selectedCity = cities.find(c => c.id === formData.city_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                ← Volver
              </Button>
              
              <div className="text-center flex-1">
                <span className="text-sm text-gray-500 font-medium">Paso 2 de 4</span>
              </div>
              
              <div className="w-20"></div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Ubicación del Restaurante
            </CardTitle>
            <p className="text-gray-600">
              ¿Dónde está ubicado tu restaurante?
            </p>
            {userInfo && (
              <p className="text-xs text-blue-600 mt-2">
                👤 {userInfo.email} • {restaurantId ? `ID: ${restaurantId.slice(0, 8)}...` : 'Configurando...'}
              </p>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formulario */}
          <Card>
            <CardContent className="p-6 space-y-6">
              
              {/* Dirección */}
              <div>
                <Input
                  label="Dirección Completa *"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ej: Carrera 15 #85-32, Chapinero"
                  leftIcon={
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  }
                  helperText="Incluye número, nombre de la calle y barrio"
                />
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="inline w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                  </svg>
                  País *
                </label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Selecciona país</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name} ({country.phone_code})
                    </option>
                  ))}
                </select>
                {countries.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ No se pudieron cargar los países. Intenta recargar la página.
                  </p>
                )}
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="inline w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Departamento *
                  {loadingGeoData && departments.length === 0 && (
                    <span className="ml-2 text-xs text-blue-600">(Cargando...)</span>
                  )}
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  disabled={!formData.country_id || loadingGeoData}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.country_id 
                      ? 'Primero selecciona país' 
                      : loadingGeoData 
                      ? 'Cargando departamentos...'
                      : 'Selecciona departamento'
                    }
                  </option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="inline w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3z"/>
                  </svg>
                  Ciudad *
                  {loadingGeoData && cities.length === 0 && formData.department_id && (
                    <span className="ml-2 text-xs text-blue-600">(Cargando...)</span>
                  )}
                </label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleInputChange}
                  disabled={!formData.department_id || loadingGeoData}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.department_id 
                      ? 'Primero selecciona departamento' 
                      : loadingGeoData 
                      ? 'Cargando ciudades...'
                      : 'Selecciona ciudad'
                    }
                  </option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name} {city.is_capital && '(Capital)'} {city.population && `(${(city.population / 1000).toFixed(0)}k hab.)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Información de ubicación completa */}
              {isFormValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold text-sm mb-2">✅ Ubicación configurada</div>
                  <div className="text-green-700 text-sm space-y-1">
                    <p><strong>Dirección:</strong> {formData.address}</p>
                    <p><strong>Ciudad:</strong> {selectedCity?.name}, {selectedDepartment?.name}</p>
                    <p><strong>País:</strong> {selectedCountry?.name}</p>
                    <p><strong>Coordenadas:</strong> {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Mapa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previsualización del Mapa</CardTitle>
              <p className="text-sm text-gray-600">
                Las coordenadas se obtienen automáticamente de la base de datos geográfica
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <MapaSimple
                lat={formData.latitude || 4.6097102}
                lng={formData.longitude || -74.081749}
                address={formData.address ? `${formData.address}${selectedCity ? `, ${selectedCity.name}` : ''}` : ''}
              />
              
              {/* Info de la ciudad seleccionada */}
              {selectedCity && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">📍 {selectedCity.name}</h4>
                  <div className="text-xs text-blue-700 mt-1 space-y-1">
                    {selectedCity.is_capital && <p>🏛️ Capital del departamento</p>}
                    {selectedCity.population && <p>👥 Población: {selectedCity.population.toLocaleString()} habitantes</p>}
                    <p>🌐 Lat: {selectedCity.latitude?.toFixed(6)}, Lng: {selectedCity.longitude?.toFixed(6)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Botones de navegación */}
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                ← Información General
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || !isFormValid}
                loading={saving}
                variant={isFormValid ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                {saving ? 'Guardando...' : isFormValid ? 'Continuar a Horarios →' : 'Completa la ubicación'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progreso visual */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <div>
                <h3 className="font-bold text-blue-800">Ubicación Geográfica</h3>
                <p className="text-sm text-blue-700">
                  Esta información ayudará a los clientes a encontrar tu restaurante fácilmente.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Los datos geográficos se cargan desde nuestra base de datos actualizada de Colombia
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-100">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 text-gray-700">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Restaurant ID:</strong> {restaurantId || 'null'}</p>
                <p><strong>Form Valid:</strong> {isFormValid ? 'Yes' : 'No'}</p>
                <p><strong>Countries Loaded:</strong> {countries.length}</p>
                <p><strong>Departments Loaded:</strong> {departments.length}</p>
                <p><strong>Cities Loaded:</strong> {cities.length}</p>
                <p><strong>Selected IDs:</strong> Country: {formData.country_id}, Dept: {formData.department_id}, City: {formData.city_id}</p>
                <p><strong>Coordinates:</strong> {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}