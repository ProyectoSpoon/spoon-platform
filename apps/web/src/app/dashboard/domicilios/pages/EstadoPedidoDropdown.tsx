'use client';

import React from 'react';
import { ESTADOS_PEDIDO, ESTADOS_LABELS } from '../constants/domiciliosConstants';
import { EstadoPedido } from '../types/domiciliosTypes';

export interface EstadoPedidoDropdownProps {
  estadoActual: EstadoPedido;
  siguientes: EstadoPedido[];
  onChange: (estado: EstadoPedido) => void;
}

export default function EstadoPedidoDropdown({ estadoActual, siguientes, onChange }: EstadoPedidoDropdownProps) {
  const opciones = [estadoActual, ...siguientes.filter(e => e !== estadoActual)];
  return (
    <select
      value={estadoActual}
      onChange={(e)=> onChange(e.target.value as EstadoPedido)}
      className="px-2 py-1 text-xs border rounded-md"
      aria-label="Cambiar estado del pedido"
    >
      {opciones.map((e) => (
        <option key={e} value={e}>{ESTADOS_LABELS[e]}</option>
      ))}
    </select>
  );
}
