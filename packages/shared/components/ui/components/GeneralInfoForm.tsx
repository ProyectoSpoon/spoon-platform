import React from 'react';
import { Input, Button } from '@spoon/shared';
import { FormCard } from '@spoon/shared';
import { InlineEditButton } from '@spoon/shared';
import { Pencil } from 'lucide-react';
import { RestaurantInfo } from '../hooks/useRestaurantForm';

interface GeneralInfoFormProps {
  readOnly?: boolean;
  showSave?: boolean;
  onCancel?: () => void;
  onToggleEdit?: () => void;
  formData: RestaurantInfo;
  onChange: (field: keyof RestaurantInfo, value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  errors?: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    cuisineType?: string;
  };
  helperText?: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    cuisineType?: string;
  };
  cuisineTypes?: Array<{ id: string; name: string; slug: string; icon?: string }>;
}

export const GeneralInfoForm: React.FC<GeneralInfoFormProps> = ({ formData, onChange, onSubmit, saving, errors = {}, helperText = {}, cuisineTypes = [], readOnly = false, showSave = true, onCancel, onToggleEdit }: GeneralInfoFormProps) => (
  <FormCard readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
      {/* Acción editar en línea */}
      {onToggleEdit && (
        <div className="flex justify-end mb-3">
          <InlineEditButton onClick={onToggleEdit} editing={!readOnly} label="Editar información general" />
        </div>
      )}
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); }}>
        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value)}
          required
          helperText={helperText.name}
          error={!!errors.name}
          variant={readOnly ? 'readOnly' : 'default'}
        />
        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('description', e.target.value)}
          helperText={helperText.description}
          error={!!errors.description}
          variant={readOnly ? 'readOnly' : 'default'}
        />
        <Input
          label="Teléfono"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('phone', e.target.value)}
          helperText={helperText.phone}
          error={!!errors.phone}
          variant={readOnly ? 'readOnly' : 'default'}
        />
        <Input
          label="Email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('email', e.target.value)}
          helperText={helperText.email}
          error={!!errors.email}
          variant={readOnly ? 'readOnly' : 'default'}
        />
        {cuisineTypes.length > 0 ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cocina</label>
            <select
              value={formData.cuisineType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('cuisineType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={readOnly}
            >
              <option value="">Selecciona el tipo de cocina</option>
              {cuisineTypes.map((type) => (
                <option key={type.id} value={type.slug}>
                  {type.icon ? `${type.icon} ` : ''}{type.name}
                </option>
              ))}
            </select>
            {helperText.cuisineType && <p className="text-xs text-gray-500 mt-1">{helperText.cuisineType}</p>}
            {errors.cuisineType && <p className="text-xs text-red-600 mt-1">{errors.cuisineType}</p>}
          </div>
        ) : (
          <Input
            label="Tipo de cocina"
            value={formData.cuisineType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('cuisineType', e.target.value)}
            helperText={helperText.cuisineType}
            error={!!errors.cuisineType}
            variant={readOnly ? 'readOnly' : 'default'}
          />
        )}
    {showSave && (
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? 'Guardando...' : 'Guardar'}
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
