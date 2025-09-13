// packages/shared/caja/components/SecurityAlert.tsx
import React from 'react';
import { AlertTriangle, Shield, DollarSign } from 'lucide-react';

// Type casting for React type conflicts
const AlertTriangleComponent = AlertTriangle as any;
const ShieldComponent = Shield as any;
const DollarSignComponent = DollarSign as any;

interface SecurityAlertProps {
  type: 'warning' | 'info' | 'error';
  title: string;
  messages: string[];
  limits?: {
    current: number; // pesos
    limit: number;   // pesos
    label: string;
  };
  onDismiss?: () => void;
}

export const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  messages,
  limits,
  onDismiss
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangleComponent className="w-5 h-5 text-[color:var(--sp-warning-500)]" />;
      case 'error': return <ShieldComponent className="w-5 h-5 text-[color:var(--sp-error-500)]" />;
      default: return <DollarSignComponent className="w-5 h-5 text-[color:var(--sp-info-500)]" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning': return 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)]';
      case 'error': return 'bg-[color:var(--sp-error-50)] border-[color:var(--sp-error-200)]';
      default: return 'bg-[color:var(--sp-info-50)] border-[color:var(--sp-info-200)]';
    }
  };

  const formatearMonto = (pesos: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(pesos);
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">{title}</h3>
          {messages.map((message, index) => (
            <p key={index} className="text-sm text-[color:var(--sp-neutral-700)] mb-1">
              • {message}
            </p>
          ))}
          {limits && (
            <div className="mt-3 p-3 bg-[color:var(--sp-surface-elevated)] rounded border">
              <div className="text-xs text-[color:var(--sp-neutral-500)] mb-1">{limits.label}</div>
              <div className="flex justify-between text-sm">
                <span>Actual: <strong>{formatearMonto(limits.current)}</strong></span>
                <span>Límite: <strong>{formatearMonto(limits.limit)}</strong></span>
              </div>
              <div className="w-full bg-[color:var(--sp-neutral-200)] rounded-full h-2 mt-2">
                <div
                  className="bg-[color:var(--sp-info-600)] h-2 rounded-full"
                  style={{ width: `${Math.min(100, (limits.current / limits.limit) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[color:var(--sp-neutral-400)] hover:text-[color:var(--sp-neutral-600)]"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};