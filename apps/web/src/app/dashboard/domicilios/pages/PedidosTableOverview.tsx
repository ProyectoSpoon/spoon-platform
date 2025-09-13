'use client';

import React, { useMemo } from 'react';
import { PedidoDomicilio, Domiciliario, EstadoPedido } from '../types/domiciliosTypes';
import { ESTADOS_PEDIDO, ESTADOS_LABELS } from '../constants/domiciliosConstants';
import PedidoRow from './PedidoRow';
import { useNotifications } from '@spoon/shared/Context/notification-context';

export interface PedidosTableOverviewProps {
  pedidos: PedidoDomicilio[];
  domiciliarios: Domiciliario[];
  sortKey?: 'tiempo' | 'valor' | 'estado';
  sortDir?: 'asc' | 'desc';
  onChangeEstado: (pedidoId: string, estado: EstadoPedido) => void;
  onAsignarDomiciliario: (pedidoId: string, domiciliarioId: string) => void;
  onVerDetalle: (pedidoId: string) => void;
}

export default function PedidosTableOverview({ pedidos, domiciliarios, sortKey = 'tiempo', sortDir = 'asc', onChangeEstado, onAsignarDomiciliario, onVerDetalle }: PedidosTableOverviewProps) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const { addNotification } = useNotifications();
  const siguientes = (estado: string): EstadoPedido[] => {
    switch (estado) {
      case ESTADOS_PEDIDO.RECIBIDO: return [ESTADOS_PEDIDO.COCINANDO];
      case ESTADOS_PEDIDO.COCINANDO: return [ESTADOS_PEDIDO.LISTO];
      case ESTADOS_PEDIDO.LISTO: return [ESTADOS_PEDIDO.ENVIADO];
      case ESTADOS_PEDIDO.ENVIADO: return [ESTADOS_PEDIDO.ENTREGADO];
      case ESTADOS_PEDIDO.ENTREGADO: return [ESTADOS_PEDIDO.PAGADO];
      default: return [];
    }
  };

  const domActivos = useMemo(() => domiciliarios.filter(d => d.status !== 'offline'), [domiciliarios]);

  const selectedIds = React.useMemo(() => Object.entries(selected).filter(([, v]) => !!v).map(([id]) => id), [selected]);
  const allSelected = pedidos.length > 0 && pedidos.every(p => !!selected[p.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    if (!allSelected) pedidos.forEach(p => next[p.id] = true);
    setSelected(next);
  };

  const sorted = useMemo(() => {
    const arr = [...pedidos];
    arr.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortKey === 'tiempo') {
        va = new Date(a.created_at).getTime();
        vb = new Date(b.created_at).getTime();
      } else if (sortKey === 'valor') {
        va = (a.total_amount + a.delivery_fee);
        vb = (b.total_amount + b.delivery_fee);
      } else if (sortKey === 'estado') {
        // Ordenar alfabéticamente por estado
        const cmp = a.status.localeCompare(b.status);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [pedidos, sortKey, sortDir]);

  const selectedPedidos = useMemo(() => sorted.filter(p => !!selected[p.id]), [sorted, selected]);

  const canTransitionTo = (p: PedidoDomicilio, target: EstadoPedido) => {
    const posibles = siguientes(p.status);
    if (!posibles.includes(target)) return false;
    if (target === ESTADOS_PEDIDO.ENVIADO && !p.assigned_delivery_person_id) return false; // requiere domiciliario asignado
    return true;
  };

  const countValidFor = (target: EstadoPedido) => selectedPedidos.filter(p => canTransitionTo(p, target)).length;

  const doBatch = (target: EstadoPedido) => {
    const valid = selectedPedidos.filter(p => canTransitionTo(p, target));
    const invalid = selectedPedidos.length - valid.length;
    if (valid.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Sin cambios aplicados',
        message: target === ESTADOS_PEDIDO.ENVIADO
          ? 'Selecciona pedidos con domiciliario asignado y en estado correcto.'
          : 'La transición no aplica para los pedidos seleccionados.'
      });
      return;
    }
    valid.forEach(p => onChangeEstado(p.id, target));
    addNotification({
      type: 'success',
      title: 'Estados actualizados',
      message: `Se actualizaron ${valid.length} pedido(s) a "${ESTADOS_LABELS[target]}".`
    });
    if (invalid > 0) {
      addNotification({
        type: 'info',
        title: 'Algunos no se actualizaron',
        message: target === ESTADOS_PEDIDO.ENVIADO
          ? `${invalid} pedido(s) omitidos por faltar domiciliario o transición inválida.`
          : `${invalid} pedido(s) omitidos por transición inválida.`
      });
    }
    setSelected({});
  };

  return (
    <div className="bg-[--sp-surface-elevated] rounded-lg border border-[color:var(--sp-neutral-200)] overflow-hidden">
    {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-neutral-50)] border-b">
      <div className="text-xs">{selectedIds.length} seleccionados</div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 text-xs border rounded-md disabled:opacity-50"
              disabled={countValidFor(ESTADOS_PEDIDO.COCINANDO) === 0}
              onClick={()=> doBatch(ESTADOS_PEDIDO.COCINANDO)}
            >Marcar Cocina</button>
            <button
              className="px-2 py-1 text-xs border rounded-md disabled:opacity-50"
              disabled={countValidFor(ESTADOS_PEDIDO.LISTO) === 0}
              onClick={()=> doBatch(ESTADOS_PEDIDO.LISTO)}
            >Marcar Listo</button>
            <button
              className="px-2 py-1 text-xs border rounded-md disabled:opacity-50"
              title={countValidFor(ESTADOS_PEDIDO.ENVIADO) === 0 ? 'Requiere domiciliario asignado' : undefined}
              disabled={countValidFor(ESTADOS_PEDIDO.ENVIADO) === 0}
              onClick={()=> doBatch(ESTADOS_PEDIDO.ENVIADO)}
            >Enviar</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)]">
            <tr>
              <th className="px-3 py-2 text-left font-medium"><input type="checkbox" aria-label="Seleccionar todos" checked={allSelected} onChange={toggleAll} /></th>
              <th className="px-3 py-2 text-left font-medium">Cliente</th>
              <th className="px-3 py-2 text-left font-medium">Dirección</th>
              <th className="px-3 py-2 text-left font-medium">Items</th>
              <th className="px-3 py-2 text-left font-medium">Tiempo</th>
              <th className="px-3 py-2 text-left font-medium">Valor</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-left font-medium">Domiciliario</th>
              <th className="px-3 py-2 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <PedidoRow
                key={p.id}
                pedido={p}
                siguientesEstados={siguientes(p.status)}
                domiciliarios={domActivos}
                onChangeEstado={(estado)=> onChangeEstado(p.id, estado)}
                onAsignarDomiciliario={(id)=> onAsignarDomiciliario(p.id, id)}
                onVerDetalle={()=> onVerDetalle(p.id)}
                selectControl={
                  <input
                    type="checkbox"
                    checked={!!selected[p.id]}
                    onChange={(e)=> setSelected(s=> ({...s, [p.id]: e.target.checked}))}
                    aria-label={`Seleccionar pedido ${p.id}`}
                  />
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
