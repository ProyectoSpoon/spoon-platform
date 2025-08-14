"use client";
import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

export const SidebarResumen: React.FC<{
  balance: number;
  ventas?: number;
  gastos?: number;
  ordenes: number;
  metaDelDia?: string | number;
  variacionVsAyer?: string | number;
  variant?: 'default' | 'caja';
  estadisticas?: Array<{ label: string; value: string }>;
  alertas?: Array<{ label: string; tipo: 'info' | 'warning' | 'success' }>;
  actividad?: Array<{ label: string; value?: string }>;
}> = ({ balance, ventas = 0, gastos = 0, ordenes, metaDelDia, variacionVsAyer, variant = 'default', estadisticas = [], alertas = [], actividad = [] }) => {
  const fmt = (v:number) => formatCurrencyCOP(v);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
  <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">BALANCE</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-info-700)]">{fmt(balance)}</p></CardContent></Card>
        {variant === 'caja' ? (
          <>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">ÓRDENES</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-secondary-700)]">{ordenes}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">META DEL DÍA</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-success-600)]">{typeof metaDelDia === 'number' ? `${metaDelDia}%` : (metaDelDia ?? '—')}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">AYER VS HOY</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-success-600)]">{typeof variacionVsAyer === 'number' ? `${variacionVsAyer}%` : (variacionVsAyer ?? '—')}</p></CardContent></Card>
          </>
        ) : (
          <>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">VENTAS</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-success-700)]">{fmt(ventas)}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">GASTOS</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-error-700)]">{fmt(gastos)}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-[color:var(--sp-neutral-500)]">ÓRDENES</p><p className="text-[24px] leading-7 font-bold text-[color:var(--sp-secondary-700)]">{ordenes}</p></CardContent></Card>
          </>
        )}
      </div>

      {estadisticas.length > 0 && (
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-4 space-y-2">
            <p className="text-[14px] font-semibold">📊 Estadísticas Rápidas</p>
            <div className="grid grid-cols-2 gap-3">
              {estadisticas.map((e, i) => (
                <div key={i} className="text-[12px]">
                  <p className="text-[color:var(--sp-neutral-500)]">{e.label}</p>
                  <p className="font-medium text-[color:var(--sp-neutral-800)]">{e.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alertas.length > 0 && (
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-4 space-y-2">
            <p className="text-[14px] font-semibold">⚠️ Alertas y Notificaciones</p>
            {alertas.map((a, i) => (
              <div
                key={i}
                className={`text-[12px] px-3 py-2 rounded border ${
                  a.tipo === 'warning'
                    ? 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)] text-[color:var(--sp-warning-800)]'
                    : a.tipo === 'success'
                    ? 'bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-200)] text-[color:var(--sp-success-800)]'
                    : 'bg-[color:var(--sp-neutral-50)] border-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-700)]'
                }`}
              >
                {a.label}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {actividad.length > 0 && (
    <Card className="rounded-lg shadow-sm">
          <CardContent className="p-4 space-y-2">
      <p className="text-[14px] font-semibold">🕒 Actividad Reciente</p>
      <div className="space-y-2 text-[12px]">
              {actividad.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[color:var(--sp-neutral-700)]">{r.label}</span>
                  {r.value && <span className="text-[color:var(--sp-success-700)] font-medium">{r.value}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
