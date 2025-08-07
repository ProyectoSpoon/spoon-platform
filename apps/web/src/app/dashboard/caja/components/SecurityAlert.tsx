// packages/shared/caja/components/SecurityAlert.tsx
import React from 'react';
import { AlertTriangle, Shield, DollarSign } from 'lucide-react';

interface SecurityAlertProps {
  type: 'warning' | 'info' | 'error';
  title: string;
  messages: string[];
  limits?: {
    current: number;
    limit: number;
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
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <Shield className="w-5 h-5 text-red-500" />;
      default: return <DollarSign className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatearMonto = (centavos: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(centavos / 100);
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
          
          {messages.map((message, index) => (
            <p key={index} className="text-sm text-gray-700 mb-1">
              • {message}
            </p>
          ))}
          
          {limits && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="text-xs text-gray-500 mb-1">{limits.label}</div>
              <div className="flex justify-between text-sm">
                <span>Actual: <strong>{formatearMonto(limits.current)}</strong></span>
                <span>Límite: <strong>{formatearMonto(limits.limit)}</strong></span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (limits.current / limits.limit) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};