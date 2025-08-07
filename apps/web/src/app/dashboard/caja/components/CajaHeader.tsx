import React, { useState } from 'react';
import { Button } from '@spoon/shared/components/ui/button';
import { Store, Plus, Receipt } from 'lucide-react';

interface CajaHeaderProps {
  estadoCaja: 'abierta' | 'cerrada';
  ordensPendientes?: number;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
  onNuevaVenta: () => void;
  onNuevoGasto: () => void;
  loading?: boolean;
}

export const CajaHeader: React.FC<CajaHeaderProps> = ({
  estadoCaja,
  ordensPendientes = 0,
  onAbrirCaja,
  onCerrarCaja,
  onNuevaVenta,
  onNuevoGasto,
  loading = false
}) => {
  const [showVentaOptions, setShowVentaOptions] = useState(false);

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      {/* Título y estado de caja */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Movimientos
        </h1>
        
        {/* Indicador de estado de caja - sutil */}
        {estadoCaja === 'abierta' && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">
              Caja Abierta
            </span>
            {ordensPendientes > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {ordensPendientes} pendientes
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acciones principales */}
      <div className="flex items-center space-x-3">
        {/* Botón Abrir/Cerrar Caja */}
        <Button
          variant="outline"
          onClick={estadoCaja === 'cerrada' ? onAbrirCaja : onCerrarCaja}
          disabled={loading}
          className={`
            ${estadoCaja === 'cerrada' 
              ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' 
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }
          `}
        >
          <Store className="w-4 h-4 mr-2" />
          {estadoCaja === 'cerrada' ? 'Abrir caja' : 'Cerrar caja'}
        </Button>

        {/* Botón Nueva Venta - Simplificado */}
        <Button
          onClick={onNuevaVenta}
          disabled={estadoCaja === 'cerrada' || loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva venta
        </Button>

        {/* Botón Nuevo Gasto */}
        <Button
          variant="outline"
          onClick={onNuevoGasto}
          disabled={estadoCaja === 'cerrada' || loading}
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          <Receipt className="w-4 h-4 mr-2" />
          Nuevo gasto
        </Button>
      </div>
    </div>
  );
};

// Componente adicional para mostrar información de sesión actual
export const CajaStatus: React.FC<{
  sesionActual?: any; // Cambiar tipo para ser más flexible
  estadoCaja: 'abierta' | 'cerrada';
}> = ({ sesionActual, estadoCaja }) => {
  if (estadoCaja === 'cerrada' || !sesionActual) return null;

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(centavos / 100);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800">Sesión activa</span>
          </div>
          <span className="text-green-700">
            Desde: {new Date(sesionActual.abierta_at).toLocaleTimeString('es-CO', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="text-green-700">
            Inicial: {formatCurrency(sesionActual.monto_inicial)}
          </span>
        </div>
        
        {sesionActual.usuario_nombre && (
          <span className="text-green-600 text-xs">
            👤 {sesionActual.usuario_nombre}
          </span>
        )}
      </div>
    </div>
  );
};