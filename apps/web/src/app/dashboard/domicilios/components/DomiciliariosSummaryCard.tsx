'use client';

import React from 'react';
import { ESTADOS_DOMICILIARIO } from '../constants/domiciliosConstants';

interface Props {
  total: number;
  disponibles: number;
  ocupados: number;
  desconectados: number;
  onOpenWizard: () => void;
}

export default function DomiciliariosSummaryCard({ total, disponibles, ocupados, desconectados, onOpenWizard }: Props) {
  return (
    <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--sp-neutral-800)]">Domiciliarios</span>
          <span className="text-[11px] text-[color:var(--sp-neutral-500)]">{total} registrados • {disponibles} disponibles</span>
        </div>
        <button onClick={onOpenWizard} className="px-3 py-1.5 text-xs rounded-md bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] hover:bg-[color:var(--sp-primary-700)]">Gestionar</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded border border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
          <p className="text-[9px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Disp.</p>
          <p className="text-sm font-semibold">{disponibles}</p>
        </div>
        <div className="p-2 rounded border border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
          <p className="text-[9px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Ocup.</p>
          <p className="text-sm font-semibold">{ocupados}</p>
        </div>
        <div className="p-2 rounded border border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
          <p className="text-[9px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Desc.</p>
          <p className="text-sm font-semibold">{desconectados}</p>
        </div>
      </div>
      <p className="text-[10px] text-[color:var(--sp-neutral-500)]">Usa el wizard para actualizar estados y agregar nuevos.</p>
    </div>
  );
}
