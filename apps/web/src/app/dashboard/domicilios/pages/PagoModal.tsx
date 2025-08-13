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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="heading-section text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Registrar Pago
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              El domiciliario regreso con el pago
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Como pago el cliente?
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              <button
                type="button"
                onClick={() => setTipoPago('efectivo')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoPago === 'efectivo'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <p className="text-sm font-medium">Efectivo</p>
                <p className="text-xs text-gray-500 mt-1">Dinero en cash</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoPago('digital')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoPago === 'digital'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <p className="text-sm font-medium">Digital</p>
                <p className="text-xs text-gray-500 mt-1">Transferencia/QR</p>
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={() => handleSubmit(tipoPago)}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tipoPago === 'efectivo'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
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