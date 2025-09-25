'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, getUserRestaurant, supabase } from "@spoon/shared/lib/supabase";
import { Button } from "@spoon/shared/components/ui/Button";
import { Card } from "@spoon/shared/components/ui/Card";
import { CardHeader } from "@spoon/shared/components/ui/Card";
import { CardTitle } from "@spoon/shared/components/ui/Card";
import { CardContent } from "@spoon/shared/components/ui/Card";
import { toast } from "@spoon/shared/components/ui/Toast";
import { DynamicMap } from "@spoon/shared/components/ui/components/DynamicMap";
import { InputV2 } from "@spoon/shared/components/ui/InputV2";
import { UbicacionForm } from "@spoon/shared/components/ui/components/UbicacionForm";
import { useGeographicData } from "@spoon/shared/hooks/useGeographicData";

// Type casting for React type conflicts
const ButtonComponent = Button as any;
const CardComponent = Card as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;
const CardContentComponent = CardContent as any;
const UbicacionFormComponent = UbicacionForm as any;
const InputV2Component = InputV2 as any;

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

const MapaSimple = ({ lat, lng, address }: { lat: number; lng: number; address: string }) => (
  <div className="h-64 w-full bg-gradient-to-br from-[color:var(--sp-info-100)] to-[color:var(--sp-success-100)] rounded-xl shadow-inner relative overflow-hidden">
    {/* ...mapa visual... */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-20 h-20 bg-[color:var(--sp-info-500)] rounded-full"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-[color:var(--sp-success-500)] rounded-full"></div>
      <div className="absolute bottom-20 left-24 w-12 h-12 bg-[color:var(--sp-primary-600)] rounded-full"></div>
      <div className="absolute bottom-32 right-32 w-14 h-14 bg-[color:var(--sp-neutral-500)] rounded-full"></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 bg-[color:var(--sp-error-500)] rounded-full flex items-center justify-center shadow-2xl animate-bounce">
          <svg className="w-6 h-6 text-[--sp-on-error]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-[--sp-surface] px-3 py-2 rounded-lg shadow-lg border-2 border-[color:var(--sp-error-500)] whitespace-nowrap max-w-48">
          <div className="text-xs font-semibold text-[color:var(--sp-neutral-800)] truncate">{address || "Tu restaurante aquí"}</div>
          <div className="text-xs text-[color:var(--sp-neutral-500)]">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-2 left-2 text-xs text-[color:var(--sp-neutral-500)] bg-[--sp-surface] px-2 py-1 rounded">📍 Spoon Maps</div>
  </div>
);

export default function UbicacionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UbicacionData>({
    address: "",
    country_id: "", // Se establecerá automáticamente cuando carguen los países
    department_id: "",
    city_id: "",
    latitude: 4.6097102, // Coordenadas por defecto de Bogotá
    longitude: -74.081749,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Usar el hook para datos geográficos reales
  const { countries, departments, cities, loading: loadingGeoData } = useGeographicData();
  const [resolvedCityName, setResolvedCityName] = useState<string | undefined>(undefined);

  // Función optimizada para manejar cambios en el formulario
  const handleFormChange = useCallback((field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Logger para detectar cambios inesperados de coordenadas
  useEffect(() => {
    console.log('�️ Coordenadas actuales:', {
      lat: formData.latitude,
      lng: formData.longitude,
      city: cities.find(c => c.id === formData.city_id)?.name,
      trigger: 'formData change'
    });
  }, [formData.latitude, formData.longitude, formData.city_id, cities]);

  // Seguridad: timeout para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("La carga está tardando demasiado. Verifica tu conexión o recarga la página.");
      }
    }, 12000); // 12 segundos
    return () => clearTimeout(timeout);
  }, [loading]);

  // Cargar datos reales del usuario y restaurante
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        console.log('🚀 Iniciando carga de perfil y restaurante');
        const [profile, restaurant] = await Promise.all([
          getUserProfile().catch((e) => { console.warn('Perfil no disponible', e); return null; }),
          getUserRestaurant().catch((e) => { console.warn('Restaurante no disponible', e); return null; })
        ]);
        if (!isMounted) return;
        setUserInfo(profile);
        if (restaurant) {
          setRestaurantId(restaurant.id);
          console.log('🏪 Restaurante encontrado:', restaurant.id);
          setFormData(prev => ({
            ...prev,
            address: restaurant.address || prev.address,
            country_id: restaurant.country_id || prev.country_id,
            department_id: restaurant.department_id || prev.department_id,
            city_id: restaurant.city_id || prev.city_id,
            latitude: restaurant.latitude ?? prev.latitude,
            longitude: restaurant.longitude ?? prev.longitude,
          }));
        } else {
          console.log('ℹ️ Usuario sin restaurante asociado');
        }
      } catch (err: any) {
        console.error('❌ Error cargando datos de usuario/restaurante:', err);
        if (isMounted) setError('Error al cargar los datos. Intenta nuevamente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // ...existing code for loading countries, departments, cities, and restaurant data...

  // Validación y handlers
  const validateForm = (): boolean => {
    if (!formData.address.trim()) return toast.error("Ingresa la dirección completa"), false;
    // Colombia ya está configurado por defecto, no necesitamos validar país
    if (!formData.department_id) return toast.error("Selecciona un departamento"), false;
    if (!formData.city_id) return toast.error("Selecciona una ciudad"), false;
    return true;
  };

  // Función para validar consistencia entre dirección y coordenadas
  const [isValidatingConsistency, setIsValidatingConsistency] = useState(false);
  const [consistencyWarning, setConsistencyWarning] = useState<string | null>(null);

  const validateAddressConsistency = useCallback(async () => {
    if (!formData.address || formData.latitude === 4.6097102 || isValidatingConsistency) return;

    setIsValidatingConsistency(true);
    setConsistencyWarning(null);

    try {
      // Hacer geocodificación inversa para verificar qué dirección corresponde a las coordenadas actuales
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.latitude}&lon=${formData.longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const reverseAddress = data.address;
        const currentSearchAddress = formData.address.toLowerCase().trim();

        // Verificar si la dirección actual es consistente con las coordenadas
        const isConsistent =
          (reverseAddress.road && currentSearchAddress.includes(reverseAddress.road.toLowerCase())) ||
          (reverseAddress.house_number && currentSearchAddress.includes(reverseAddress.house_number)) ||
          data.display_name.toLowerCase().includes(currentSearchAddress.split(' ')[0].toLowerCase());

        if (!isConsistent) {
          const suggestedAddress = reverseAddress.road && reverseAddress.house_number
            ? `${reverseAddress.road} # ${reverseAddress.house_number}`
            : reverseAddress.road || data.display_name.split(',')[0];

          setConsistencyWarning(
            `La dirección "${formData.address}" podría no coincidir exactamente con la ubicación del marcador. ` +
            `La dirección más cercana es: "${suggestedAddress}"`
          );
        }
      }
    } catch (error) {
      console.error('Error validating address consistency:', error);
    } finally {
      setIsValidatingConsistency(false);
    }
  }, [formData.address, formData.latitude, formData.longitude, isValidatingConsistency]);

  // Validar consistencia cuando cambien las coordenadas
  useEffect(() => {
    const timeout = setTimeout(() => {
      validateAddressConsistency();
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeout);
  }, [validateAddressConsistency]);

  const handleSave = async () => {
    console.log('🔄 Iniciando handleSave');
    console.log('📋 Datos del formulario:', formData);
    console.log('✅ Formulario válido:', isFormValid);
    
    if (!validateForm()) {
      console.log('❌ Validación de formulario falló');
      return;
    }
    
    try {
      setSaving(true);
      console.log('💾 Guardando en base de datos...');
      
      if (!restaurantId) {
        console.log('❌ No hay restaurantId');
        return toast.error("No se encontró información del restaurante");
      }
      
      console.log('🏪 ID del restaurante:', restaurantId);
      
      const updateData = {
        address: formData.address,
        country_id: formData.country_id,
        department_id: formData.department_id,
        city_id: formData.city_id,
        latitude: formData.latitude,
        longitude: formData.longitude,
        city: cities.find((c) => c.id === formData.city_id)?.name || "",
        state: departments.find((d) => d.id === formData.department_id)?.name || "",
        country: countries.find((c) => c.id === formData.country_id)?.name || "",
        setup_step: 2,
        updated_at: new Date().toISOString(),
      };
      
      console.log('📦 Datos a actualizar:', updateData);
      
      const { error } = await supabase.from("restaurants").update(updateData).eq("id", restaurantId);
      
      if (error) {
        console.log('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Datos guardados exitosamente');
      toast.success("Ubicación guardada correctamente");
      
      console.log('🔄 Navegando a horarios...');
      router.push("/config-restaurante/horario-comercial");
      
    } catch (error) {
      console.log('❌ Error en catch:', error);
      toast.error("Error al guardar la ubicación");
    } finally {
      setSaving(false);
      console.log('🏁 handleSave terminado');
    }
  };

  const handleBack = () => router.push("/config-restaurante/informacion-general");

  // Función temporal para limpiar datos inconsistentes
  const handleResetLocation = () => {
    console.log('🧹 Resetting location data');
    setFormData(prev => ({
      ...prev,
      address: "",
      latitude: 4.6097102,
      longitude: -74.081749
    }));
  };

  // Forzar booleano real (antes devolvía el último valor truthy: city_id)
  const isFormValid = Boolean(
    formData.address.trim() &&
    formData.department_id &&
    formData.city_id
  );

  // Debug para isFormValid (ahora debe mostrar true/false)
  console.log('🔍 Estado de validación del formulario:', {
    address: formData.address.trim(),
    department_id: formData.department_id,
    city_id: formData.city_id,
    isFormValid
  });
  const selectedCountry = countries.find((c) => c.id === formData.country_id);
  const selectedDepartment = departments.find((d) => d.id === formData.department_id);
  const selectedCity = cities.find((c) => c.id === formData.city_id);

  // Resolver nombre de ciudad si el hook local no la tiene (porque el formulario usa otra instancia del hook)
  useEffect(() => {
    let cancelled = false;
    async function resolveCity() {
      if (selectedCity) {
        setResolvedCityName(selectedCity.name);
        return;
      }
      if (formData.city_id && !selectedCity) {
        try {
          const { data, error } = await supabase.from('cities').select('name').eq('id', formData.city_id).single();
          if (!cancelled && !error && data) setResolvedCityName(data.name);
        } catch {/* noop */}
      }
    }
    resolveCity();
    return () => { cancelled = true; };
  }, [formData.city_id, selectedCity]);

  if (loading) {
    return (
    <div className="min-h-screen bg-[--sp-surface] flex items-center justify-center">
        <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
      <p className="text-[color:var(--sp-neutral-600)]">Cargando información de ubicación...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
    <div className="min-h-screen bg-[--sp-surface] flex items-center justify-center">
        <div className="text-center">
      <div className="text-[color:var(--sp-error-500)] text-2xl mb-2">⚠️</div>
      <p className="text-[color:var(--sp-error-700)] font-semibold mb-2">{error}</p>
          <ButtonComponent onClick={() => window.location.reload()} variant="outline">Recargar página</ButtonComponent>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--sp-surface] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <CardComponent>
          <CardHeaderComponent>
            <div className="flex items-center justify-between mb-4">
              <ButtonComponent variant="outline" onClick={handleBack} className="flex items-center gap-2">← Volver</ButtonComponent>
              <div className="text-center flex-1">
                <span className="text-sm text-[color:var(--sp-neutral-500)] font-medium">Paso 2 de 4</span>
              </div>
              {/* Botón temporal de reset */}
              <ButtonComponent variant="outline" onClick={handleResetLocation} className="text-xs px-2 py-1">🧹 Reset</ButtonComponent>
            </div>
            <CardTitleComponent>Ubicación del Restaurante</CardTitleComponent>
            <p className="text-[color:var(--sp-neutral-600)]">¿Dónde está ubicado tu restaurante?</p>
            {userInfo && (
              <p className="text-xs text-[color:var(--sp-info-600)] mt-2">👤 {userInfo.email} • {restaurantId ? `ID: ${restaurantId.slice(0, 8)}...` : "Configurando..."}</p>
            )}
          </CardHeaderComponent>
        </CardComponent>
        {/* Formulario de ubicación - sin título redundante */}
        <CardComponent>
          <CardContentComponent>
            <UbicacionFormComponent
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleSave}
              saving={saving}
              showSave={false}
            />
          </CardContentComponent>
        </CardComponent>

        {/* Campo de dirección (requerido para habilitar continuar) */}
        <CardComponent>
          <CardContentComponent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--sp-neutral-700)]">Dirección exacta *</label>
              <InputV2Component
                value={formData.address}
                placeholder="Ej: Calle 123 # 45-67 Local 2"
                onChange={(e: any) => handleFormChange('address', e.target.value)}
              />
              <p className="text-xs text-[color:var(--sp-neutral-500)]">Escribe la dirección completa como quieres que aparezca. Puedes afinarla moviendo el marcador en el mapa.</p>
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Alerta de consistencia de dirección */}
        {consistencyWarning && (
          <CardComponent>
            <CardContentComponent>
              <div className="flex items-start gap-3 p-4 bg-[color:var(--sp-warning-100)] border border-[color:var(--sp-warning-300)] rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-[color:var(--sp-warning-600)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-[color:var(--sp-warning-800)] mb-1">
                    Verificación de Dirección
                  </h4>
                  <p className="text-sm text-[color:var(--sp-warning-700)]">
                    {consistencyWarning}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <ButtonComponent 
                      variant="outline" 
                      size="sm"
                      onClick={() => validateAddressConsistency()}
                      disabled={isValidatingConsistency}
                    >
                      {isValidatingConsistency ? 'Verificando...' : 'Verificar de nuevo'}
                    </ButtonComponent>
                    <ButtonComponent 
                      variant="outline" 
                      size="sm"
                      onClick={() => setConsistencyWarning(null)}
                    >
                      Ignorar
                    </ButtonComponent>
                  </div>
                </div>
              </div>
            </CardContentComponent>
          </CardComponent>
        )}

        {/* Mapa principal - sin título */}
        <CardComponent>
          <CardContentComponent className="p-0">
            {/* Mapa interactivo a pantalla completa */}
            <div className="h-96 w-full">
              {formData.latitude && formData.longitude ? (
                <DynamicMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  address={formData.address}
                  cityName={selectedCity?.name || resolvedCityName}
                  cityLat={selectedCity?.latitude}
                  cityLng={selectedCity?.longitude}
                  strictCitySearch={true}
                  height="h-96"
                  searchable={true}
                  onLocationChange={(lat: number, lng: number) => {
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                  }}
                  onAddressChange={(address: string) => {
                    setFormData(prev => ({ ...prev, address }));
                  }}
                  className="rounded-t-none"
                />
              ) : (
                <div className="h-96 w-full bg-[color:var(--sp-surface-variant)] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-[color:var(--sp-on-surface-variant)]">Selecciona una ciudad para ver el mapa</p>
                  </div>
                </div>
              )}
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Información adicional */}
        <CardComponent>
          <CardContentComponent>
            
            {/* Información de la ubicación seleccionada */}
            {selectedCity && formData.latitude && formData.longitude && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
                  <h4 className="font-semibold text-[color:var(--sp-info-800)] text-sm mb-2">📍 Ubicación</h4>
                  <p className="text-xs text-[color:var(--sp-info-700)]">{selectedCity.name}</p>
                  <p className="text-xs text-[color:var(--sp-info-600)]">{selectedDepartment?.name}</p>
                  {selectedCity.is_capital && <p className="text-xs text-[color:var(--sp-info-600)]">🏛️ Capital</p>}
                </div>
                
                <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-4">
                  <h4 className="font-semibold text-[color:var(--sp-success-800)] text-sm mb-2">🌐 Coordenadas</h4>
                  <p className="text-xs text-[color:var(--sp-success-700)]">Lat: {formData.latitude.toFixed(4)}</p>
                  <p className="text-xs text-[color:var(--sp-success-700)]">Lng: {formData.longitude.toFixed(4)}</p>
                </div>
                
                {selectedCity.population && (
                  <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4">
                    <h4 className="font-semibold text-[color:var(--sp-warning-800)] text-sm mb-2">👥 Población</h4>
                    <p className="text-xs text-[color:var(--sp-warning-700)]">{selectedCity.population.toLocaleString()}</p>
                    <p className="text-xs text-[color:var(--sp-warning-600)]">habitantes</p>
                  </div>
                )}
              </div>
            )}
          </CardContentComponent>
        </CardComponent>
        {/* Botones de navegación */}
        <CardComponent>
          <CardContentComponent>
            <div className="flex justify-between items-center">
              <ButtonComponent variant="outline" onClick={handleBack} className="flex items-center gap-2">← Información General</ButtonComponent>
              <ButtonComponent
                onClick={() => {
                  console.log('🖱️ Botón "Continuar a Horarios" clickeado');
                  console.log('📊 Estado actual:', { saving, isFormValid, formData });
                  handleSave();
                }}
                disabled={saving || !isFormValid}
                variant={isFormValid ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                {saving ? "Guardando..." : isFormValid ? "Continuar a Horarios →" : "Completa la ubicación"}
              </ButtonComponent>
            </div>
          </CardContentComponent>
        </CardComponent>
      </div>
    </div>
  );
}
