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
          <Button 
            onClick={onCrearOrden}
            className="w-full bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[--sp-on-primary] justify-start"
          >
            <Plus className="h-4 w-4 mr-3" />
            Crear Nueva Orden
          </Button>
          
          <Button 
            onClick={onReservarMesa}
            variant="outline"
            className="w-full justify-start"
          >
            <Calendar className="h-4 w-4 mr-3" />
            Reservar Mesa
          </Button>

          <Button 
            onClick={onPonerMantenimiento}
            variant="outline"
            className="w-full justify-start text-[color:var(--sp-warning-600)] border-[color:var(--sp-warning-300)] hover:bg-[color:var(--sp-warning-50)]"
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            Poner en Mantenimiento
          </Button>

          <Button 
            onClick={onInactivarMesa}
            variant="outline"
            className="w-full justify-start text-[color:var(--sp-neutral-600)] border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-50)]"
          >
            <X className="h-4 w-4 mr-3" />
            Inactivar Mesa
          </Button>
        </div>
      );

    case 'ocupada':
      return (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              onClick={onEditarOrden}
              variant="outline" 
              size="sm"
              className="text-[color:var(--sp-primary-600)] border-[color:var(--sp-primary-300)] hover:bg-[color:var(--sp-primary-50)]"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button 
              onClick={onEliminarOrden}
              variant="outline" 
              size="sm"
              className="text-[color:var(--sp-error-600)] border-[color:var(--sp-error-300)] hover:bg-[color:var(--sp-error-50)]"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      );

    case 'reservada':
      return (
        <div className="p-4 space-y-2">
          <Button 
            onClick={onCrearOrden}
            className="w-full bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[--sp-on-primary]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Orden (Liberar Reserva)
          </Button>
          <Button 
            onClick={onLiberarReserva}
            variant="outline"
            className="w-full"
          >
            Solo Liberar Reserva
          </Button>
        </div>
      );

    case 'inactiva':
      return (
        <div className="p-4">
          <Button 
            onClick={onActivarMesa}
            className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[--sp-on-success]"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Activar Mesa
          </Button>
        </div>
      );

    case 'mantenimiento':
      return (
        <div className="p-4 space-y-2">
          <Button 
            onClick={onActivarMesa}
            className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[--sp-on-success]"
          >
            Finalizar Mantenimiento
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onActualizarNotas}
          >
            <Settings className="h-4 w-4 mr-2" />
            Actualizar Notas
          </Button>
        </div>
      );

    default:
      return null;
  }
};

export default MesaDetailsActions;
