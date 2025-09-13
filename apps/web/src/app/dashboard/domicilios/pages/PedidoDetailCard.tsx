'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Clock as ClockRaw, Phone as PhoneRaw, MapPin as MapPinRaw, User as UserRaw, Eye as EyeRaw, EyeOff as EyeOffRaw, DollarSign as DollarSignRaw } from 'lucide-react';
const Clock: any = ClockRaw; // Cast temporal
const Phone: any = PhoneRaw;
const MapPin: any = MapPinRaw;
const User: any = UserRaw;
const Eye: any = EyeRaw;
const EyeOff: any = EyeOffRaw;
const DollarSign: any = DollarSignRaw;
import { 
  PedidoDomicilio, 
  Domiciliario, 
  ActualizarEstadoPedido, 
  RegistrarPago, 
  LoadingStates,
  EstadoPedido 
} from '../types/domiciliosTypes';
import { 
  ESTADOS_PEDIDO, 
  ESTADOS_LABELS, 
  ESTADOS_COLORS, 
  ESTADO_ICONS 
} from '../constants/domiciliosConstants';

interface PedidosTableProps {
  pedidos: PedidoDomicilio[];
  domiciliarios: Domiciliario[];
  onUpdateEstado: (data: ActualizarEstadoPedido) => void;
  onRegistrarPago: (data: RegistrarPago) => void;
  loading: LoadingStates;
  hasOpenCajaSession?: boolean;
}

// Hook: ticker cada minuto para actualizar tiempos relativos sin forzar renders constantes
function useMinuteTicker() {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60_000); // cada minuto
    return () => clearInterval(id);
  }, []);
  return tick; // se ignora el valor, solo causa re-render
}

// Funciones puras reutilizables
const formatearTiempo = (fecha: string) => new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
const calcularTiempoTranscurrido = (fechaCreacion: string) => {
  const ahora = Date.now();
  const creado = new Date(fechaCreacion).getTime();
  const diferencia = Math.floor((ahora - creado) / 60000);
  if (diferencia < 60) return diferencia + 'm';
  const horas = Math.floor(diferencia / 60);
  const minutos = diferencia % 60;
  return horas + 'h ' + minutos + 'm';
};

interface OrderRowProps {
  pedido: PedidoDomicilio;
  isExpanded: boolean;
  onToggle: () => void;
  siguientesEstados: EstadoPedido[];
  domiciliariosDisponibles: Domiciliario[];
  onChangeEstado: (estado: EstadoPedido, domiciliarioId?: string) => void;
  onRegistrarPago: (data: RegistrarPago) => void;
  loading: LoadingStates;
}

// eslint-disable-next-line react/display-name
const pasosFlujo: EstadoPedido[] = [
  ESTADOS_PEDIDO.RECIBIDO,
  ESTADOS_PEDIDO.COCINANDO,
  ESTADOS_PEDIDO.LISTO,
  ESTADOS_PEDIDO.ENVIADO,
  ESTADOS_PEDIDO.ENTREGADO,
  ESTADOS_PEDIDO.PAGADO
];

interface NextAction {
  label: string;
  descripcion: string;
  nextEstado?: EstadoPedido; // si no hay, se maneja logic especial (pago)
  requiereDomiciliario?: boolean;
  esPago?: boolean;
}

const getNextAction = (pedido: PedidoDomicilio): NextAction | null => {
  switch (pedido.status) {
    case ESTADOS_PEDIDO.RECIBIDO:
      return { label: 'Iniciar Cocina', descripcion: 'Marca el pedido como en preparación', nextEstado: ESTADOS_PEDIDO.COCINANDO };
    case ESTADOS_PEDIDO.COCINANDO:
      return { label: 'Marcar Listo', descripcion: 'Listo para empaquetar y asignar domiciliario', nextEstado: ESTADOS_PEDIDO.LISTO };
    case ESTADOS_PEDIDO.LISTO:
      return { label: 'Enviar Pedido', descripcion: 'Asigna un domiciliario y mándalo al cliente', nextEstado: ESTADOS_PEDIDO.ENVIADO, requiereDomiciliario: true };
    case ESTADOS_PEDIDO.ENVIADO:
      return { label: 'Confirmar Entrega', descripcion: 'Confirma que el cliente recibió el pedido', nextEstado: ESTADOS_PEDIDO.ENTREGADO };
    case ESTADOS_PEDIDO.ENTREGADO:
      return { label: 'Registrar Pago', descripcion: 'Registra el pago y completa el flujo', esPago: true };
    default:
      return null; // PAGADO u otro
  }
};

