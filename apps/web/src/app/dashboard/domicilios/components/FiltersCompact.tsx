'use client';

import React from 'react';
import { Domiciliario } from '../types/domiciliosTypes';

interface FiltersCompactProps {
  tab: 'hoy' | 'historial';
  filtros: { estado: string; domiciliario: string; fecha: string; buscar?: string };
  domiciliarios: Domiciliario[];
  onUpdateFiltros: (patch: Partial<FiltersCompactProps['filtros']>) => void;
  onAplicar?: () => void;
}

export default function FiltersCompact({ tab, filtros, domiciliarios, onUpdateFiltros, onAplicar }: FiltersCompactProps) {
  const [localBuscar, setLocalBuscar] = React.useState<string>(filtros.buscar || '');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const firstAdvancedRef = React.useRef<HTMLSelectElement | null>(null);
  const toggleBtnRef = React.useRef<HTMLButtonElement | null>(null);
  // Debounce local de 400ms para no spamear consultas; solo actualiza el filtro cuando el usuario para de tipear
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (localBuscar !== (filtros.buscar || '')) {
        onUpdateFiltros({ buscar: localBuscar });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [localBuscar]);

  // Sync externo -> interno (por ejemplo al pulsar Reset)
  React.useEffect(() => {
    setLocalBuscar(filtros.buscar || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.buscar]);

  // Focus management: when advanced opens, focus first control; when closes, return focus to toggle
  React.useEffect(() => {
    if (showAdvanced) {
      // Delay to ensure element is in DOM
      setTimeout(() => firstAdvancedRef.current?.focus(), 0);
    } else {
      setTimeout(() => toggleBtnRef.current?.focus(), 0);
    }
  }, [showAdvanced]);

  return (
    <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-[color:var(--sp-neutral-500)] mb-1">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e)=>onUpdateFiltros({ estado: e.target.value })}
            className="px-3 py-3 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
          >
            <option value="todos">Todos</option>
            <option value="received">Recibido</option>
            <option value="cooking">Cocinando</option>
            <option value="ready">Listo</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="paid">Pagado</option>
          </select>
        </div>
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label className="text-xs font-medium text-[color:var(--sp-neutral-500)] mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Nombre o teléfono"
            value={localBuscar}
            onChange={(e)=> setLocalBuscar(e.target.value)}
            className="px-3 py-3 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
          />
        </div>
      </div>
      {/* Botón Aplicar */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onAplicar?.()}
          className="px-3 py-2 text-sm rounded-md bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
        >
          Aplicar
        </button>
      </div>
      {/* Advanced filters toggle (buttons removed as requested) */}
      <div className="mt-3">
        <button
          id="advanced-filters-toggle"
          ref={toggleBtnRef}
          onClick={() => setShowAdvanced(s => !s)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !showAdvanced) {
              e.preventDefault();
              setShowAdvanced(true);
            }
          }}
          aria-controls="advanced-filters"
          aria-expanded={showAdvanced}
          className="text-xs underline text-[color:var(--sp-neutral-600)] hover:text-[color:var(--sp-neutral-800)]"
        >
          {showAdvanced ? 'Ocultar filtros avanzados' : 'Filtros avanzados'}
        </button>
      </div>
      {showAdvanced && (
        <div id="advanced-filters" role="region" aria-labelledby="advanced-filters-toggle" className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {/* Domiciliario */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-[color:var(--sp-neutral-500)] mb-1">Domiciliario</label>
            <select
              ref={firstAdvancedRef}
              value={filtros.domiciliario}
              onChange={(e)=>onUpdateFiltros({ domiciliario: e.target.value })}
              className="px-3 py-3 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
            >
              <option value="todos">Todos</option>
              {domiciliarios.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {/* Fecha (solo historial) */}
          {tab === 'historial' && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-[color:var(--sp-neutral-500)] mb-1">Fecha</label>
              <select
                value={filtros.fecha}
                onChange={(e)=>onUpdateFiltros({ fecha: e.target.value })}
                className="px-3 py-3 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
              >
                <option value="semana">Últimos 7 días</option>
                <option value="mes">Últimos 30 días</option>
                <option value="hoy">Hoy</option>
                <option value="ayer">Ayer</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
