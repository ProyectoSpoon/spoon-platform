'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { X as XRaw } from 'lucide-react';
const X: any = XRaw;
import { NuevoPedido, MenuDelDiaSimple, ItemPedido } from '../types/domiciliosTypes';
import { EXTRAS_DISPONIBLES, DEFAULT_DELIVERY_FEE, DEFAULT_ESTIMATED_TIME } from '../constants/domiciliosConstants';
import MenuStep from './steps/MenuStep';
import ResumenStep from './steps/ResumenStep';
import ClienteStep from './steps/ClienteStep';

interface PedidoFormProps {
  menu: MenuDelDiaSimple | null;
  onSubmit: (pedido: NuevoPedido) => Promise<boolean>;
  loading: boolean;
  onClose: () => void;
}

// Helper: mini step indicator styles
const StepDot = ({ active }: { active: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-[color:var(--sp-primary-600)]' : 'bg-[color:var(--sp-neutral-300)]'}`} />
);

export default function PedidoForm({ menu, onSubmit, loading, onClose }: PedidoFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    special_notes: ''
  });

  const [paso, setPaso] = useState<'menu' | 'resumen' | 'cliente'>('menu');
  const [items, setItems] = useState<Omit<ItemPedido, 'subtotal'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const agregarItem = useCallback((combinacionId: string) => {
    if (!menu) return;

    const combinacion = menu.combinaciones.find(c => c.id === combinacionId);
    if (!combinacion) return;

    const existingIndex = items.findIndex(item => item.combination_id === combinacionId);
    
    if (existingIndex >= 0) {
      setItems(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const nuevoItem: Omit<ItemPedido, 'subtotal'> = {
        combination_id: combinacion.id,
        combination_name: combinacion.combination_name,
        quantity: 1,
        unit_price: combinacion.combination_price,
        extras: []
      };
      setItems(prev => [...prev, nuevoItem]);
    }
  }, [menu, items]);

  const agregarItemEspecial = useCallback((nombre: string, precio: number) => {
    const nuevoItem: Omit<ItemPedido, 'subtotal'> = {
      combination_id: `especial:${Date.now()}`,
      combination_name: nombre,
      quantity: 1,
      unit_price: precio,
      extras: []
    };
    setItems(prev => [...prev, nuevoItem]);
  }, []);

  const actualizarCantidad = useCallback((index: number, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: cantidad } : item
      ));
    }
  }, []);

  const calcularSubtotal = useCallback((item: Omit<ItemPedido, 'subtotal'>) => {
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.precio, 0);
    return (item.unit_price + extrasTotal) * item.quantity;
  }, []);

  const subtotalItems = useMemo(() => items.reduce((sum, item) => sum + calcularSubtotal(item), 0), [items, calcularSubtotal]);
  const totalPedido = useMemo(() => (items.length ? subtotalItems + DEFAULT_DELIVERY_FEE : 0), [items.length, subtotalItems]);

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }

    const phoneClean = formData.customer_phone.replace(/[^0-9]/g, '');
    if (!phoneClean) {
      newErrors.customer_phone = 'El telefono es requerido';
    } else if (phoneClean.length < 7) {
      newErrors.customer_phone = 'Telefono muy corto';
    }

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'La direccion es requerida';
    }

    if (items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item al pedido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitFinal = async (overrides?: Partial<typeof formData>) => {
    if (items.length === 0) return false;
    const data = { ...formData, ...(overrides || {}) };
    const nuevoPedido: NuevoPedido = {
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.replace(/[^0-9]/g, '').trim(),
      delivery_address: data.delivery_address.trim(),
      order_items: items,
      special_notes: data.special_notes.trim() || undefined
    };
    const ok = await onSubmit(nuevoPedido);
    if (!ok) {
      setSubmitError('No se pudo crear el pedido. Verifica que haya menú del día activo para hoy.');
    } else {
      setSubmitError(null);
    }
    return ok;
  };

  if (!menu) {
    return null;
  }

  const StepContent = () => {
    if (!menu) return null;
    if (paso === 'menu') {
      return (
        <MenuStep
          menu={menu}
          items={items}
          agregarItem={agregarItem}
          agregarItemEspecial={agregarItemEspecial}
          actualizarCantidad={actualizarCantidad}
          calcularSubtotal={calcularSubtotal}
          subtotalItems={subtotalItems}
          totalPedido={totalPedido}
          onNext={() => setPaso('resumen')}
        />
      );
    }
    if (paso === 'resumen') {
      return (
        <ResumenStep
          items={items}
          calcularSubtotal={calcularSubtotal}
          subtotalItems={subtotalItems}
          totalPedido={totalPedido}
          specialNotes={formData.special_notes}
          setSpecialNotes={(v)=>setFormData(prev=>({...prev, special_notes: v}))}
          actualizarCantidad={actualizarCantidad}
          onBack={()=>setPaso('menu')}
          onNext={()=>setPaso('cliente')}
        />
      );
    }
    return (
      <ClienteStep
        subtotal={subtotalItems}
        domicilio={DEFAULT_DELIVERY_FEE}
        total={totalPedido}
        onBack={()=>setPaso('resumen')}
        loading={loading}
        error={submitError}
        onSubmit={async (cliente)=>{
          // Usar overrides para evitar race condition con setState async
          const ok = await submitFinal({
            customer_name: cliente.nombre,
            customer_phone: cliente.telefono,
            delivery_address: cliente.direccion
          });
          // Si falla, el error se muestra en el panel derecho; no cerramos aquí
        }}
      />
    );
  };

  return (
    <div className="h-full flex flex-col">
  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
        <div>
      <h2 className="heading-section text-[color:var(--sp-neutral-900)]">Nuevo Pedido</h2>
      <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
            Tiempo estimado: {DEFAULT_ESTIMATED_TIME} minutos
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-[color:var(--sp-neutral-600)]" role="list" aria-label="Progreso del pedido">
            <div role="listitem" aria-current={paso==='menu' ? 'step' : undefined} className="flex items-center gap-1">
              <StepDot active={paso!=='resumen' && paso!=='cliente'} /> Menú
            </div>
            <span>›</span>
            <div role="listitem" aria-current={paso==='resumen' ? 'step' : undefined} className="flex items-center gap-1">
              <StepDot active={paso==='resumen'} /> Resumen
            </div>
            <span>›</span>
            <div role="listitem" aria-current={paso==='cliente' ? 'step' : undefined} className="flex items-center gap-1">
              <StepDot active={paso==='cliente'} /> Cliente
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
      className="p-2 hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
  <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain pb-24">
        <StepContent />
      </div>

  {paso !== 'menu' && (
      <div className="border-t border-[color:var(--sp-neutral-200)] p-4 sm:p-6 pb-[env(safe-area-inset-bottom)] bg-[--sp-surface-elevated]">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
  )}
    </div>
  );
}
