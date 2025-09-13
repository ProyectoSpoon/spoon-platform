'use client';

import React from 'react';
import { Domiciliario } from '../types/domiciliosTypes';

export interface DomiciliarioAssignmentProps {
  value?: string;
  options: Domiciliario[];
  onChange: (id: string) => void;
}

export default function DomiciliarioAssignment({ value = '', options, onChange }: DomiciliarioAssignmentProps) {
  return (
    <select
      value={value}
      onChange={(e)=> onChange(e.target.value)}
      className="px-2 py-1 text-xs border rounded-md min-w-[160px]"
      aria-label="Asignar domiciliario"
    >
      <option value="">Sin asignar</option>
      {options.map(d => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
