"use client";
import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

// Type casting for React type conflicts
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;

export const SidebarResumen: React.FC<{
  balance: number;
  ventas: number;
  gastos: number;
  ordenes: number;
  estadisticas?: Array<{ label: string; value: string }>;
  alertas?: Array<{ label: string; tipo: 'info' | 'warning' | 'success' }>;
  actividad?: Array<{ label: string; value?: string }>;
}> = ({ balance, ventas, gastos, ordenes, estadisticas = [], alertas = [], actividad = [] }) => {
  const fmt = (v:number) => formatCurrencyCOP(v);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
  <CardComponent><CardContentComponent className="p-4"><p className="text-xs text-[color:var(--sp-neutral-500)]">BALANCE</p><p className="text-xl font-bold text-[color:var(--sp-info-700)]">{fmt(balance)}</p></CardContentComponent></CardComponent>
  <CardComponent><CardContentComponent className="p-4"><p className="text-xs text-[color:var(--sp-neutral-500)]">VENTAS</p><p className="text-xl font-bold text-[color:var(--sp-success-700)]">{fmt(ventas)}</p></CardContentComponent></CardComponent>
  <CardComponent><CardContentComponent className="p-4"><p className="text-xs text-[color:var(--sp-neutral-500)]">GASTOS</p><p className="text-xl font-bold text-[color:var(--sp-error-700)]">{fmt(gastos)}</p></CardContentComponent></CardComponent>
  <CardComponent><CardContentComponent className="p-4"><p className="text-xs text-[color:var(--sp-neutral-500)]">ÓRDENES</p><p className="text-xl font-bold text-[color:var(--sp-primary-700)]">{ordenes}</p></CardContentComponent></CardComponent>
      </div>

      {estadisticas.length > 0 && (
        <CardComponent>
          <CardContentComponent className="p-4 space-y-2">
            <p className="text-sm font-semibold">📊 Estadísticas Rápidas</p>
    <div className="grid grid-cols-2 gap-3">
              {estadisticas.map((e, i) => (
                <div key={i} className="text-xs">
      <p className="text-[color:var(--sp-neutral-500)]">{e.label}</p>
      <p className="font-medium text-[color:var(--sp-neutral-800)]">{e.value}</p>
                </div>
              ))}
            </div>
          </CardContentComponent>
        </CardComponent>
      )}

      {alertas.length > 0 && (
        <CardComponent>
          <CardContentComponent className="p-4 space-y-2">
            <p className="text-sm font-semibold">⚠️ Alertas y Notificaciones</p>
            {alertas.map((a, i) => (
              <div key={i} className={`text-xs px-3 py-2 rounded border ${a.tipo==='warning'?'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)] text-[color:var(--sp-warning-800)]': a.tipo==='success'?'bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-200)] text-[color:var(--sp-success-800)]':'bg-[color:var(--sp-neutral-50)] border-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-700)]'}`}>
                {a.label}
              </div>
            ))}
          </CardContentComponent>
        </CardComponent>
      )}

      {actividad.length > 0 && (
        <CardComponent>
          <CardContentComponent className="p-4 space-y-2">
            <p className="text-sm font-semibold">🕒 Actividad Reciente</p>
            <div className="space-y-2 text-sm">
              {actividad.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[color:var(--sp-neutral-700)]">{r.label}</span>
                  {r.value && <span className="text-[color:var(--sp-success-700)] font-medium">{r.value}</span>}
                </div>
              ))}
            </div>
          </CardContentComponent>
        </CardComponent>
      )}
    </div>
  );
};


