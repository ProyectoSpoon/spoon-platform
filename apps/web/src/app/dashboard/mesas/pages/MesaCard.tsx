// Componente individual de mesa - Compatible con Sistema Maestro + Diseño Mejorado
import React from 'react';
import { TEXTOS_ESTADO, COLORES_ESTADO } from '@spoon/shared/constants/mesas/mesasConstants';
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';
import { Users, MapPin, AlertCircle, Clock, DollarSign, Sparkles } from 'lucide-react';

// Type casting para componentes de lucide-react
const UsersCast = Users as any;
const MapPinCast = MapPin as any;
const AlertCircleCast = AlertCircle as any;
const ClockCast = Clock as any;
const DollarSignCast = DollarSign as any;
const SparklesCast = Sparkles as any;

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
  const display = getEstadoDisplay({ estado: (estadoMesa ?? (estado === 'ocupada' ? 'ocupada' : 'libre')) as any });
  const estadoVisual = display.estado === 'libre' ? 'vacia' : 'ocupada';
  
  // Determinar si está deshabilitada - SOLO INACTIVAS Y MANTENIMIENTO (administrador puede el resto)
  const isDisabled = estadoMesa === 'inactiva' || estadoMesa === 'mantenimiento';
  const isOcupada = display.estado === 'ocupada';
  
  // Obtener configuración visual mejorada según el estado
  const getEstadoConfig = () => {
    if (estadoMesa === 'reservada') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-warning-50)] via-[color:var(--sp-warning-50)] to-[color:var(--sp-warning-100)]',
  border: 'border-[color:var(--sp-warning-300)] hover:border-[color:var(--sp-warning-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-warning-500)]',
  textColor: 'text-[color:var(--sp-warning-700)]',
  badge: 'bg-[color:var(--sp-warning-500)]',
        statusText: 'Reservada'
      };
    }
    
    if (estadoMesa === 'inactiva') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-neutral-50)] via-[color:var(--sp-neutral-50)] to-[color:var(--sp-neutral-100)]',
  border: 'border-[color:var(--sp-neutral-300)]',
  shadow: '',
  indicator: 'bg-[color:var(--sp-neutral-400)]',
  textColor: 'text-[color:var(--sp-neutral-500)]',
  badge: 'bg-[color:var(--sp-neutral-400)]',
        statusText: 'Inactiva'
      };
    }

    if (estadoMesa === 'mantenimiento') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-warning-50)] via-[color:var(--sp-warning-50)] to-[color:var(--sp-warning-100)]',
  border: 'border-[color:var(--sp-warning-300)]',
  shadow: '',
  indicator: 'bg-[color:var(--sp-warning-500)]',
  textColor: 'text-[color:var(--sp-warning-700)]',
  badge: 'bg-[color:var(--sp-warning-500)]',
        statusText: 'Mantenimiento'
      };
    }
    
    if (estadoMesa === 'en_cocina') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-primary-50)] via-[color:var(--sp-primary-50)] to-[color:var(--sp-primary-100)]',
  border: 'border-[color:var(--sp-primary-300)] hover:border-[color:var(--sp-primary-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-primary-500)]',
  textColor: 'text-[color:var(--sp-primary-700)]',
  badge: 'bg-[color:var(--sp-primary-500)]',
        statusText: 'En Cocina'
      };
    }

    if (estadoMesa === 'servida') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-info-50)] via-[color:var(--sp-info-50)] to-[color:var(--sp-info-100)]',
  border: 'border-[color:var(--sp-info-300)] hover:border-[color:var(--sp-info-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-info-600)]',
  textColor: 'text-[color:var(--sp-info-700)]',
  badge: 'bg-[color:var(--sp-info-600)]',
        statusText: 'Servida'
      };
    }

    if (estadoMesa === 'por_cobrar') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-error-50)] via-[color:var(--sp-error-50)] to-[color:var(--sp-error-100)]',
  border: 'border-[color:var(--sp-error-300)] hover:border-[color:var(--sp-error-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-error-500)]',
  textColor: 'text-[color:var(--sp-error-700)]',
  badge: 'bg-[color:var(--sp-error-500)]',
        statusText: 'Por Cobrar'
      };
    }

    // Estados por defecto con gradientes
    if (estado === 'ocupada') {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-error-50)] via-[color:var(--sp-error-50)] to-[color:var(--sp-error-100)]',
  border: 'border-[color:var(--sp-error-300)] hover:border-[color:var(--sp-error-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-error-500)]',
  textColor: 'text-[color:var(--sp-error-700)]',
  badge: 'bg-[color:var(--sp-error-500)]',
        statusText: 'Ocupada'
      };
    } else {
      return {
  bg: 'bg-gradient-to-br from-[color:var(--sp-success-50)] via-[color:var(--sp-success-50)] to-[color:var(--sp-success-100)]',
  border: 'border-[color:var(--sp-success-300)] hover:border-[color:var(--sp-success-400)]',
  shadow: 'hover:shadow-xl',
  indicator: 'bg-[color:var(--sp-success-500)]',
  textColor: 'text-[color:var(--sp-success-700)]',
  badge: 'bg-[color:var(--sp-success-500)]',
        statusText: 'Libre'
      };
    }
  };

  const config = getEstadoConfig();
  // Color base exacto por estado (usa estadoMesa si existe, de lo contrario mapea 'estado')
  const baseColor = COLORES_ESTADO[display.estado as keyof typeof COLORES_ESTADO];

  // Obtener texto del estado
  const getTextoEstado = () => display.texto || (estado === 'ocupada' ? TEXTOS_ESTADO.ocupada : TEXTOS_ESTADO.libre);

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
  ${seleccionada ? 'ring-2 ring-[color:var(--sp-primary-400)] border-[color:var(--sp-primary-400)] bg-[color:var(--sp-surface-elevated)]/70' : ''}
        ${isDisabled 
          ? 'cursor-not-allowed opacity-75' 
          : 'cursor-pointer hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0'
        }
  focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-primary-400)]
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
  <div className={`absolute -top-2 -right-2 ${config.badge} text-[color:var(--sp-on-surface-inverted)] text-xs px-2 py-1 rounded-full shadow-md`}>
          {estadoMesa === 'reservada' ? 'R' : estadoMesa === 'mantenimiento' ? 'M' : 'X'}
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-[color:var(--sp-neutral-900)] text-sm truncate">
            {nombre || `Mesa ${numero}`}
          </h3>
  {(estadoMesa && estadoMesa !== 'libre') && (elapsedMinutes !== null || tiempoOcupada) && (
            <div className="flex items-center gap-1 text-xs text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-surface-elevated)]/70 px-2 py-0.5 rounded-full border border-[color:var(--sp-border)]/60">
              <ClockCast className="h-3 w-3" />
        {elapsedMinutes !== null ? `${elapsedMinutes} min` : `${tiempoOcupada}m`}
            </div>
          )}
        </div>
        {nombre && (
          <div className="text-xs text-[color:var(--sp-neutral-500)]">#{numero}</div>
        )}
      </div>
      
      {/* Body */}
      <div className="space-y-2 mb-2">
        {/* Zona */}
        {zona && zona !== 'Principal' && (
          <div className="flex items-center justify-center gap-1 text-xs text-[color:var(--sp-neutral-600)]">
            <MapPinCast className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{zona}</span>
          </div>
        )}
        
         {/* Ocupación actual y capacidad */}
         {(typeof comensales === 'number') && (
           <div className="flex items-center justify-center gap-1 text-xs text-[color:var(--sp-neutral-700)]">
             <UsersCast className="h-3 w-3 flex-shrink-0" />
             <span>👥 {comensales} persona{comensales === 1 ? '' : 's'}</span>
           </div>
         )}
         {capacidad && (
           <div className="text-[11px] text-[color:var(--sp-neutral-500)]">
             Capacidad: {capacidad} persona{capacidad === 1 ? '' : 's'}
           </div>
         )}

        {/* Mesero (si está ocupada) */}
        {isOcupada && mesero && (
          <div className="text-xs text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-surface-elevated)]/60 px-2 py-1 rounded">
            👤 {mesero}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2">
        <div className="flex items-center justify-between">
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[color:var(--sp-surface-elevated)]/70`}
      style={{ color: baseColor, border: `1px solid ${baseColor}` }}
          >
            {estadoMesa === 'inactiva' && <AlertCircleCast className="h-3 w-3" />}
            {estadoMesa === 'mantenimiento' && <AlertCircleCast className="h-3 w-3" />}
            {(isOcupada || estadoMesa === 'en_cocina' || estadoMesa === 'servida' || estadoMesa === 'por_cobrar') && <SparklesCast className="h-3 w-3" />}
            <span>{getTextoEstado()}</span>
          </div>

          {isOcupada && total ? (
            <div className="flex items-center gap-1 text-sm font-semibold text-[color:var(--sp-success-700)]">
              <DollarSignCast className="h-4 w-4 text-[color:var(--sp-success-600)]" />
              <span>{formatCurrency(total)}</span>
              {items && <span className="text-xs text-[color:var(--sp-neutral-500)] ml-1">({items})</span>}
            </div>
            ) : estadoMesa === 'en_cocina' ? (
              <div className="text-xs text-[color:var(--sp-primary-700)]">🍽️ {items ?? 0} plato{(items ?? 0) === 1 ? '' : 's'} pendientes</div>
            ) : estadoMesa === 'servida' ? (
              <div className="text-xs text-[color:var(--sp-info-700)]">🍽️ Comida servida</div>
            ) : estadoMesa === 'inactiva' ? (
            <div className="text-xs text-[color:var(--sp-neutral-500)]">Fuera de servicio</div>
          ) : estadoMesa === 'mantenimiento' ? (
            <div className="text-xs text-[color:var(--sp-warning-700)]">En mantenimiento</div>
          ) : (
            <div className="text-xs text-[color:var(--sp-neutral-600)]">Cap. {capacidad ?? '-'} pers.</div>
          )}
        </div>
      </div>
    </button>
  );
};

export default MesaCard;
