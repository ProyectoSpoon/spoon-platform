'use client';

import React from 'react';

// TEMP casting approach like other components (React version duplication)
const Skeleton: any = (props: { className?: string }) => <div className={"animate-pulse bg-[color:var(--sp-neutral-200)] rounded " + (props.className||'')} />;

export interface CierreCajaItem {
  id: string;
  abierta_at: string;
  cerrada_at: string;
  cajero_apertura?: string;
  cajero_cierre?: string;
  total_ventas_centavos?: number;
  total_gastos_centavos?: number;
  total_efectivo_centavos?: number;
  // 'pendiente' cuando aún no se ha registrado el saldo final contado
  estado_cuadre?: 'cuadrado' | 'faltante' | 'sobrante' | 'pendiente' | null;
  diferencia_centavos?: number | null;
}

interface Props {
  loading?: boolean;
  cierres: CierreCajaItem[];
  onSelect: (id: string) => void;
}

const formatMoney = (cents?: number) => {
  if (cents == null) return '-';
  return '$' + new Intl.NumberFormat('es-CO').format(Math.round(cents / 100));
};

const estadoBadge = (estado?: string | null) => {
  if (!estado) return null;
  const map: Record<string, { cls: string; label: string; dot: string }> = {
    cuadrado: { cls: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-700)]', label: 'cuadrado', dot: 'bg-[color:var(--sp-success-500)]' },
    faltante: { cls: 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-700)]', label: 'faltante', dot: 'bg-[color:var(--sp-error-500)]' },
    sobrante: { cls: 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]', label: 'sobrante', dot: 'bg-[color:var(--sp-warning-500)]' },
    pendiente: { cls: 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-600)]', label: 'pendiente', dot: 'bg-[color:var(--sp-neutral-400)]' }
  };
  const item = map[estado] || map['pendiente'];
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium " + item.cls}>
      <span className={"w-2 h-2 rounded-full " + item.dot} />
      {item.label}
    </span>
  );
};

export const CierresList: React.FC<Props> = ({ loading, cierres, onSelect }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!cierres.length) {
    return (
      <div className="text-center py-10 text-sm text-[color:var(--sp-neutral-500)]">
        No hay cierres registrados todavía.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]">
      {/* Header */}
      <div className="grid grid-cols-[5.5rem_repeat(4,minmax(0,1fr))] md:grid-cols-[6.5rem_repeat(5,minmax(0,1fr))] px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-[color:var(--sp-neutral-500)] bg-[color:var(--sp-neutral-100)] border-b border-[color:var(--sp-neutral-200)]">
        <div className="leading-tight">Fecha</div>
        <div className="leading-tight">Ventas</div>
        <div className="leading-tight hidden sm:block">Efectivo</div>
        <div className="leading-tight hidden md:block">Gastos</div>
        <div className="leading-tight">Diferencia</div>
        <div className="leading-tight text-right">Estado</div>
      </div>
      <div className="divide-y divide-[color:var(--sp-neutral-200)]">
        {cierres.map(c => {
          const fecha = new Date(c.cerrada_at || c.abierta_at);
          const fechaFmt = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: '2-digit' });
          const horaFmt = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full text-left px-4 py-3 grid grid-cols-[5.5rem_repeat(4,minmax(0,1fr))] md:grid-cols-[6.5rem_repeat(5,minmax(0,1fr))] items-center gap-2 hover:bg-[color:var(--sp-neutral-50)] transition-colors focus:outline-none focus:bg-[color:var(--sp-neutral-100)]"
            >
              <div className="w-full text-[10px] font-medium text-[color:var(--sp-neutral-600)] leading-tight">
                <div className="capitalize">{fechaFmt}</div>
                <div className="text-[9px]">{horaFmt}</div>
              </div>
              <div className="text-[11px] md:text-xs font-semibold text-[color:var(--sp-neutral-900)] leading-tight">{formatMoney(c.total_ventas_centavos)}</div>
              <div className="text-[11px] md:text-xs font-medium text-[color:var(--sp-neutral-800)] leading-tight hidden sm:block">{formatMoney(c.total_efectivo_centavos)}</div>
              <div className="text-[11px] md:text-xs font-medium text-[color:var(--sp-neutral-800)] leading-tight hidden md:block">{formatMoney(c.total_gastos_centavos)}</div>
              <div className="text-[11px] md:text-xs font-medium leading-tight">
                {c.diferencia_centavos == null ? (
                  <span className="text-[color:var(--sp-neutral-400)]">—</span>
                ) : (
                  <span className={c.diferencia_centavos === 0 ? 'text-[color:var(--sp-success-700)]' : c.diferencia_centavos < 0 ? 'text-[color:var(--sp-error-700)]' : 'text-[color:var(--sp-warning-700)]'}>
                    {formatMoney(c.diferencia_centavos)}
                  </span>
                )}
              </div>
              <div className="text-[11px] md:text-xs flex items-center justify-end">
                {estadoBadge(c.estado_cuadre)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CierresList;

