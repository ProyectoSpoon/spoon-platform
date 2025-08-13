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
        <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">BALANCE</p><p className="text-[24px] leading-7 font-bold text-blue-700">{fmt(balance)}</p></CardContent></Card>
        {variant === 'caja' ? (
          <>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">ÓRDENES</p><p className="text-[24px] leading-7 font-bold text-purple-700">{ordenes}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">META DEL DÍA</p><p className="text-[24px] leading-7 font-bold text-emerald-600">{typeof metaDelDia === 'number' ? `${metaDelDia}%` : (metaDelDia ?? '—')}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">AYER VS HOY</p><p className="text-[24px] leading-7 font-bold text-emerald-600">{typeof variacionVsAyer === 'number' ? `${variacionVsAyer}%` : (variacionVsAyer ?? '—')}</p></CardContent></Card>
          </>
        ) : (
          <>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">VENTAS</p><p className="text-[24px] leading-7 font-bold text-green-700">{fmt(ventas)}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">GASTOS</p><p className="text-[24px] leading-7 font-bold text-red-700">{fmt(gastos)}</p></CardContent></Card>
            <Card className="rounded-lg shadow-sm"><CardContent className="p-4"><p className="text-[12px] text-gray-500">ÓRDENES</p><p className="text-[24px] leading-7 font-bold text-purple-700">{ordenes}</p></CardContent></Card>
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
                  <p className="text-gray-500">{e.label}</p>
                  <p className="font-medium text-gray-800">{e.value}</p>
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
              <div key={i} className={`text-[12px] px-3 py-2 rounded border ${a.tipo==='warning'?'bg-blue-50 border-blue-200 text-blue-800': a.tipo==='success'?'bg-green-50 border-green-200 text-green-800':'bg-gray-50 border-gray-200 text-gray-700'}`}>
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
                  <span className="text-gray-700">{r.label}</span>
                  {r.value && <span className="text-green-700 font-medium">{r.value}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
