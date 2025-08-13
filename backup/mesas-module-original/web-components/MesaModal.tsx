// Modal para ver detalles de mesa y cobrar
import React, { useState, useEffect } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { getDetallesMesa } from '@spoon/shared/lib/supabase';
import { X, DollarSign, Clock } from 'lucide-react';
import type { ItemMesa } from '@spoon/shared/types/mesas';

interface MesaModalProps {
  mesaNumero: number;
  isOpen: boolean;
  onClose: () => void;
  onCobrar: (numero: number) => Promise<boolean>;
  restaurantId: string;
}

const MesaModal: React.FC<MesaModalProps> = ({ 
  mesaNumero, 
  isOpen, 
  onClose, 
  onCobrar, 
  restaurantId 
}) => {
  const [detalles, setDetalles] = useState<{
    mesa: number;
    items: any[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cobrando, setCobrando] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cargarDetalles = async () => {
    if (!isOpen || !restaurantId) return;
    
    setLoading(true);
    try {
      const data = await getDetallesMesa(restaurantId, mesaNumero);
      console.log('🎯 MesaModal - Datos recibidos:', data);
      setDetalles(data);
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCobrar = async () => {
    setCobrando(true);
    try {
      const success = await onCobrar(mesaNumero);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error procesando cobro:', error);
    } finally {
      setCobrando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarDetalles();
    } else {
      setDetalles(null);
    }
  }, [isOpen, restaurantId, mesaNumero]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Mesa {mesaNumero}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando detalles...</p>
            </div>
          ) : detalles ? (
            <>
              {/* Items consumidos */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Productos consumidos:
                </h3>
                
                <div className="space-y-2">
                  {detalles.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-900">
                        <span className="font-bold">{item.cantidad}x</span>{' '}
                        {item.nombre || 'Sin nombre'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.precio_total || 0)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Debug info en desarrollo */}
                  {process.env.NODE_ENV === 'development' && detalles.items.length > 0 && (
                    <div className="mt-4 p-2 bg-yellow-100 text-xs rounded">
                      <details>
                        <summary className="cursor-pointer">🔍 Debug - Ver estructura de datos</summary>
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(detalles.items[0], null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    TOTAL:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(detalles.total)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron detalles para esta mesa
            </div>
          )}
        </div>

        {/* Footer */}
        {detalles && (
          <div className="p-4 border-t bg-gray-50 space-y-2">
            <Button
              onClick={handleCobrar}
              disabled={cobrando}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
            >
              {cobrando ? 'Procesando...' : `COBRAR ${formatCurrency(detalles.total)}`}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesaModal;
