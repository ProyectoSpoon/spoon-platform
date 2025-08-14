'use client';

import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { RegistrarPago } from '../types/domiciliosTypes';

interface PagoModalProps {
  pedidoId: string;
  onSubmit: (data: RegistrarPago) => void;
  onClose: () => void;
  loading: boolean;
}

export default function PagoModal({ pedidoId, onSubmit, onClose, loading }: PagoModalProps) {
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'digital'>('efectivo');

  const handleSubmit = (tipo: 'efectivo' | 'digital') => {
    const pagoData: RegistrarPago = {
      pedido_id: pedidoId,
      monto_recibido: 0,
      tipo_pago: tipo,
      domiciliario_id: ''
    };

    onSubmit(pagoData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--sp-overlay] backdrop-blur-sm">
      <div className="bg-[--sp-surface-elevated] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
          <div>
            <h3 className="heading-section text-[color:var(--sp-neutral-900)] flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-[color:var(--sp-success-600)]" />
              Registrar Pago
            </h3>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
              El domiciliario regreso con el pago
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[color:var(--sp-neutral-200)] rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-900)] mb-3">
              Como pago el cliente?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPago('efectivo')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoPago === 'efectivo'
                    ? 'border-[color:var(--sp-success-500)] bg-[color:var(--sp-success-50)] text-[color:var(--sp-success-900)]'
                    : 'border-[color:var(--sp-neutral-200)] hover:border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)]'
                }`}
              >
                <p className="text-sm font-medium">Efectivo</p>
                <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">Dinero en cash</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoPago('digital')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoPago === 'digital'
                    ? 'border-[color:var(--sp-info-500)] bg-[color:var(--sp-info-50)] text-[color:var(--sp-info-900)]'
                    : 'border-[color:var(--sp-neutral-200)] hover:border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)]'
                }`}
              >
                <p className="text-sm font-medium">Digital</p>
                <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">Transferencia/QR</p>
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => handleSubmit(tipoPago)}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tipoPago === 'efectivo'
                  ? 'bg-[color:var(--sp-success-600)] text-[--sp-on-success] hover:bg-[color:var(--sp-success-700)]'
                  : 'bg-[color:var(--sp-info-600)] text-[--sp-on-info] hover:bg-[color:var(--sp-info-700)]'
              }`}
            >
              {loading ? 'Registrando...' : `Confirmar ${tipoPago === 'efectivo' ? '💵' : '💳'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}