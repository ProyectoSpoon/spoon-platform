'use client';

import React, { useEffect, useRef } from 'react';
import { InputV2, ButtonV2, SelectV2, SpinnerV2, AlertV2 } from '@spoon/shared';
import { FormCard } from '@spoon/shared';
import { InlineEditButton } from '@spoon/shared';
import { useGeographicData, type Country, type Department, type City } from '../../../hooks/useGeographicData';

interface UbicacionData {
  address: string;
  country_id: string;
  department_id: string;
  city_id: string;
  latitude?: number;
  longitude?: number;
}

interface UbicacionFormProps {
  formData: UbicacionData;
  onChange: (field: keyof UbicacionData, value: string | number) => void;
  onSubmit: () => void;
  saving: boolean;
  readOnly?: boolean;
  showSave?: boolean;
  onCancel?: () => void;
  onToggleEdit?: () => void;
}

export function UbicacionForm({
  formData,
  onChange,
  onSubmit,
  saving,
  readOnly = false,
  showSave = true,
  onCancel,
  onToggleEdit,
}: UbicacionFormProps): JSX.Element {
  // Usar el hook personalizado para datos geográficos
  const {
    countries,
    departments,
    cities,
    loading: loadingGeoData,
    error: geoError,
    loadDepartments,
    loadCities,
    getCityCoordinates,
  } = useGeographicData();

  // Efectos para cargar datos en cascada
  useEffect(() => {
    if (formData.country_id) {
      loadDepartments(formData.country_id);
    }
  }, [formData.country_id, loadDepartments]);

  useEffect(() => {
    if (formData.department_id) {
      loadCities(formData.department_id);
    }
  }, [formData.department_id, loadCities]);

  // Obtener datos de la ciudad y departamento seleccionados
  const selectedCity = cities.find(city => city.id === formData.city_id);
  const selectedDepartment = departments.find(dept => dept.id === formData.department_id);

  // Actualizar coordenadas cuando cambia la ciudad
  const lastCoordsRef = useRef<{lat?: number; lon?: number}>({});
  useEffect(() => {
    if (formData.city_id) {
      const coordinates = getCityCoordinates(formData.city_id);
      if (coordinates.latitude && coordinates.longitude) {
        const sameLat = lastCoordsRef.current.lat === coordinates.latitude;
        const sameLon = lastCoordsRef.current.lon === coordinates.longitude;
        if (!sameLat) onChange('latitude', coordinates.latitude);
        if (!sameLon) onChange('longitude', coordinates.longitude);
        lastCoordsRef.current = { lat: coordinates.latitude, lon: coordinates.longitude };
      }
    }
  }, [formData.city_id, getCityCoordinates, onChange]);

  // Auto-seleccionar Colombia si está disponible y no hay país seleccionado
  const autoCountryRef = useRef(false);
  useEffect(() => {
    if (autoCountryRef.current) return;
    if (countries.length > 0 && !formData.country_id) {
      const colombia = countries.find(c => c.code === 'COL' || c.code === 'CO');
      if (colombia) {
        autoCountryRef.current = true; // solo una vez
        onChange('country_id', colombia.id);
      }
    }
  }, [countries, formData.country_id, onChange]);

  // Limpiar selecciones dependientes cuando cambia país
  const handleCountryChange = (value: string) => {
    onChange('country_id', value);
    onChange('department_id', '');
    onChange('city_id', '');
    // Ya no forzamos Bogotá. Mantenemos coordenadas actuales hasta que el usuario seleccione nueva ciudad.
  };

  // Limpiar ciudades cuando cambia departamento
  const handleDepartmentChange = (value: string) => {
    onChange('department_id', value);
    onChange('city_id', '');
    // No reseteamos a Bogotá; se actualizará cuando se elija la nueva ciudad.
  };

  return (
    <FormCard readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
      {/* Acción editar en línea */}
      {onToggleEdit && (
        <div className="flex justify-end mb-3">
          <InlineEditButton onClick={onToggleEdit} editing={!readOnly} label="Editar ubicación" />
        </div>
      )}

      {/* Mostrar error de datos geográficos */}
      {geoError && (
        <AlertV2 variant="error" className="mb-4">
          ⚠️ Error cargando datos geográficos: {geoError}
        </AlertV2>
      )}

      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); }}>
        {/* País oculto - solo Colombia */}
        <input type="hidden" name="country_id" value={formData.country_id} />
        
        {/* Departamento y Ciudad en la misma fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <SelectV2
              label="Departamento"
              name="department_id"
              value={formData.department_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDepartmentChange(e.target.value)}
              requiredMark
              disabled={readOnly || !formData.country_id}
              helperText={loadingGeoData && departments.length === 0 && formData.country_id ? "Cargando departamentos..." : "Selecciona el departamento"}
            >
              <option value="">
                {!formData.country_id 
                  ? 'Primero selecciona país' 
                  : loadingGeoData 
                  ? 'Cargando departamentos...'
                  : 'Selecciona departamento'
                }
              </option>
              {departments.map((dept: Department) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </SelectV2>
            {loadingGeoData && departments.length === 0 && formData.country_id && (
              <div className="flex items-center gap-2 mt-2">
                <SpinnerV2 size="sm" />
                <span className="text-sm text-[color:var(--sp-on-surface-variant)]">Cargando departamentos...</span>
              </div>
            )}
          </div>

          <div>
            <SelectV2
              label="Ciudad"
              name="city_id"
              value={formData.city_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('city_id', e.target.value)}
              requiredMark
              disabled={readOnly || !formData.department_id}
              helperText={loadingGeoData && cities.length === 0 && formData.department_id ? "Cargando ciudades..." : "Selecciona la ciudad"}
            >
              <option value="">
                {!formData.department_id 
                  ? 'Primero selecciona departamento' 
                  : loadingGeoData 
                  ? 'Cargando ciudades...'
                  : 'Selecciona ciudad'
                }
              </option>
              {cities.map((city: City) => (
                <option key={city.id} value={city.id}>
                  {city.name} {city.is_capital ? '(Capital)' : ''}
                </option>
              ))}
            </SelectV2>
            {loadingGeoData && cities.length === 0 && formData.department_id && (
              <div className="flex items-center gap-2 mt-2">
                <SpinnerV2 size="sm" />
                <span className="text-sm text-[color:var(--sp-on-surface-variant)]">Cargando ciudades...</span>
              </div>
            )}
          </div>
        </div>

        {/* Información oculta - las coordenadas se manejan internamente */}
        
        {/* Solo mostrar botón de guardar en contextos específicos (no en el flujo principal) */}
        {showSave && onCancel && (
          <div className="flex gap-3 pt-4 border-t border-[color:var(--sp-border)]">
            <ButtonV2 
              type="submit" 
              disabled={saving || readOnly || loadingGeoData} 
              size="sm"
              variant="primary"
            >
              {saving ? 'Guardando...' : 'Guardar ubicación'}
            </ButtonV2>
            <ButtonV2 type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancelar
            </ButtonV2>
          </div>
        )}
      </form>
    </FormCard>
  );
}
