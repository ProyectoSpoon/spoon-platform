'use client';

import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { Shield } from 'lucide-react';
import { useSecurityLimits } from '../hooks/useSecurityLimits';

interface SecurityPanelProps {
  ventasTotalesPesos: number; // Total de ventas del día en pesos
  className?: string;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ 
  ventasTotalesPesos, 
  className = '' 
}) => {
  const { limits, loading } = useSecurityLimits();

  // Local casts to avoid React type duplication issues in monorepo
  const CardComponent = Card as any;
  const CardContentComponent = CardContent as any;
  const ShieldIcon = Shield as any;

  if (loading || !limits) {
    return (
      <CardComponent className={`border-l-4 border-l-blue-500 ${className}`}>
        <CardContentComponent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Límites de Seguridad</h3>
              <p className="text-xs text-gray-500">Cargando controles...</p>
            </div>
          </div>
        </CardContentComponent>
      </CardComponent>
    );
  }

  // Los límites ya vienen en PESOS desde el hook
  const limitesDiarioPesos = limits.limite_diario_cajero;
  const limiteTransaccionPesos = limits.limite_transaccion_normal;
  const limiteEfectivoPesos = limits.limite_transaccion_efectivo;

  const porcentajeUsado = limitesDiarioPesos > 0
    ? (ventasTotalesPesos / limitesDiarioPesos) * 100
    : 0;

  const formatPesos = (pesos: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(pesos);
  };

  const getColorByPercentage = (percentage: number) => {
    if (percentage > 80) return { bg: 'bg-red-500', text: 'text-red-600' };
    if (percentage > 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bg: 'bg-green-500', text: 'text-green-600' };
  };

  const colors = getColorByPercentage(porcentajeUsado);

  return (
    <CardComponent className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardContentComponent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Límites de Seguridad</h3>
            <p className="text-xs text-gray-500">Controles automáticos</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Barra de progreso de ventas diarias */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Ventas del día</span>
              <span className={`font-medium ${colors.text}`}>
                {Math.round(porcentajeUsado)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors.bg}`}
                style={{ width: `${Math.min(100, porcentajeUsado)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatPesos(ventasTotalesPesos)}</span>
              <span>{formatPesos(limitesDiarioPesos)}</span>
            </div>
          </div>

          {/* Resumen de límites */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Límite por transacción:</span>
              <span>{formatPesos(limiteTransaccionPesos)}</span>
            </div>
            <div className="flex justify-between">
              <span>Límite efectivo:</span>
              <span>{formatPesos(limiteEfectivoPesos)}</span>
            </div>
          </div>
        </div>
      </CardContentComponent>
    </CardComponent>
  );
};