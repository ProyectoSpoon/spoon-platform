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

// Type casting para componentes
const ButtonCast = Button as any;
const DollarSignCast = DollarSign as any;

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
    <div className="border-t border-[color:var(--sp-neutral-200)] bg-[--sp-surface] p-4 space-y-3">
      {mesa.estado === 'ocupada' && mesa.ordenActiva ? (
        <>
          <ButtonCast
            onClick={onCobrar}
            disabled={cobrando || !mesa.ordenActiva.total}
            className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[--sp-on-success] font-bold py-3 text-lg"
          >
            {cobrando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--sp-on-success] mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <DollarSignCast className="h-5 w-5 mr-2" />
                COBRAR {formatearMoneda(mesa.ordenActiva.total)}
              </>
            )}
          </ButtonCast>
          
          <ButtonCast
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={cobrando}
          >
            Cerrar
          </ButtonCast>
        </>
      ) : (
        <ButtonCast
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          Cerrar
        </ButtonCast>
      )}

    <div className="text-center text-xs text-[color:var(--sp-neutral-500)]">
        {mesa.estado === 'ocupada' 
          ? '💡 Como administrador puedes editar, eliminar o cobrar órdenes'
      : '🛠️ Panel de administrador - Control total de mesas'
        }
      </div>
    </div>
  );
};

export default MesaDetailsFooter;
