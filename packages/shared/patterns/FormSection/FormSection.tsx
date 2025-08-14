import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ButtonV2 } from '../../components/ui/ButtonV2';
import { cn } from '../../lib/utils';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  readonly?: boolean;
  onEdit?: () => void;
  showSave?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  saveText?: string;
  cancelText?: string;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  readonly = false,
  onEdit,
  showSave = true,
  onSubmit,
  onCancel,
  saving = false,
  saveText = 'Guardar',
  cancelText = 'Cancelar',
  className,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || description || (readonly && onEdit)) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {title && <CardTitle className="text-xl font-semibold text-[color:var(--sp-neutral-800)]">{title}</CardTitle>}
            {description && <p className="text-sm text-[color:var(--sp-neutral-600)]">{description}</p>}
          </div>
          {readonly && onEdit && (
            <ButtonV2 variant="outline" size="sm" onClick={onEdit} className="shrink-0">
              Editar
            </ButtonV2>
          )}
        </CardHeader>
      )}

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}
          {!readonly && showSave && (onSubmit || onCancel) && (
            <div className="flex gap-3 pt-6 border-t border-[color:var(--sp-neutral-200)]">
              {onSubmit && (
                <ButtonV2 type="submit" loading={saving} disabled={saving} className="min-w-[120px]">
                  {saveText}
                </ButtonV2>
              )}
              {onCancel && (
                <ButtonV2 type="button" variant="secondary" onClick={onCancel} disabled={saving}>
                  {cancelText}
                </ButtonV2>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
