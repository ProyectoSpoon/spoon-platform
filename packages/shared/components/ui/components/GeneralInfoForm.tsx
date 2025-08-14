import React from 'react';
import { Input, Button, InputV2, FormSection } from '@spoon/shared';
import { FormCard } from '@spoon/shared';
import { InlineEditButton } from '@spoon/shared';
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
  /**
   * Activa la nueva UI basada en tokens y patrones (FormSection + InputV2)
   */
  useNewUI?: boolean;
}
export const GeneralInfoForm: React.FC<GeneralInfoFormProps> = ({
  formData,
  onChange,
  onSubmit,
  saving,
  errors = {},
  helperText = {},
  cuisineTypes = [],
  readOnly = false,
  showSave = true,
  onCancel,
  onToggleEdit,
  useNewUI = false,
}: GeneralInfoFormProps) => {
  if (useNewUI) {
    return (
      <FormSection
        title="Información General"
        description="Datos básicos de tu restaurante"
        readonly={readOnly}
        onEdit={onToggleEdit}
        onSubmit={onSubmit}
        onCancel={onCancel}
        saving={saving}
        showSave={showSave}
        saveText="Guardar"
        cancelText="Cancelar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputV2
              label="Nombre del restaurante"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Ej: La Cocina de María"
              requiredMark
              errorMessage={errors.name}
              readOnly={readOnly}
            />
          </div>

          <div className="md:col-span-2">
            <InputV2
              label="Descripción"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Breve descripción de tu restaurante..."
              errorMessage={errors.description}
              readOnly={readOnly}
            />
          </div>

          <InputV2
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+57 300 123 4567"
            errorMessage={errors.phone}
            readOnly={readOnly}
          />

          <InputV2
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="contacto@restaurante.com"
            errorMessage={errors.email}
            readOnly={readOnly}
          />

          <div className="md:col-span-2">
            {cuisineTypes.length > 0 ? (
              <div className="mb-1">
                <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Tipo de cocina</label>
                <select
                  value={formData.cuisineType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('cuisineType', e.target.value)}
                  className="w-full h-10 px-4 rounded-lg border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)]"
                  disabled={readOnly}
                >
                  <option value="">Selecciona el tipo de cocina</option>
                  {cuisineTypes.map((type) => (
                    <option key={type.id} value={type.slug ?? type.id}>
                      {type.icon ? `${type.icon} ` : ''}
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.cuisineType ? (
                  <p className="text-sm text-[color:var(--sp-error)] mt-2">{errors.cuisineType}</p>
                ) : helperText.cuisineType ? (
                  <p className="text-sm text-[color:var(--sp-neutral-500)] mt-2">{helperText.cuisineType}</p>
                ) : null}
              </div>
            ) : (
              <InputV2
                label="Tipo de cocina"
                value={formData.cuisineType}
                onChange={(e) => onChange('cuisineType', e.target.value)}
                placeholder="Ej: Italiana, Mexicana, Asiática..."
                errorMessage={errors.cuisineType}
                readOnly={readOnly}
              />
            )}
          </div>
        </div>
      </FormSection>
    );
  }

  // UI legacy (FormCard + Input)
  return (
    <FormCard readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
      {/* Acción editar en línea */}
      {onToggleEdit && (
        <div className="flex justify-end mb-3">
          <InlineEditButton onClick={onToggleEdit} editing={!readOnly} label="Editar información general" />
        </div>
      )}
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          onSubmit();
        }}
      >
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
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Tipo de cocina</label>
            <select
              value={formData.cuisineType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('cuisineType', e.target.value)}
              className="w-full p-3 border border-[color:var(--sp-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:border-[color:var(--sp-focus)] bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)]"
              disabled={readOnly}
            >
              <option value="">Selecciona el tipo de cocina</option>
              {cuisineTypes.map((type) => (
                <option key={type.id} value={type.slug}>
                  {type.icon ? `${type.icon} ` : ''}
                  {type.name}
                </option>
              ))}
            </select>
            {helperText.cuisineType && <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">{helperText.cuisineType}</p>}
            {errors.cuisineType && <p className="text-xs text-[color:var(--sp-error-600)] mt-1">{errors.cuisineType}</p>}
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
};
