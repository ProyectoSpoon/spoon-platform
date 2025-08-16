import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Store, Plus, Receipt } from 'lucide-react';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

interface CajaHeaderProps {
  estadoCaja: 'abierta' | 'cerrada';
  ordenesPendientes?: number;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
  onNuevaVenta: () => void;
  onNuevoGasto: () => void;
  loading?: boolean;
  requiereSaneamiento?: boolean;
  onCerrarSesionPrevia?: () => void;
}

export const CajaHeader: React.FC<CajaHeaderProps> = ({
  estadoCaja,
  ordenesPendientes = 0,
  onAbrirCaja,
  onCerrarCaja,
  onNuevaVenta,
  onNuevoGasto,
  loading = false,
  requiereSaneamiento = false,
  onCerrarSesionPrevia
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Título y estado de caja */}
      <div className="flex items-center space-x-4">
  <h1 className="text-[14px] font-semibold text-[color:var(--sp-neutral-900)]">Movimientos</h1>
        
        {/* Indicador de estado de caja - sutil */}
        {estadoCaja === 'abierta' && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[color:var(--sp-success-500)] rounded-full animate-pulse"></div>
            <span className="text-[12px] text-[color:var(--sp-success-700)] font-medium">
              Caja Abierta
            </span>
      {ordenesPendientes > 0 && (
              <span className="text-[12px] bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)] px-2 py-1 rounded-full">
        {ordenesPendientes} pendientes
              </span>
            )}
            {requiereSaneamiento && (
              <span className="text-[12px] bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)] px-2 py-1 rounded-full">
                Sesión previa detectada
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
              ? 'bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)] border-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-100)]' 
              : 'bg-[color:var(--sp-error-50)] text-[color:var(--sp-error-700)] border-[color:var(--sp-error-200)] hover:bg-[color:var(--sp-error-100)]'
            }
          `}
        >
          <Store className="w-4 h-4 mr-2" />
          {estadoCaja === 'cerrada' ? 'Abrir caja' : 'Cerrar caja'}
        </Button>

        {/* Botón saneador: cerrar sesión previa */}
        {requiereSaneamiento && (
          <Button
            variant="outline"
            onClick={onCerrarSesionPrevia}
            disabled={loading}
            className="bg-[color:var(--sp-warning-50)] text-[color:var(--sp-warning-800)] border-[color:var(--sp-warning-200)] hover:bg-[color:var(--sp-warning-100)]"
          >
            Cerrar sesión previa
          </Button>
        )}

        {/* Botón Nueva Venta - Variante verde + estados focus/active visibles */}
        <Button
          variant="outline"
          onClick={onNuevaVenta}
          disabled={estadoCaja === 'cerrada' || loading}
          className="bg-[color:var(--sp-success-50)] text-[color:var(--sp-success-800)] border-[color:var(--sp-success-200)] hover:bg-[color:var(--sp-success-100)] hover:border-[color:var(--sp-success-300)] hover:text-[color:var(--sp-success-900)] hover:shadow-sm active:bg-[color:var(--sp-success-200)] focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva venta
        </Button>

        {/* Botón Nuevo Gasto */}
        <Button
          variant="outline"
          onClick={onNuevoGasto}
          disabled={estadoCaja === 'cerrada' || loading}
          className="bg-[color:var(--sp-error-50)] text-[color:var(--sp-error-700)] border-[color:var(--sp-error-200)] hover:bg-[color:var(--sp-error-100)]"
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

  const formatCurrency = (centavos: number) => formatCurrencyCOP(centavos);
  // Asegurar hora mostrada en zona horaria de Bogotá para evitar desfases
  const formatHoraBogota = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Bogota'
      }).format(new Date(isoString));
    } catch {
      // Fallback seguro
      return new Date(isoString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-3">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[color:var(--sp-success-500)] rounded-full animate-pulse"></div>
            <span className="font-medium text-[color:var(--sp-success-800)]">Sesión activa</span>
          </div>
          <span className="text-[color:var(--sp-success-700)]">
            Desde: {formatHoraBogota(sesionActual.abierta_at)}
          </span>
          <span className="text-[color:var(--sp-success-700)]">
            Inicial: {formatCurrency(sesionActual.monto_inicial)}
          </span>
        </div>
        
        {sesionActual.usuario_nombre && (
          <span className="text-[color:var(--sp-success-600)] text-[12px]">
            👤 {sesionActual.usuario_nombre}
          </span>
        )}
      </div>
    </div>
  );
};