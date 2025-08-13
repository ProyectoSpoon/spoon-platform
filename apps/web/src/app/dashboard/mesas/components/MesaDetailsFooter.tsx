/**
 * FOOTER PARA DETALLES DE MESA
 * Responsabilidad: botón de cobro y acciones principales
 * Refactorizado desde MesaDetallesPanel.tsx
 */

import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { DollarSign } from 'lucide-react';
import { Mesa } from '@spoon/shared/types/mesas';
import { formatearMoneda } from '@spoon/shared/utils/mesas';

interface MesaDetailsFooterProps {
  mesa: Mesa;
  cobrando?: boolean;
  onCobrar: () => void;
  onClose: () => void;
}

export const MesaDetailsFooter: React.FC<MesaDetailsFooterProps> = ({
  mesa,
  cobrando = false,
  onCobrar,
  onClose
}) => {
  
  // No mostrar footer para mesas inactivas o en mantenimiento
  if (mesa.estado === 'inactiva' || mesa.estado === 'mantenimiento') {
    return null;
  }

  return (
    <div className="border-t bg-gray-50 p-4 space-y-3">
      {mesa.estado === 'ocupada' && mesa.ordenActiva ? (
        <>
          <Button
            onClick={onCobrar}
            disabled={cobrando || !mesa.ordenActiva.total}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
          >
            {cobrando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5 mr-2" />
                COBRAR {formatearMoneda(mesa.ordenActiva.total)}
              </>
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={cobrando}
          >
            Cerrar
          </Button>
        </>
      ) : (
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          Cerrar
        </Button>
      )}

      <div className="text-center text-xs text-gray-500">
        {mesa.estado === 'ocupada' 
          ? '💡 Como administrador puedes editar, eliminar o cobrar órdenes'
          : '🔧 Panel de administrador - Control total de mesas'
        }
      </div>
    </div>
  );
};

export default MesaDetailsFooter;
