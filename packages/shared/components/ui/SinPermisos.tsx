import React from 'react';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { ButtonV2 } from '@spoon/shared/components/ui/ButtonV2';

interface SinPermisosProps {
  titulo?: string;
  mensaje?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const SinPermisos: React.FC<SinPermisosProps> = ({
  titulo = "Acceso Restringido",
  mensaje = "No tienes permisos suficientes para acceder a esta sección.",
  showBackButton = false,
  onBack,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center max-w-md mx-auto">
        {/* Icono principal */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-[color:var(--sp-error-100)] rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-[color:var(--sp-error-600)]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[color:var(--sp-error-600)] rounded-full flex items-center justify-center">
            <Lock className="h-4 w-4 text-[color:var(--sp-neutral-0)]" />
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[color:var(--sp-neutral-900)]">
            {titulo}
          </h2>
          
          <p className="text-[color:var(--sp-neutral-600)] leading-relaxed">
            {mensaje}
          </p>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg text-sm text-[color:var(--sp-warning-800)]">
              <Shield className="h-4 w-4" />
              Contacta al administrador si necesitas acceso
            </div>
          </div>

          {/* Botón de regreso opcional */}
      {showBackButton && (
            <div className="pt-4">
        <ButtonV2
                variant="outline"
                onClick={onBack || (() => window.history.back())}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Regresar
        </ButtonV2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};