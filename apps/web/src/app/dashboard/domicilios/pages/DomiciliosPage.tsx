'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Truck, Clock, CheckCircle, DollarSign, Users, RefreshCw } from 'lucide-react';
import { usePedidos } from '../hooks/usePedidos';
import { useDomiciliarios } from '../hooks/useDomiciliarios';
import { useMenuDelDia } from '../hooks/useMenuDelDia';
import { ESTADOS_PEDIDO } from '../constants/domiciliosConstants';
import PedidoForm from './PedidoForm';
import PedidosTable from './PedidosTable';
import DomiciliariosPanel from './DomiciliariosPanel';
import PagoModal from './PagoModal';

export default function DomiciliosPage() {
  const { 
    pedidos, 
    loading: loadingPedidos, 
    loadingStates, 
    crearPedido, 
    actualizarEstado, 
    registrarPago,
    cargarPedidos 
  } = usePedidos();

  const { 
    domiciliarios, 
    domiciliariosDisponibles, 
    loading: loadingDomiciliarios, 
    agregarDomiciliario, 
    actualizarEstado: actualizarEstadoDomiciliario 
  } = useDomiciliarios();

  const { 
    menu, 
    loading: loadingMenu, 
    hayMenuHoy 
  } = useMenuDelDia();

  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [pedidoParaPago, setPedidoParaPago] = useState<string | null>(null);

  // Calcular estadisticas localmente
  const pendientes = pedidos.filter(p => p.status === ESTADOS_PEDIDO.RECIBIDO || p.status === ESTADOS_PEDIDO.COCINANDO).length;
  const enRuta = pedidos.filter(p => p.status === ESTADOS_PEDIDO.ENVIADO).length;
  const entregados = pedidos.filter(p => p.status === ESTADOS_PEDIDO.ENTREGADO || p.status === ESTADOS_PEDIDO.PAGADO).length;
  const totalDia = pedidos.reduce((sum, p) => sum + p.total_amount + p.delivery_fee, 0);
  const disponibles = domiciliariosDisponibles.length;

  if (loadingPedidos || loadingDomiciliarios || loadingMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="heading-section text-gray-900 mb-2">
            Cargando sistema de domicilios...
          </h3>
          <p className="text-gray-600 text-sm">
            Preparando toda la informacion.
          </p>
        </div>
      </div>
    );
  }

  if (!hayMenuHoy) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-page mb-6">Domicilios</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="heading-section mb-4">
              No hay menu configurado para hoy
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Necesitas configurar el menu del dia antes de recibir pedidos de domicilio.
            </p>
            
            <Link
              href="/dashboard/carta/menu-dia"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Configurar Menu del Dia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="heading-page">Domicilios</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los pedidos y domiciliarios de hoy
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cargarPedidos}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              
              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Pedido
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="value-number text-gray-900">{pendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Ruta</p>
                <p className="value-number text-gray-900">{enRuta}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="value-number text-gray-900">{entregados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dia</p>
                <p className="value-number text-gray-900">${Math.round(totalDia / 100).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="value-number text-gray-900">{disponibles}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <PedidosTable 
              pedidos={pedidos}
              domiciliarios={domiciliarios}
              onUpdateEstado={actualizarEstado}
              onRegistrarPago={(data) => {
                registrarPago(data);
                setPedidoParaPago(null);
              }}
              loading={loadingStates}
            />
          </div>

          <div className="lg:col-span-1">
            <DomiciliariosPanel 
              domiciliarios={domiciliarios}
              onUpdateStatus={actualizarEstadoDomiciliario}
              onAddDomiciliario={agregarDomiciliario}
              loading={loadingDomiciliarios}
            />
          </div>
        </div>

        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMostrarFormulario(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
              <PedidoForm 
                menu={menu}
                onSubmit={async (nuevoPedido) => {
                  await crearPedido(nuevoPedido);
                  setMostrarFormulario(false);
                }}
                loading={loadingStates.creando_pedido}
                onClose={() => setMostrarFormulario(false)}
              />
            </div>
          </div>
        )}

        {pedidoParaPago && (
          <PagoModal 
            pedidoId={pedidoParaPago}
            onSubmit={(data) => {
              registrarPago(data);
              setPedidoParaPago(null);
            }}
            onClose={() => setPedidoParaPago(null)}
            loading={loadingStates.registrando_pago}
          />
        )}
      </div>
    </div>
  );
}