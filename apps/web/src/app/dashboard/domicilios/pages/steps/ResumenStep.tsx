'use client';

import React from 'react';
import { ArrowLeft as ArrowLeftRaw, Check as CheckRaw, Plus as PlusRaw, Minus as MinusRaw } from 'lucide-react';
const ArrowLeft: any = ArrowLeftRaw;
const Check: any = CheckRaw;
const Plus: any = PlusRaw;
const Minus: any = MinusRaw;
import { ItemPedido } from '../../types/domiciliosTypes';
import { DEFAULT_DELIVERY_FEE } from '../../constants/domiciliosConstants';

type ItemSinSubtotal = Omit<ItemPedido, 'subtotal'>;

const formatMoney = (valor: number) => '$' + valor.toLocaleString('es-CO');

interface ResumenStepProps {
  items: ItemSinSubtotal[];
  calcularSubtotal: (item: ItemSinSubtotal) => number;
  subtotalItems: number;
  totalPedido: number;
  specialNotes: string;
  setSpecialNotes: (v: string) => void;
  actualizarCantidad: (index: number, cantidad: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ResumenStep({ items, calcularSubtotal, subtotalItems, totalPedido, specialNotes, setSpecialNotes, actualizarCantidad, onBack, onNext }: ResumenStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={onBack} className="text-sm text-[color:var(--sp-neutral-700)] hover:underline inline-flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Volver al menú</button>
          <h3 className="heading-section">Resumen del pedido</h3>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="bg-[--sp-surface-elevated] border border-[color:var(--sp-neutral-200)] rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[color:var(--sp-neutral-900)] truncate">{it.combination_name}</p>
                <p className="text-sm text-[color:var(--sp-neutral-600)] mt-0.5">{formatMoney(calcularSubtotal(it))}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Disminuir cantidad" onClick={()=>actualizarCantidad(idx, it.quantity - 1)} className="p-1.5 rounded hover:bg-[color:var(--sp-neutral-200)]"><Minus className="w-4 h-4" /></button>
                <span className="w-8 text-center">{it.quantity}</span>
                <button type="button" aria-label="Incrementar cantidad" onClick={()=>actualizarCantidad(idx, it.quantity + 1)} className="p-1.5 rounded hover:bg-[color:var(--sp-neutral-200)]"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Notas especiales</label>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
            placeholder="Instrucciones adicionales"
          />
        </div>
      </div>
      <aside className="lg:col-span-4 lg:sticky lg:top-4">
        <div className="bg-[--sp-surface-elevated] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <h4 className="font-semibold text-[color:var(--sp-neutral-900)] mb-2">Totales</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotalItems)}</span></div>
            <div className="flex justify-between"><span>Domicilio</span><span>{formatMoney(DEFAULT_DELIVERY_FEE)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatMoney(totalPedido)}</span></div>
          </div>
          <button type="button" onClick={onNext} className="mt-3 w-full px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)]">Continuar</button>
        </div>
      </aside>
    </div>
  );
}
