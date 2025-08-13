// Componente individual de mesa - Compatible con Sistema Maestro + Diseño Mejorado
import React from 'react';
import { TEXTOS_ESTADO, COLORES_ESTADO } from '@spoon/shared/constants/mesas/mesasConstants';
import { Users, MapPin, AlertCircle, Clock, DollarSign, Sparkles } from 'lucide-react';

// ========================================
// INTERFACES EXTENDIDAS
// ========================================

interface MesaCardProps {
  numero: number;
  estado: 'vacia' | 'ocupada';
  total?: number;
  onClick: () => void;
  seleccionada?: boolean;
  
  // Props del sistema maestro (opcionales para compatibilidad)
  nombre?: string;
  zona?: string;
  capacidad?: number;
  estadoMesa?: 'libre' | 'ocupada' | 'reservada' | 'inactiva' | 'mantenimiento' | 'en_cocina' | 'servida' | 'por_cobrar';
  
  // Props nuevas para info adicional (opcionales)
  tiempoOcupada?: number;  // minutos
  mesero?: string;         // nombre del mesero
  items?: number;          // cantidad de items en la orden
  comensales?: number;     // huéspedes reales
  inicioAtencion?: string; // ISO string para calcular tiempo transcurrido
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const MesaCard: React.FC<MesaCardProps> = ({ 
  numero, 
  estado, 
  total, 
  onClick,
  seleccionada,
  // Props del sistema maestro
  nombre,
  zona,
  capacidad,
  estadoMesa,
  // Props nuevas
  tiempoOcupada,
  mesero,
  items,
  comensales,
  inicioAtencion
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

  // Determinar el estado visual (prioridad: estadoMesa si existe)
  const estadoVisual = estadoMesa ? (estadoMesa === 'libre' ? 'vacia' : 'ocupada') : estado;
  
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
    
    if (estadoMesa === 'en_cocina') {
      return {
        bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100',
        border: 'border-blue-300 hover:border-blue-400',
        shadow: 'shadow-blue-100 hover:shadow-blue-200',
        indicator: 'bg-blue-500',
        textColor: 'text-blue-700',
        badge: 'bg-blue-500',
        statusText: 'En Cocina'
      };
    }

    if (estadoMesa === 'servida') {
      return {
        bg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
        border: 'border-purple-300 hover:border-purple-400',
        shadow: 'shadow-purple-100 hover:shadow-purple-200',
        indicator: 'bg-purple-600',
        textColor: 'text-purple-700',
        badge: 'bg-purple-600',
        statusText: 'Servida'
      };
    }

    if (estadoMesa === 'por_cobrar') {
      return {
        bg: 'bg-gradient-to-br from-rose-50 via-red-50 to-rose-100',
        border: 'border-red-300 hover:border-red-400',
        shadow: 'shadow-red-100 hover:shadow-red-200',
        indicator: 'bg-red-500',
        textColor: 'text-red-700',
        badge: 'bg-red-500',
        statusText: 'Por Cobrar'
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
  // Color base exacto por estado (usa estadoMesa si existe, de lo contrario mapea 'estado')
  const estadoClave = (estadoMesa ?? (estado === 'ocupada' ? 'ocupada' : 'libre')) as keyof typeof COLORES_ESTADO;
  const baseColor = COLORES_ESTADO[estadoClave];

  // Obtener texto del estado
  const getTextoEstado = () => {
    if (estadoMesa === 'reservada') return TEXTOS_ESTADO.reservada;
    if (estadoMesa === 'inactiva') return TEXTOS_ESTADO.inactiva;
    if (estadoMesa === 'mantenimiento') return TEXTOS_ESTADO.mantenimiento;
    if (estadoMesa === 'en_cocina') return TEXTOS_ESTADO.en_cocina;
    if (estadoMesa === 'servida') return TEXTOS_ESTADO.servida;
    if (estadoMesa === 'por_cobrar') return TEXTOS_ESTADO.por_cobrar;
    return estado === 'ocupada' ? TEXTOS_ESTADO.ocupada : TEXTOS_ESTADO.libre;
  };

  // Tiempo transcurrido calculado localmente (auto-actualizado)
  const [elapsedMinutes, setElapsedMinutes] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!inicioAtencion) {
      setElapsedMinutes(null);
      return;
    }
    const calc = () => {
      const start = new Date(inicioAtencion);
      const now = new Date();
      const diffMin = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
      setElapsedMinutes(diffMin);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [inicioAtencion]);

  // ========================================
  // RENDERIZADO MEJORADO
  // ========================================

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        group relative p-4 rounded-xl border-2 text-left transition-all duration-200 min-h-[140px]
        flex flex-col justify-between
        ${config.bg} ${config.border} shadow-lg ${config.shadow}
        ${seleccionada ? 'ring-2 ring-sky-400 border-sky-400 bg-white/70' : ''}
        ${isDisabled 
          ? 'cursor-not-allowed opacity-75' 
          : 'cursor-pointer hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0'
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
      `}
      aria-pressed={!!seleccionada}
      aria-label={`${nombre || `Mesa ${numero}`}, ${getTextoEstado()}${isOcupada && total ? `, total ${formatCurrency(total)}` : ''}`}
    >
      {/* Indicador de estado - esquina superior derecha */}
   <div className={`absolute top-3 right-3 w-3 h-3 rounded-full shadow-sm`}
     style={{ backgroundColor: baseColor }}
   />
      
      {/* Badge especial para estados importantes */}
      {(estadoMesa === 'reservada' || estadoMesa === 'inactiva' || estadoMesa === 'mantenimiento') && (
        <div className={`absolute -top-2 -right-2 ${config.badge} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
          {estadoMesa === 'reservada' ? 'R' : estadoMesa === 'mantenimiento' ? 'M' : 'X'}
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {nombre || `Mesa ${numero}`}
          </h3>
  {(estadoMesa && estadoMesa !== 'libre') && (elapsedMinutes !== null || tiempoOcupada) && (
            <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-0.5 rounded-full border border-white/60">
              <Clock className="h-3 w-3" />
        {elapsedMinutes !== null ? `${elapsedMinutes} min` : `${tiempoOcupada}m`}
            </div>
          )}
        </div>
        {nombre && (
          <div className="text-xs text-gray-500">#{numero}</div>
        )}
      </div>
      
      {/* Body */}
      <div className="space-y-2 mb-2">
        {/* Zona */}
        {zona && zona !== 'Principal' && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{zona}</span>
          </div>
        )}
        
         {/* Ocupación actual y capacidad */}
         {(typeof comensales === 'number') && (
           <div className="flex items-center justify-center gap-1 text-xs text-gray-700">
             <Users className="h-3 w-3 flex-shrink-0" />
             <span>👥 {comensales} persona{comensales === 1 ? '' : 's'}</span>
           </div>
         )}
         {capacidad && (
           <div className="text-[11px] text-gray-500">
             Capacidad: {capacidad} persona{capacidad === 1 ? '' : 's'}
           </div>
         )}

        {/* Mesero (si está ocupada) */}
        {isOcupada && mesero && (
          <div className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded">
            👤 {mesero}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-white/70`}
               style={{ color: baseColor, border: `1px solid ${baseColor}` }}
          >
            {estadoMesa === 'inactiva' && <AlertCircle className="h-3 w-3" />}
            {estadoMesa === 'mantenimiento' && <AlertCircle className="h-3 w-3" />}
            {(isOcupada || estadoMesa === 'en_cocina' || estadoMesa === 'servida' || estadoMesa === 'por_cobrar') && <Sparkles className="h-3 w-3" />}
            <span>{getTextoEstado()}</span>
          </div>

          {isOcupada && total ? (
            <div className="flex items-center gap-1 text-sm font-semibold text-green-700">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>{formatCurrency(total)}</span>
              {items && <span className="text-xs text-gray-500 ml-1">({items})</span>}
            </div>
            ) : estadoMesa === 'en_cocina' ? (
              <div className="text-xs text-blue-700">🍽️ {items ?? 0} plato{(items ?? 0) === 1 ? '' : 's'} pendientes</div>
            ) : estadoMesa === 'servida' ? (
              <div className="text-xs text-purple-700">🍽️ Comida servida</div>
            ) : estadoMesa === 'inactiva' ? (
            <div className="text-xs text-gray-500">Fuera de servicio</div>
          ) : estadoMesa === 'mantenimiento' ? (
            <div className="text-xs text-orange-700">En mantenimiento</div>
          ) : (
            <div className="text-xs text-gray-600">Cap. {capacidad ?? '-'} pers.</div>
          )}
        </div>
      </div>
    </button>
  );
};

export default MesaCard;
