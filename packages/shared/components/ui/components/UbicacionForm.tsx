import React from 'react';
import { Input, Button } from '@spoon/shared';
import { FormCard } from '@spoon/shared';
import { InlineEditButton } from '@spoon/shared';
import { Pencil } from 'lucide-react';

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
  countries: Country[];
  departments: Department[];
  cities: City[];
  loadingGeoData?: boolean;
  readOnly?: boolean;
  showSave?: boolean;
  onCancel?: () => void;
  onToggleEdit?: () => void;
}

export const UbicacionForm: React.FC<UbicacionFormProps> = ({
  formData,
  onChange,
  onSubmit,
  saving,
  countries,
  departments,
  cities,
  loadingGeoData = false,
  readOnly = false,
  showSave = true,
  onCancel,
  onToggleEdit,
}: UbicacionFormProps) => (
  <FormCard readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
      {/* Acción editar en línea */}
      {onToggleEdit && (
        <div className="flex justify-end mb-3">
          <InlineEditButton onClick={onToggleEdit} editing={!readOnly} label="Editar ubicación" />
        </div>
      )}
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); }}>
        <Input
      label="Dirección Completa *"
      name="address"
      value={formData.address}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('address', e.target.value)}
      placeholder="Ej: Carrera 15 #85-32, Chapinero"
      helperText="Incluye número, nombre de la calle y barrio"
      required
      variant={readOnly ? 'readOnly' : 'default'}
    />
        <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
          <select
        name="country_id"
        value={formData.country_id}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('country_id', e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-300 disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200 disabled:cursor-default disabled:focus:ring-0"
        required
        disabled={readOnly}
      >
        <option value="">Selecciona país</option>
        {countries.map((country: Country) => (
          <option key={country.id} value={country.id}>
            {country.name} ({country.phone_code})
          </option>
        ))}
          </select>
        </div>
        <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
          <select
        name="department_id"
        value={formData.department_id}
        onChange={e => onChange('department_id', e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-300 disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200 disabled:cursor-default disabled:focus:ring-0"
        required
        disabled={readOnly}
      >
        <option value="">Selecciona departamento</option>
        {departments.map((dept: Department) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
          </select>
          {loadingGeoData && departments.length === 0 && (
            <span className="ml-2 text-xs text-blue-600">(Cargando...)</span>
          )}
        </div>
        <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
          <select
        name="city_id"
        value={formData.city_id}
        onChange={e => onChange('city_id', e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-300 disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200 disabled:cursor-default disabled:focus:ring-0"
        required
        disabled={readOnly}
      >
        <option value="">Selecciona ciudad</option>
        {cities.map((city: City) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
          </select>
          {loadingGeoData && cities.length === 0 && (
            <span className="ml-2 text-xs text-blue-600">(Cargando...)</span>
          )}
        </div>
    {showSave && (
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={saving || readOnly} size="sm">
              {saving ? 'Guardando...' : 'Guardar ubicación'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </form>
  </FormCard>
);
