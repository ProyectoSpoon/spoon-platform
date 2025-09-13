'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft as ArrowLeftRaw } from 'lucide-react';
const ArrowLeft: any = ArrowLeftRaw;

const formatMoney = (valor: number) => '$' + valor.toLocaleString('es-CO');

interface ClienteData {
  nombre: string;
  telefono: string;
  direccion: string;
  referencia?: string;
}

interface ClienteStepProps {
  subtotal: number;
  domicilio: number;
  total: number;
  onBack: () => void;
  onSubmit: (cliente: ClienteData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

export default function ClienteStep({ subtotal, domicilio, total, onBack, onSubmit, loading, error }: ClienteStepProps) {
  const [form, setForm] = useState<ClienteData>({ nombre: '', telefono: '', direccion: '', referencia: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!/^\+?\d{7,15}$/.test(form.telefono.trim())) e.telefono = 'Teléfono inválido';
    if (!form.direccion.trim()) e.direccion = 'Requerido';
    return e;
  }, [form]);

  const handleChange = (k: keyof ClienteData, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const handleBlur = (k: keyof ClienteData) => setTouched((t) => ({ ...t, [k]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched({ nombre: true, telefono: true, direccion: true, referencia: true });
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={onBack} className="text-sm text-[color:var(--sp-neutral-700)] hover:underline inline-flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</button>
          <h3 className="heading-section">Datos del Cliente</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)]">Nombre</label>
            <input value={form.nombre} onChange={(e)=>handleChange('nombre', e.target.value)} onBlur={()=>handleBlur('nombre')} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]" />
            {touched.nombre && errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)]">Teléfono</label>
            <input value={form.telefono} onChange={(e)=>handleChange('telefono', e.target.value)} onBlur={()=>handleBlur('telefono')} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]" placeholder="Ej: 3001234567" />
            {touched.telefono && errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)]">Dirección</label>
            <input value={form.direccion} onChange={(e)=>handleChange('direccion', e.target.value)} onBlur={()=>handleBlur('direccion')} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]" />
            {touched.direccion && errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)]">Referencia</label>
            <input value={form.referencia} onChange={(e)=>handleChange('referencia', e.target.value)} onBlur={()=>handleBlur('referencia')} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]" />
          </div>
        </div>
      </div>
      <aside className="lg:col-span-4 lg:sticky lg:top-4">
        <div className="bg-[--sp-surface-elevated] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <h4 className="font-semibold text-[color:var(--sp-neutral-900)] mb-2">Resumen</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span>Domicilio</span><span>{formatMoney(domicilio)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatMoney(total)}</span></div>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button type="submit" disabled={loading} className="mt-3 w-full px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] disabled:opacity-60">
            {loading ? 'Creando…' : 'Crear Pedido'}
          </button>
        </div>
      </aside>
    </form>
  );
}
