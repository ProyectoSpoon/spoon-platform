import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
    disabled?: boolean;
  }>;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actions = [],
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
  <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-2">{title}</h3>
  <p className="text-[color:var(--sp-neutral-600)] mb-6 max-w-sm mx-auto">{subtitle}</p>
      
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Estados predefinidos comunes
export const EmptyStates = {
  ordensPendientes: (onNuevaVenta?: () => void) => (
    <EmptyState
      icon="💰"
      title="No hay órdenes pendientes"
      subtitle="Todas las órdenes han sido procesadas"
      actions={onNuevaVenta ? [
        { label: 'Nueva venta', onClick: onNuevaVenta, variant: 'default' as const }
      ] : []}
    />
  ),

  ingresos: () => (
    <EmptyState
      icon="💵"
      title="No hay ingresos registrados"
      subtitle="Los pagos procesados aparecerán aquí"
    />
  ),

  gastos: (onNuevoGasto?: () => void) => (
    <EmptyState
      icon="💸"
      title="No hay gastos registrados"
      subtitle="Los gastos que registres aparecerán aquí"
      actions={onNuevoGasto ? [
        { label: 'Registrar gasto', onClick: onNuevoGasto, variant: 'outline' as const }
      ] : []}
    />
  ),

  cajaAbierta: (onAbrirCaja: () => void) => (
    <EmptyState
      icon="🏪"
      title="Caja Cerrada"
      subtitle="Abre la caja para comenzar a procesar pagos"
      actions={[
        { label: 'Abrir caja', onClick: onAbrirCaja, variant: 'default' as const }
      ]}
    />
  ),

  noRegistros: () => (
    <EmptyState
      icon="💾"
      title="Aún no tienes registros creados en esta fecha"
      subtitle="Empieza agregando uno con las acciones de 'Nueva venta' y 'Nuevo gasto'"
    />
  ),

  errorConexion: (onReintentar: () => void) => (
    <EmptyState
      icon="⚠️"
      title="Error de conexión"
      subtitle="No se pudieron cargar los datos. Revisa tu conexión e intenta nuevamente"
      actions={[
        { label: 'Reintentar', onClick: onReintentar, variant: 'outline' as const }
      ]}
    />
  ),

  sinPermisos: () => (
    <EmptyState
      icon="🔒"
      title="Sin permisos"
      subtitle="No tienes permisos para ver esta información. Contacta al administrador"
    />
  ),

  proximamente: () => (
    <EmptyState
      icon="🚧"
      title="Próximamente"
      subtitle="Esta funcionalidad estará disponible en una próxima actualización"
    />
  )
};