'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, getUserRestaurant, supabase } from "@spoon/shared";
import { Button, Card, CardHeader, CardTitle, CardContent, toast } from "@spoon/shared";
import { UbicacionForm } from "@spoon/shared/components/ui/components/UbicacionForm";

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
  <div className="h-64 w-full bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-inner relative overflow-hidden">
    {/* ...mapa visual... */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-green-500 rounded-full"></div>
      <div className="absolute bottom-20 left-24 w-12 h-12 bg-orange-500 rounded-full"></div>
      <div className="absolute bottom-32 right-32 w-14 h-14 bg-purple-500 rounded-full"></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg border-2 border-red-500 whitespace-nowrap max-w-48">
          <div className="text-xs font-semibold text-gray-800 truncate">{address || "Tu restaurante aquí"}</div>
          <div className="text-xs text-gray-500">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">📍 Spoon Maps</div>
  </div>
);

export default function UbicacionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UbicacionData>({
    address: "",
    country_id: "",
    department_id: "",
    city_id: "",
    latitude: 4.6097102,
    longitude: -74.081749,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingGeoData, setLoadingGeoData] = useState(false);

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

  // Ejemplo de fetch simulado (reemplaza por tu lógica real)
  useEffect(() => {
    async function fetchData() {
      try {
        // ...aquí tu lógica real de fetch de usuario, restaurante, países, etc...
        // Si todo sale bien:
        setLoading(false);
      } catch (err: any) {
        setError("Error al cargar los datos. Intenta nuevamente.");
        setLoading(false);
        console.error("Error de carga:", err);
      }
    }
    fetchData();
  }, []);

  // ...existing code for loading countries, departments, cities, and restaurant data...

  // Validación y handlers
  const validateForm = (): boolean => {
    if (!formData.address.trim()) return toast.error("La dirección es requerida"), false;
    if (!formData.country_id) return toast.error("Selecciona un país"), false;
    if (!formData.department_id) return toast.error("Selecciona un departamento"), false;
    if (!formData.city_id) return toast.error("Selecciona una ciudad"), false;
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      if (!restaurantId) return toast.error("No se encontró información del restaurante");
      const { error } = await supabase.from("restaurants").update({
        address: formData.address,
        country_id: formData.country_id,
        department_id: formData.department_id,
        city_id: formData.city_id,
        latitude: formData.latitude,
        longitude: formData.longitude,
        city: cities.find((c) => c.id === formData.city_id)?.name || "",
        state: departments.find((d) => d.id === formData.department_id)?.name || "",
        country: countries.find((c) => c.id === formData.country_id)?.name || "",
        updated_at: new Date().toISOString(),
      }).eq("id", restaurantId);
      if (error) throw error;
      toast.success("Ubicación guardada correctamente");
      router.push("/config-restaurante/horario-comercial");
    } catch {
      toast.error("Error al guardar la ubicación");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => router.push("/config-restaurante/informacion-general");
  const isFormValid = formData.address.trim() && formData.country_id && formData.department_id && formData.city_id;
  const selectedCountry = countries.find((c) => c.id === formData.country_id);
  const selectedDepartment = departments.find((d) => d.id === formData.department_id);
  const selectedCity = cities.find((c) => c.id === formData.city_id);

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
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-700 font-semibold mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Recargar página</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">← Volver</Button>
              <div className="text-center flex-1">
                <span className="text-sm text-gray-500 font-medium">Paso 2 de 4</span>
              </div>
              <div className="w-20"></div>
            </div>
            <CardTitle>Ubicación del Restaurante</CardTitle>
            <p className="text-gray-600">¿Dónde está ubicado tu restaurante?</p>
            {userInfo && (
              <p className="text-xs text-blue-600 mt-2">👤 {userInfo.email} • {restaurantId ? `ID: ${restaurantId.slice(0, 8)}...` : "Configurando..."}</p>
            )}
          </CardHeader>
        </Card>
        {/* Formulario y mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <UbicacionForm
                formData={formData}
                onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
                onSubmit={handleSave}
                saving={saving}
                countries={countries}
                departments={departments}
                cities={cities}
                loadingGeoData={loadingGeoData}
              />
              {isFormValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Previsualización del Mapa</CardTitle>
              <p className="text-sm text-gray-600">Las coordenadas se obtienen automáticamente de la base de datos geográfica</p>
            </CardHeader>
            <CardContent>
              <MapaSimple
                lat={formData.latitude || 4.6097102}
                lng={formData.longitude || -74.081749}
                address={formData.address ? `${formData.address}${selectedCity ? `, ${selectedCity.name}` : ""}` : ""}
              />
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
          <CardContent>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">← Información General</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !isFormValid}
                variant={isFormValid ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                {saving ? "Guardando..." : isFormValid ? "Continuar a Horarios →" : "Completa la ubicación"}
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Info de ayuda */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-800">Ubicación Geográfica</h3>
                <p className="text-sm text-blue-700">Esta información ayudará a los clientes a encontrar tu restaurante fácilmente.</p>
                <p className="text-xs text-blue-600 mt-1">💡 Los datos geográficos se cargan desde nuestra base de datos actualizada de Colombia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ...existing code... */}
      </div>
    </div>
  );
}