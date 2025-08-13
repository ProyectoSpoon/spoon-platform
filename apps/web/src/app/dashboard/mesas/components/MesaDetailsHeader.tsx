/**
 * HEADER PARA DETALLES DE MESA
 * Responsabilidad: mostrar información básica y estado de la mesa
 * Refactorizado desde MesaDetallesPanel.tsx
 */

import React from 'react';
import { X, Users } from 'lucide-react';
import { Mesa } from '@spoon/shared/types/mesas';
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';
import { formatearNombreMesa, formatearCapacidad } from '@spoon/shared/utils/mesas';

interface MesaDetailsHeaderProps {
  mesa: Mesa;
  onClose: () => void;
}

export const MesaDetailsHeader: React.FC<MesaDetailsHeaderProps> = ({ 
  mesa, 
  onClose 
}) => {
  const estadoDisplay = getEstadoDisplay(mesa);
  
  const getColorClasses = () => {
    const colorMap = {
      green: 'bg-green-600',
      red: 'bg-red-600', 
      yellow: 'bg-yellow-600',
      gray: 'bg-gray-700',
      orange: 'bg-orange-600'
    };
    return colorMap[estadoDisplay.color as keyof typeof colorMap] || 'bg-gray-600';
  };

  return (
    <div className={`${getColorClasses()} text-white p-4 flex justify-between items-center`}>
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold">
            {formatearNombreMesa(mesa.numero, mesa.nombre)}
          </h2>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>{estadoDisplay.texto}</span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatearCapacidad(mesa.capacidad)}</span>
            </div>
            {mesa.zona && mesa.zona !== 'Principal' && (
              <span>• {mesa.zona}</span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="text-white hover:text-gray-300 transition-colors p-1"
        aria-label="Cerrar panel de detalles"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MesaDetailsHeader;
