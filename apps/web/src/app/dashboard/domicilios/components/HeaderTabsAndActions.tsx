'use client';

import React from 'react';
import { Plus as PlusRaw, RefreshCw as RefreshCwRaw, Users as UsersRaw } from 'lucide-react';
const Plus: any = PlusRaw;
const RefreshCw: any = RefreshCwRaw;
const Users: any = UsersRaw;

interface HeaderProps {
  tab: 'hoy' | 'historial';
  registros: number;
  limit: number;
  onChangeTab: (tab: 'hoy' | 'historial') => void;
  onActualizar: () => void;
  onNuevoPedido: () => void;
  onGestionarDomiciliarios?: () => void;
  descripcion: string;
}

export default function HeaderTabsAndActions({ tab, registros, limit, onChangeTab, onActualizar, onNuevoPedido, onGestionarDomiciliarios, descripcion }: HeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex flex-col md:flex-row md:items-start 2xl:items-center justify-between gap-4">
        <div className="w-full">
          <h1 className="heading-page mb-2">Domicilios</h1>
      <div role="tablist" aria-label="Vistas de domicilios" className="flex items-center gap-2 border-b border-[color:var(--sp-neutral-200)] text-sm overflow-x-auto no-scrollbar">
            <button
              id="tab-hoy"
              onClick={() => onChangeTab('hoy')}
        role="tab"
        aria-selected={tab==='hoy'}
        aria-controls="panel-hoy"
              className={`px-3 py-2 -mb-px border-b-2 ${tab==='hoy' ? 'border-[color:var(--sp-primary-600)] text-[color:var(--sp-primary-700)] font-medium' : 'border-transparent text-[color:var(--sp-neutral-500)] hover:text-[color:var(--sp-neutral-700)]'}`}
            >Hoy</button>
            <button
              id="tab-historial"
              onClick={() => onChangeTab('historial')}
        role="tab"
        aria-selected={tab==='historial'}
        aria-controls="panel-historial"
              className={`px-3 py-2 -mb-px border-b-2 ${tab==='historial' ? 'border-[color:var(--sp-primary-600)] text-[color:var(--sp-primary-700)] font-medium' : 'border-transparent text-[color:var(--sp-neutral-500)] hover:text-[color:var(--sp-neutral-700)]'}`}
            >Historial</button>
            <span className="ml-auto text-[color:var(--sp-neutral-400)] text-xs hidden md:inline whitespace-nowrap">{registros} registros (límite {limit})</span>
          </div>
          <p className="text-[color:var(--sp-neutral-600)] mt-2 text-sm">{descripcion}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onActualizar}
            className="flex items-center justify-center px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          {onGestionarDomiciliarios && (
            <button
              onClick={onGestionarDomiciliarios}
              className="flex items-center justify-center px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors w-full sm:w-auto"
            >
              <Users className="w-4 h-4 mr-2" />
              Gestionar Domiciliarios
            </button>
          )}
          <button
            onClick={onNuevoPedido}
            className="flex items-center justify-center px-6 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