const OrderRow = React.memo<OrderRowProps & { hasOpenCajaSession?: boolean }>(({ pedido, isExpanded, onToggle, siguientesEstados, domiciliariosDisponibles, onChangeEstado, onRegistrarPago, loading, hasOpenCajaSession }) => {
  const tiempoTranscurrido = calcularTiempoTranscurrido(pedido.created_at);
  const nextAction = getNextAction(pedido);
  const cookingStart = pedido.cooking_started_at || pedido.created_at;
  const cookingElapsed = pedido.status === ESTADOS_PEDIDO.COCINANDO ? calcularTiempoTranscurrido(cookingStart) : null;
  // Tiered SLA (usamos 15 min de referencia hasta prop drilling futuro)
  const SLA_MIN = 15;
  const diffCookingMin = pedido.status === ESTADOS_PEDIDO.COCINANDO ? Math.floor((Date.now() - new Date(cookingStart).getTime()) / 60000) : 0;
  const ratio = diffCookingMin / SLA_MIN;
  const cookingClass = ratio < 0.7
    ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-700)]'
    : ratio < 1
      ? 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]'
      : 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-700)]';
  const [domSeleccionado, setDomSeleccionado] = React.useState<string>('');
  return (
    <div className="p-4 sm:p-6" data-pedido-id={pedido.id}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex items-start space-x-4">
          <button
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Contraer pedido' : 'Expandir pedido'}
            onClick={onToggle}
            className="text-[color:var(--sp-neutral-400)] hover:text-[color:var(--sp-neutral-600)] mt-1"
          >
            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold text-[color:var(--sp-neutral-900)]">{pedido.customer_name}</h4>
              <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + ESTADOS_COLORS[pedido.status]}>
                {ESTADO_ICONS[pedido.status]} {ESTADOS_LABELS[pedido.status]}
              </span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-[color:var(--sp-neutral-600)] mt-1 flex-wrap gap-x-4 gap-y-1">
              <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" />{formatearTiempo(pedido.created_at)} • {tiempoTranscurrido}</span>
              <span className="inline-flex items-center"><Phone className="w-4 h-4 mr-1" />{pedido.customer_phone}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* Stepper */}
          <div className="flex items-center flex-wrap gap-2 md:justify-end">
            {pasosFlujo.map((p, idx) => {
              const estadoIndex = pasosFlujo.indexOf(pedido.status);
              const completado = idx < estadoIndex;
              const actual = p === pedido.status;
              return (
                <div key={p} className="flex items-center">
                  <div className={
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ' +
                    (actual ? 'bg-[color:var(--sp-primary-600)] text-[--sp-on-primary]' : completado ? 'bg-[color:var(--sp-success-500)] text-[--sp-on-success]' : 'bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-600)]')
                  } title={ESTADOS_LABELS[p]}> {idx+1} </div>
                  {idx < pasosFlujo.length -1 && <div className={'w-8 h-px mx-1 ' + (completado ? 'bg-[color:var(--sp-success-500)]' : 'bg-[color:var(--sp-neutral-300)]')} />}
                </div>
              );
            })}
          </div>
          {/* Info y acción */}
          <div className="flex flex-col md:items-end gap-2">
            <div className="text-right">
              <p className="value-number text-[color:var(--sp-neutral-900)]">
                ${(pedido.total_amount + pedido.delivery_fee).toLocaleString()}
              </p>
              <p className="text-xs text-[color:var(--sp-neutral-500)]">{pedido.order_items.length} items</p>
              {pedido.status === ESTADOS_PEDIDO.COCINANDO && (
                <p className={'mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded ' + cookingClass}>
                  <Clock className="w-3 h-3 mr-1" /> En cocina: {cookingElapsed}
                </p>
              )}
            </div>
            {nextAction && (
              <div className="flex flex-col gap-2 w-full md:w-56">
                {nextAction.requiereDomiciliario && (
                  <select
                    value={domSeleccionado}
                    onChange={(e)=> setDomSeleccionado(e.target.value)}
                    className="px-2 py-2 text-sm border border-[color:var(--sp-neutral-300)] rounded-md focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                    aria-label="Seleccionar domiciliario"
                  >
                    <option value="">Asignar domiciliario...</option>
                    {domiciliariosDisponibles.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
                <button
                  disabled={loading.actualizando_estado || loading.registrando_pago || (nextAction.requiereDomiciliario && !domSeleccionado) || (nextAction.esPago && !hasOpenCajaSession)}
                  onClick={() => {
                    if (nextAction.esPago) {
                      onRegistrarPago({
                        pedido_id: pedido.id,
                        monto_recibido: pedido.total_amount + pedido.delivery_fee,
                        tipo_pago: 'efectivo',
                        domiciliario_id: pedido.assigned_delivery_person_id || domSeleccionado || ''
                      });
                      return;
                    }
                    if (nextAction.nextEstado) {
                      onChangeEstado(nextAction.nextEstado, nextAction.requiereDomiciliario ? domSeleccionado : undefined);
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-md font-medium bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={nextAction.label}
                >
                  {nextAction.label}
                </button>
                <p className="text-[10px] leading-snug text-[color:var(--sp-neutral-500)]">
                  {nextAction.descripcion}
                  {nextAction.requiereDomiciliario && ' (selecciona un domiciliario primero)'}
                  {nextAction.esPago && (hasOpenCajaSession ? ' (requiere caja abierta)' : ' (abre caja para habilitar pago)')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[color:var(--sp-neutral-100)] space-y-4 relative">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-[color:var(--sp-neutral-400)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Direccion:</p>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">{pedido.delivery_address}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-2">Items del pedido:</p>
            <div className="space-y-2">
              {pedido.order_items.map((item, i) => (
                <div key={i} className="bg-[color:var(--sp-neutral-50)] rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-[color:var(--sp-neutral-900)]">{item.quantity}x {item.combination_name}</p>
                      {item.extras?.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-[color:var(--sp-neutral-600)]">Extras:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.extras.map((extra, j) => (
                              <span key={j} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]">
                                {extra.nombre}{extra.precio > 0 && ' (+$' + extra.precio.toLocaleString() + ')'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[color:var(--sp-neutral-900)]">${item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {pedido.assigned_delivery_person && (
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-[color:var(--sp-neutral-400)]" />
              <div>
                <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Domiciliario:</p>
                <span className="text-sm text-[color:var(--sp-neutral-600)]">{pedido.assigned_delivery_person.name}</span>
              </div>
            </div>
          )}
          {pedido.special_notes && (
            <div>
              <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Notas especiales:</p>
              <p className="text-sm text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-warning-50)] p-2 rounded-md mt-1">{pedido.special_notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-2">Timeline:</p>
            <div className="space-y-1 text-xs sm:text-sm text-[color:var(--sp-neutral-600)]">
              <div className="flex justify-between"><span>Recibido:</span><span>{formatearTiempo(pedido.created_at)}</span></div>
              {pedido.sent_at && <div className="flex justify-between"><span>Enviado:</span><span>{formatearTiempo(pedido.sent_at)}</span></div>}
              {pedido.delivered_at && <div className="flex justify-between"><span>Entregado:</span><span>{formatearTiempo(pedido.delivered_at)}</span></div>}
              {pedido.paid_at && <div className="flex justify-between"><span>Pagado:</span><span>{formatearTiempo(pedido.paid_at)}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrderRow.displayName = 'OrderRow';

const PedidoDetailCard = function PedidoDetailCard({ 
  pedidos, 
  domiciliarios, 
  onUpdateEstado, 
  onRegistrarPago, 
  loading,
  hasOpenCajaSession
}: PedidosTableProps) {
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);
  // Fuerza re-render cada minuto para refrescar tiempos relativos
  useMinuteTicker();

  // Memo domiciliarios disponibles
  const domiciliariosDisponibles = useMemo(() => domiciliarios.filter(d => d.status === 'available'), [domiciliarios]);

  const getSiguientesEstados = useCallback((estadoActual: string): EstadoPedido[] => {
    switch (estadoActual) {
      case ESTADOS_PEDIDO.RECIBIDO: return [ESTADOS_PEDIDO.COCINANDO];
      case ESTADOS_PEDIDO.COCINANDO: return [ESTADOS_PEDIDO.LISTO];
      case ESTADOS_PEDIDO.LISTO: return [ESTADOS_PEDIDO.ENVIADO];
      case ESTADOS_PEDIDO.ENVIADO: return [ESTADOS_PEDIDO.ENTREGADO];
      case ESTADOS_PEDIDO.ENTREGADO: return [ESTADOS_PEDIDO.PAGADO];
      default: return [];
    }
  }, []);

  const handleCambiarEstado = useCallback((pedidoId: string, nuevoEstado: EstadoPedido, domiciliarioId?: string) => {
    onUpdateEstado({ pedido_id: pedidoId, nuevo_estado: nuevoEstado, domiciliario_id: domiciliarioId });
  }, [onUpdateEstado]);

  const handleRegistrarPago = useCallback((data: RegistrarPago) => {
    onRegistrarPago(data);
  }, [onRegistrarPago]);

  if (pedidos.length === 0) {
    return (
      <div className="bg-[--sp-surface-elevated] rounded-lg shadow-sm p-12 text-center">
        <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">No hay pedidos hoy</h3>
        <p className="text-[color:var(--sp-neutral-600)]">Los pedidos apareceran aqui cuando los clientes realicen ordenes.</p>
      </div>
    );
  }

  return (
    <div className="bg-[--sp-surface-elevated] rounded-lg shadow-sm">
      <div className="divide-y divide-[color:var(--sp-neutral-200)]">
        {pedidos.map(pedido => (
          <OrderRow
            key={pedido.id}
            pedido={pedido}
            isExpanded={pedidoExpandido === pedido.id}
            onToggle={() => setPedidoExpandido(prev => prev === pedido.id ? null : pedido.id)}
            siguientesEstados={getSiguientesEstados(pedido.status)}
            domiciliariosDisponibles={domiciliariosDisponibles}
            onChangeEstado={(estado, domId) => handleCambiarEstado(pedido.id, estado, domId)}
            onRegistrarPago={handleRegistrarPago}
            loading={loading}
            hasOpenCajaSession={hasOpenCajaSession}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(PedidoDetailCard);
