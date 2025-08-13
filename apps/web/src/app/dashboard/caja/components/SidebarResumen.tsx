"use client";
import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

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
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">BALANCE</p><p className="text-xl font-bold text-blue-700">{fmt(balance)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">VENTAS</p><p className="text-xl font-bold text-green-700">{fmt(ventas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">GASTOS</p><p className="text-xl font-bold text-red-700">{fmt(gastos)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">ÓRDENES</p><p className="text-xl font-bold text-purple-700">{ordenes}</p></CardContent></Card>
      </div>

      {estadisticas.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">📊 Estadísticas Rápidas</p>
            <div className="grid grid-cols-2 gap-3">
              {estadisticas.map((e, i) => (
                <div key={i} className="text-xs">
                  <p className="text-gray-500">{e.label}</p>
                  <p className="font-medium text-gray-800">{e.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alertas.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">⚠️ Alertas y Notificaciones</p>
            {alertas.map((a, i) => (
              <div key={i} className={`text-xs px-3 py-2 rounded border ${a.tipo==='warning'?'bg-blue-50 border-blue-200 text-blue-800': a.tipo==='success'?'bg-green-50 border-green-200 text-green-800':'bg-gray-50 border-gray-200 text-gray-700'}`}>
                {a.label}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {actividad.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">🕒 Actividad Reciente</p>
            <div className="space-y-2 text-sm">
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
