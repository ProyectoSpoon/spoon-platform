/**
 * ACCIONES PARA DETALLES DE MESA
 * Responsabilidad: botones de acción según estado de mesa
 * Refactorizado desde MesaDetallesPanel.tsx
 */

import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import { Mesa } from '@spoon/shared/types/mesas';
import { getAccionesDisponibles } from '@spoon/shared/utils/mesas';

// Type casting para componentes
const ButtonCast = Button as any;
const PlusCast = Plus as any;
const Edit3Cast = Edit3 as any;
const Trash2Cast = Trash2 as any;
const CalendarCast = Calendar as any;
const AlertCircleCast = AlertCircle as any;
const CheckCircleCast = CheckCircle as any;
const XCast = X as any;
const SettingsCast = Settings as any;

interface MesaDetailsActionsProps {
  mesa: Mesa;
  loading?: boolean;
  onCrearOrden: () => void;
  onEditarOrden: () => void;
  onEliminarOrden: () => void;
  onReservarMesa: () => void;
  onLiberarReserva: () => void;
  onActivarMesa: () => void;
  onInactivarMesa: () => void;
  onPonerMantenimiento: () => void;
  onActualizarNotas: () => void;
}

export const MesaDetailsActions: React.FC<MesaDetailsActionsProps> = ({
  mesa,
  loading = false,
  onCrearOrden,
  onEditarOrden,
  onEliminarOrden,
  onReservarMesa,
  onLiberarReserva,
  onActivarMesa,
  onInactivarMesa,
  onPonerMantenimiento,
  onActualizarNotas
}) => {
  
  const accionesDisponibles = getAccionesDisponibles(mesa);
  
  if (loading) {
    return null;
  }

  // Renderizado específico por estado
  switch (mesa.estado) {
    case 'libre':
      return (
        <div className="p-4 space-y-3">
          <ButtonCast 
            onClick={onCrearOrden}
            className="w-full bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[--sp-on-primary] justify-start"
          >
            <PlusCast className="h-4 w-4 mr-3" />
            Crear Nueva Orden
          </ButtonCast>
          
          <ButtonCast 
            onClick={onReservarMesa}
            variant="outline"
            className="w-full justify-start"
          >
            <CalendarCast className="h-4 w-4 mr-3" />
            Reservar Mesa
          </ButtonCast>

          <ButtonCast 
            onClick={onPonerMantenimiento}
            variant="outline"
            className="w-full justify-start text-[color:var(--sp-warning-600)] border-[color:var(--sp-warning-300)] hover:bg-[color:var(--sp-warning-50)]"
          >
            <AlertCircleCast className="h-4 w-4 mr-3" />
            Poner en Mantenimiento
          </ButtonCast>

          <ButtonCast 
            onClick={onInactivarMesa}
            variant="outline"
            className="w-full justify-start text-[color:var(--sp-neutral-600)] border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-50)]"
          >
            <XCast className="h-4 w-4 mr-3" />
            Inactivar Mesa
          </ButtonCast>
        </div>
      );

    case 'ocupada':
      return (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <ButtonCast 
              onClick={onEditarOrden}
              variant="outline" 
              size="sm"
              className="text-[color:var(--sp-primary-600)] border-[color:var(--sp-primary-300)] hover:bg-[color:var(--sp-primary-50)]"
            >
              <Edit3Cast className="h-3 w-3 mr-1" />
              Editar
            </ButtonCast>
            <ButtonCast 
              onClick={onEliminarOrden}
              variant="outline" 
              size="sm"
              className="text-[color:var(--sp-error-600)] border-[color:var(--sp-error-300)] hover:bg-[color:var(--sp-error-50)]"
            >
              <Trash2Cast className="h-3 w-3 mr-1" />
              Eliminar
            </ButtonCast>
          </div>
        </div>
      );

    case 'reservada':
      return (
        <div className="p-4 space-y-2">
          <ButtonCast 
            onClick={onCrearOrden}
            className="w-full bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[--sp-on-primary]"
          >
            <PlusCast className="h-4 w-4 mr-2" />
            Crear Orden (Liberar Reserva)
          </ButtonCast>
          <ButtonCast 
            onClick={onLiberarReserva}
            variant="outline"
            className="w-full"
          >
            Solo Liberar Reserva
          </ButtonCast>
        </div>
      );

    case 'inactiva':
      return (
        <div className="p-4">
          <ButtonCast 
            onClick={onActivarMesa}
            className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[--sp-on-success]"
          >
            <CheckCircleCast className="h-4 w-4 mr-2" />
            Activar Mesa
          </ButtonCast>
        </div>
      );

    case 'mantenimiento':
      return (
        <div className="p-4 space-y-2">
          <ButtonCast 
            onClick={onActivarMesa}
            className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[--sp-on-success]"
          >
            Finalizar Mantenimiento
          </ButtonCast>
          <ButtonCast 
            variant="outline" 
            className="w-full"
            onClick={onActualizarNotas}
          >
            <SettingsCast className="h-4 w-4 mr-2" />
            Actualizar Notas
          </ButtonCast>
        </div>
      );

    default:
      return null;
  }
};

export default MesaDetailsActions;
