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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
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
            className="w-full justify-start text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            Poner en Mantenimiento
          </Button>

          <Button 
            onClick={onInactivarMesa}
            variant="outline"
            className="w-full justify-start text-gray-600 border-gray-300 hover:bg-gray-50"
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
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button 
              onClick={onEliminarOrden}
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
            className="w-full bg-green-600 hover:bg-green-700 text-white"
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
            className="w-full bg-green-600 hover:bg-green-700 text-white"
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
