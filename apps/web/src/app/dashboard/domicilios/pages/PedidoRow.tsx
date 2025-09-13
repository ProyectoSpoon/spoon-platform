'use client';

import React from 'react';
import EstadoPedidoDropdown from './EstadoPedidoDropdown';
import DomiciliarioAssignment from './DomiciliarioAssignment';
import { PedidoDomicilio, EstadoPedido, Domiciliario } from '../types/domiciliosTypes';
import { ESTADOS_PEDIDO, ESTADOS_LABELS } from '../constants/domiciliosConstants';
import { useNotifications } from '@spoon/shared/Context/notification-context';

const fmt = (n: number) => '$' + n.toLocaleString('es-CO');

export interface PedidoRowProps {
  pedido: PedidoDomicilio;
  siguientesEstados: EstadoPedido[];
  domiciliarios: Domiciliario[];
  onChangeEstado: (estado: EstadoPedido) => void;
  onAsignarDomiciliario: (id: string) => void;
  onVerDetalle: () => void;
  selectControl?: React.ReactNode;
}

export default function PedidoRow({ pedido, siguientesEstados, domiciliarios, onChangeEstado, onAsignarDomiciliario, onVerDetalle, selectControl }: PedidoRowProps) {
  const { addNotification } = useNotifications();
  const itemsCount = pedido.order_items.length;
  const valor = pedido.total_amount + pedido.delivery_fee;
  const shortAddr = pedido.delivery_address.length > 28 ? pedido.delivery_address.slice(0, 28) + '…' : pedido.delivery_address;
  const tiempoMin = Math.max(0, Math.floor((Date.now() - new Date(pedido.created_at).getTime()) / 60000));
  const tiempoTxt = `${tiempoMin}min`;
  const tiempoClass = tiempoMin < 10 ? 'text-[color:var(--sp-success-700)]' : tiempoMin < 20 ? 'text-[color:var(--sp-warning-700)]' : 'text-[color:var(--sp-error-700)]';

  const handleChangeEstado = (estado: EstadoPedido) => {
    if (estado === ESTADOS_PEDIDO.ENVIADO && !pedido.assigned_delivery_person_id) {
      addNotification({
        type: 'warning',
        title: 'No se puede enviar',
        message: 'Asigna un domiciliario antes de marcar el pedido como En camino.'
      });
      return;
    }
    onChangeEstado(estado);
    const label = ESTADOS_LABELS[estado] || 'Estado actualizado';
    addNotification({ type: 'success', title: 'Actualización', message: `Pedido marcado como "${label}".` });
  };

  return (
    <tr className="text-sm">
      {selectControl && (
        <td className="px-3 py-2">
          {selectControl}
        </td>
      )}
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="font-medium">{pedido.customer_name}</div>
        <div className="text-xs text-[color:var(--sp-neutral-600)]">{pedido.customer_phone}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap" title={pedido.delivery_address}>{shortAddr}</td>
      <td className="px-3 py-2 whitespace-nowrap" title={pedido.order_items.map(i=>`${i.quantity}x ${i.combination_name}`).join(', ')}>
        {itemsCount} items
      </td>
      <td className={`px-3 py-2 whitespace-nowrap ${tiempoClass}`}>{tiempoTxt}</td>
      <td className="px-3 py-2 whitespace-nowrap">{fmt(valor)}</td>
      <td className="px-3 py-2 whitespace-nowrap">
        <EstadoPedidoDropdown estadoActual={pedido.status} siguientes={siguientesEstados} onChange={handleChangeEstado} />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <DomiciliarioAssignment value={pedido.assigned_delivery_person_id || ''} options={domiciliarios} onChange={onAsignarDomiciliario} />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <button onClick={onVerDetalle} className="px-2 py-1 text-xs border rounded-md hover:bg-[color:var(--sp-neutral-50)]">Ver detalle</button>
      </td>
    </tr>
  );
}
