// Componente individual de mesa - Compatible con Sistema Maestro + Diseño Mejorado
import React from 'react';
import { COLORES_ESTADO, TEXTOS_ESTADO } from '@spoon/shared/constants/mesas/mesasConstants';
import { Users, MapPin, AlertCircle, Clock, DollarSign, Sparkles } from 'lucide-react';

// ========================================
// INTERFACES EXTENDIDAS
// ========================================

interface MesaCardProps {
  numero: number;
  estado: 'vacia' | 'ocupada';
  total?: number;
  onClick: () => void;
  
  // Props del sistema maestro (opcionales para compatibilidad)
  nombre?: string;
  zona?: string;
  capacidad?: number;
  estadoMesa?: 'libre' | 'ocupada' | 'reservada' | 'inactiva' | 'mantenimiento'; // ← AGREGADO 'mantenimiento'
  
  // Props nuevas para info adicional (opcionales)
  tiempoOcupada?: number;  // minutos
  mesero?: string;         // nombre del mesero
  items?: number;          // cantidad de items en la orden
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const MesaCard: React.FC<MesaCardProps> = ({ 
  numero, 
  estado, 
  total, 
  onClick,
  // Props del sistema maestro
  nombre,
  zona,
  capacidad,
  estadoMesa,
  // Props nuevas
  tiempoOcupada,
  mesero,
  items
}) => {
  
  // ========================================
  // LÓGICA DE ESTADO Y COLORES MEJORADA
  // ========================================
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Determinar el estado visual (prioridad: estado prop > estadoMesa)
  const estadoVisual = estado;
  
  // Determinar si está deshabilitada - SOLO INACTIVAS Y MANTENIMIENTO (administrador puede el resto)
  const isDisabled = estadoMesa === 'inactiva' || estadoMesa === 'mantenimiento';
  const isOcupada = estado === 'ocupada';
  
  // Obtener configuración visual mejorada según el estado
  const getEstadoConfig = () => {
    if (estadoMesa === 'reservada') {
      return {
        bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100',
        border: 'border-yellow-300 hover:border-yellow-400',
        shadow: 'shadow-yellow-100 hover:shadow-yellow-200',
        indicator: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        badge: 'bg-yellow-500',
        statusText: 'Reservada'
      };
    }
    
    if (estadoMesa === 'inactiva') {
      return {
        bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
        border: 'border-gray-300',
        shadow: 'shadow-gray-100',
        indicator: 'bg-gray-400',
        textColor: 'text-gray-500',
        badge: 'bg-gray-400',
        statusText: 'Inactiva'
      };
    }

    if (estadoMesa === 'mantenimiento') {
      return {
        bg: 'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100',
        border: 'border-orange-300',
        shadow: 'shadow-orange-100',
        indicator: 'bg-orange-500',
        textColor: 'text-orange-700',
        badge: 'bg-orange-500',
        statusText: 'Mantenimiento'
      };
    }
    
    // Estados por defecto con gradientes
    if (estado === 'ocupada') {
      return {
        bg: 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100',
        border: 'border-red-300 hover:border-red-400',
        shadow: 'shadow-red-100 hover:shadow-red-200',
        indicator: 'bg-red-500',
        textColor: 'text-red-700',
        badge: 'bg-red-500',
        statusText: 'Ocupada'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
        border: 'border-green-300 hover:border-green-400',
        shadow: 'shadow-green-100 hover:shadow-green-200',
        indicator: 'bg-green-500',
        textColor: 'text-green-700',
        badge: 'bg-green-500',
        statusText: 'Libre'
      };
    }
  };

  const config = getEstadoConfig();

  // Obtener texto del estado
  const getTextoEstado = () => {
    if (estadoMesa === 'reservada') return 'Reservada';
    if (estadoMesa === 'inactiva') return 'Inactiva';
    if (estadoMesa === 'mantenimiento') return 'Mantenimiento';
    return TEXTOS_ESTADO[estado];
  };

  // ========================================
  // RENDERIZADO MEJORADO
  // ========================================

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-xl border-2 text-center transition-all duration-200 min-h-[140px] 
        flex flex-col justify-between transform hover:scale-[1.02]
        ${config.bg} ${config.border} shadow-lg ${config.shadow}
        ${isDisabled 
          ? 'cursor-not-allowed opacity-75' 
          : 'cursor-pointer hover:shadow-xl'
        }
      `}
    >
      {/* Indicador de estado - esquina superior derecha */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${config.indicator} shadow-sm`} />
      
      {/* Badge especial para estados importantes */}
      {(estadoMesa === 'reservada' || estadoMesa === 'inactiva' || estadoMesa === 'mantenimiento') && (
        <div className={`absolute -top-2 -right-2 ${config.badge} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
          {estadoMesa === 'reservada' ? 'R' : estadoMesa === 'mantenimiento' ? 'M' : 'X'}
        </div>
      )}

      {/* Header: Número y nombre de mesa con tiempo */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {nombre || `Mesa ${numero}`}
          </h3>
          {isOcupada && tiempoOcupada && (
            <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/60 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {tiempoOcupada}m
            </div>
          )}
        </div>
        {nombre && (
          <div className="text-xs text-gray-500">
            #{numero}
          </div>
        )}
      </div>
      
      {/* Información adicional del sistema maestro */}
      <div className="space-y-2 mb-3">
        {/* Zona */}
        {zona && zona !== 'Principal' && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{zona}</span>
          </div>
        )}
        
        {/* Capacidad */}
        {capacidad && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span>{capacidad} pers.</span>
          </div>
        )}

        {/* Mesero (si está ocupada) */}
        {isOcupada && mesero && (
          <div className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded">
            👤 {mesero}
          </div>
        )}
      </div>

      {/* Estado visual */}
      <div className="mb-3">
        <div 
          className={`text-xs font-semibold ${config.textColor} flex items-center justify-center gap-1`}
        >
          {estadoMesa === 'inactiva' && <AlertCircle className="h-3 w-3" />}
          {estadoMesa === 'mantenimiento' && <AlertCircle className="h-3 w-3" />}
          {isOcupada && <Sparkles className="h-3 w-3" />}
          {getTextoEstado()}
        </div>
      </div>

      {/* Total y detalles si está ocupada */}
      {isOcupada && total && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Total:</span>
            {items && (
              <span className="text-xs text-gray-500">{items} items</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}

      {/* Placeholder para mesas libres */}
      {!isOcupada && estadoMesa !== 'inactiva' && estadoMesa !== 'mantenimiento' && (
        <div className="text-center py-2">
          <div className={`text-sm font-medium ${config.textColor}`}>
            Lista para huéspedes
          </div>
        </div>
      )}

      {/* Mensaje para mesa inactiva */}
      {estadoMesa === 'inactiva' && (
        <div className="text-center py-2">
          <div className="text-xs text-gray-500">
            Fuera de servicio
          </div>
        </div>
      )}

      {/* Mensaje para mesa en mantenimiento */}
      {estadoMesa === 'mantenimiento' && (
        <div className="text-center py-2">
          <div className="text-xs text-orange-600">
            En mantenimiento
          </div>
        </div>
      )}
    </button>
  );
};

export default MesaCard;