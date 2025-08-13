'use client';

import React, { useState } from 'react';
import { Clock, Phone, MapPin, User, Eye, EyeOff, DollarSign } from 'lucide-react';
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
}

export default function PedidosTable({ 
  pedidos, 
  domiciliarios, 
  onUpdateEstado, 
  onRegistrarPago, 
  loading 
}: PedidosTableProps) {
  
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);
  const [pedidoParaPago, setPedidoParaPago] = useState<string | null>(null);

  const domiciliariosDisponibles = domiciliarios.filter(d => d.status === 'available');

  const handleCambiarEstado = (pedidoId: string, nuevoEstado: string, domiciliarioId?: string) => {
    onUpdateEstado({
      pedido_id: pedidoId,
      nuevo_estado: nuevoEstado as EstadoPedido,
      domiciliario_id: domiciliarioId
    });
  };

  const getSiguientesEstados = (estadoActual: string) => {
    switch (estadoActual) {
      case ESTADOS_PEDIDO.RECIBIDO:
        return [ESTADOS_PEDIDO.COCINANDO];
      case ESTADOS_PEDIDO.COCINANDO:
        return [ESTADOS_PEDIDO.LISTO];
      case ESTADOS_PEDIDO.LISTO:
        return [ESTADOS_PEDIDO.ENVIADO];
      case ESTADOS_PEDIDO.ENVIADO:
        return [ESTADOS_PEDIDO.ENTREGADO];
      case ESTADOS_PEDIDO.ENTREGADO:
        return [ESTADOS_PEDIDO.PAGADO];
      default:
        return [];
    }
  };

  const formatearTiempo = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calcularTiempoTranscurrido = (fechaCreacion: string) => {
    const ahora = new Date();
    const creado = new Date(fechaCreacion);
    const diferencia = Math.floor((ahora.getTime() - creado.getTime()) / (1000 * 60));
    
    if (diferencia < 60) {
      return diferencia + 'm';
    } else {
      const horas = Math.floor(diferencia / 60);
      const minutos = diferencia % 60;
      return horas + 'h ' + minutos + 'm';
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <h3 className="heading-section text-gray-900 mb-2">
          No hay pedidos hoy
        </h3>
        <p className="text-gray-600">
          Los pedidos apareceran aqui cuando los clientes realicen ordenes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="heading-section text-gray-900">
          Pedidos de Hoy ({pedidos.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {pedidos.map((pedido) => {
          const isExpanded = pedidoExpandido === pedido.id;
          const siguientesEstados = getSiguientesEstados(pedido.status);
          const tiempoTranscurrido = calcularTiempoTranscurrido(pedido.created_at);
          
          return (
            <div key={pedido.id} className="p-6">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  
                  <button
                    onClick={() => setPedidoExpandido(isExpanded ? null : pedido.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>

                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        {pedido.customer_name}
                      </h4>
                      <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + ESTADOS_COLORS[pedido.status]}>
                        {ESTADO_ICONS[pedido.status]} {ESTADOS_LABELS[pedido.status]}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatearTiempo(pedido.created_at)} • Hace {tiempoTranscurrido}</span>
                      
                      <Phone className="w-4 h-4 ml-4 mr-1" />
                      <span>{pedido.customer_phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="value-number text-gray-900">
                      ${Math.round((pedido.total_amount + pedido.delivery_fee) / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pedido.order_items.length} items
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {siguientesEstados.map((estado) => (
                      <div key={estado}>
                        {estado === ESTADOS_PEDIDO.ENVIADO ? (
                          <select
                            onChange={(e) => handleCambiarEstado(pedido.id, estado, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                            disabled={loading.actualizando_estado}
                          >
                            <option value="">Asignar domiciliario</option>
                            {domiciliariosDisponibles.map((dom) => (
                              <option key={dom.id} value={dom.id}>
                                {dom.name}
                              </option>
                            ))}
                          </select>
                        ) : estado === ESTADOS_PEDIDO.PAGADO ? (
                          <button
                            onClick={() => setPedidoParaPago(pedido.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading.registrando_pago || !pedido.assigned_delivery_person_id}
                          >
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Pagado
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstado(pedido.id, estado)}
                            className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
                            disabled={loading.actualizando_estado}
                          >
                            {ESTADOS_LABELS[estado]}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Direccion:</p>
                      <p className="text-sm text-gray-600">{pedido.delivery_address}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Items del pedido:</p>
                    <div className="space-y-2">
                      {pedido.order_items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.quantity}x {item.combination_name}
                              </p>
                              {item.extras && item.extras.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-600">Extras:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.extras.map((extra, i) => (
                                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                                        {extra.nombre}
                                        {extra.precio > 0 && ' (+$' + extra.precio.toLocaleString() + ')'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              ${item.subtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {pedido.assigned_delivery_person && (
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Domiciliario:</p>
                        <span className="text-sm text-gray-600">
                          {pedido.assigned_delivery_person.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {pedido.special_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notas especiales:</p>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded-md mt-1">
                        {pedido.special_notes}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Timeline:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Recibido:</span>
                        <span>{formatearTiempo(pedido.created_at)}</span>
                      </div>
                      {pedido.sent_at && (
                        <div className="flex justify-between">
                          <span>Enviado:</span>
                          <span>{formatearTiempo(pedido.sent_at)}</span>
                        </div>
                      )}
                      {pedido.delivered_at && (
                        <div className="flex justify-between">
                          <span>Entregado:</span>
                          <span>{formatearTiempo(pedido.delivered_at)}</span>
                        </div>
                      )}
                      {pedido.paid_at && (
                        <div className="flex justify-between">
                          <span>Pagado:</span>
                          <span>{formatearTiempo(pedido.paid_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {pedidoParaPago === pedido.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="heading-section text-gray-900 mb-4">
                      Registrar Pago
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Cliente: {pedido.customer_name}</p>
                        <p className="text-sm text-gray-600">
                          Total: ${Math.round((pedido.total_amount + pedido.delivery_fee) / 100).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            onRegistrarPago({
                              pedido_id: pedido.id,
                              monto_recibido: pedido.total_amount + pedido.delivery_fee,
                              tipo_pago: 'efectivo',
                              domiciliario_id: pedido.assigned_delivery_person_id || ''
                            });
                            setPedidoParaPago(null);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Efectivo
                        </button>
                        
                        <button
                          onClick={() => {
                            onRegistrarPago({
                              pedido_id: pedido.id,
                              monto_recibido: pedido.total_amount + pedido.delivery_fee,
                              tipo_pago: 'digital',
                              domiciliario_id: pedido.assigned_delivery_person_id || ''
                            });
                            setPedidoParaPago(null);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Digital
                        </button>
                      </div>

                      <button
                        onClick={() => setPedidoParaPago(null)}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
