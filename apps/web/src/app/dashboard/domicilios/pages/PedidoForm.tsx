'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Phone, MapPin, User, ShoppingCart, AlertCircle } from 'lucide-react';
import { NuevoPedido, MenuDelDiaSimple, ItemPedido } from '../types/domiciliosTypes';
import { EXTRAS_DISPONIBLES, DEFAULT_DELIVERY_FEE, DEFAULT_ESTIMATED_TIME } from '../constants/domiciliosConstants';

interface PedidoFormProps {
  menu: MenuDelDiaSimple | null;
  onSubmit: (pedido: NuevoPedido) => Promise<void>;
  loading: boolean;
  onClose: () => void;
}

export default function PedidoForm({ menu, onSubmit, loading, onClose }: PedidoFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    special_notes: ''
  });

  const [items, setItems] = useState<Omit<ItemPedido, 'subtotal'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const agregarItem = (combinacionId: string) => {
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
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: cantidad } : item
      ));
    }
  };

  const calcularSubtotal = (item: Omit<ItemPedido, 'subtotal'>) => {
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.precio, 0);
    return (item.unit_price + extrasTotal) * item.quantity;
  };

  const calcularTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + calcularSubtotal(item), 0);
    return subtotal + DEFAULT_DELIVERY_FEE;
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El telefono es requerido';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const nuevoPedido: NuevoPedido = {
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      delivery_address: formData.delivery_address.trim(),
      order_items: items,
      special_notes: formData.special_notes.trim() || undefined
    };

    await onSubmit(nuevoPedido);
  };

  if (!menu) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[color:var(--sp-neutral-400)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-2">
            No hay menu disponible
          </h3>
          <p className="text-[color:var(--sp-neutral-600)]">
            Configure el menu del dia antes de crear pedidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-6 border-b border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
        <div>
      <h2 className="heading-section text-[color:var(--sp-neutral-900)]">Nuevo Pedido</h2>
      <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
            Tiempo estimado: {DEFAULT_ESTIMATED_TIME} minutos
          </p>
        </div>
        <button
          onClick={onClose}
      className="p-2 hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="heading-section flex items-center">
              <User className="w-5 h-5 mr-2" />
              Datos del Cliente
            </h3>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                placeholder="Nombre del cliente"
              />
              {errors.customer_name && (
                <p className="text-sm text-[color:var(--sp-error-600)] mt-1">{errors.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                placeholder="3001234567"
              />
              {errors.customer_phone && (
                <p className="text-sm text-[color:var(--sp-error-600)] mt-1">{errors.customer_phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Direccion de entrega
              </label>
              <textarea
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                placeholder="Calle 123 Apartamento 12B"
              />
              {errors.delivery_address && (
                <p className="text-sm text-[color:var(--sp-error-600)] mt-1">{errors.delivery_address}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="heading-section flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Menu del Dia
            </h3>

            <div className="grid gap-3">
        {menu.combinaciones
                .filter(c => c.is_available)
                .map((combinacion) => (
                <div 
                  key={combinacion.id}
          className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4 hover:border-[color:var(--sp-primary-300)] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
            <h4 className="font-medium text-[color:var(--sp-neutral-900)]">
                        {combinacion.combination_name}
                      </h4>
            <p className="value-number text-[color:var(--sp-neutral-900)] mt-1">
                        ${combinacion.combination_price.toLocaleString()}
                      </p>
                    </div>
        <button
                      type="button"
                      onClick={() => agregarItem(combinacion.id)}
      className="px-3 py-1 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] text-sm rounded hover:bg-[color:var(--sp-primary-700)] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.items && (
        <p className="text-sm text-[color:var(--sp-error-600)]">{errors.items}</p>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-4">
              <h3 className="heading-section">
                Resumen del Pedido
              </h3>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-[color:var(--sp-neutral-900)]">
                          {item.combination_name}
                        </h4>
                        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                          ${item.unit_price.toLocaleString()} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(index, item.quantity - 1)}
                          className="p-1 hover:bg-[color:var(--sp-neutral-200)] rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(index, item.quantity + 1)}
                          className="p-1 hover:bg-[color:var(--sp-neutral-200)] rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[color:var(--sp-neutral-200)] flex justify-between items-center">
                      <span className="text-sm text-[color:var(--sp-neutral-600)]">Subtotal:</span>
                      <span className="font-semibold text-[color:var(--sp-neutral-900)]">
                        ${calcularSubtotal(item).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              Notas especiales
            </label>
            <textarea
              value={formData.special_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, special_notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
              placeholder="Instrucciones adicionales"
            />
          </div>
        </div>
      </div>

  <div className="border-t border-[color:var(--sp-neutral-200)] p-6 bg-[--sp-surface-elevated]">
        {items.length > 0 && (
          <div className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${(calcularTotal() - DEFAULT_DELIVERY_FEE).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Domicilio:</span>
              <span>${Math.round(DEFAULT_DELIVERY_FEE / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold value-number border-t pt-2">
              <span>Total:</span>
              <span>${Math.round(calcularTotal() / 100).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="flex-1 px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}