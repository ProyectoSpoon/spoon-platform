'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';

// Hooks
import { useCaja } from '../hooks/useCaja';
import { useCajaSesion } from '../hooks/useCajaSesion';
import { useGastos } from '../hooks/useGastos';

// Componentes
import { CajaHeader, CajaStatus } from '../components/CajaHeader';
import { SidebarResumen } from '@spoon/shared';
import { MetricasDashboard, MetricasAlert } from '../components/MetricasDashboard';
import { FiltrosToolbar } from '../components/FiltrosToolbar';
import { MovimientosPanel } from '../components/MovimientosPanel';
import { EmptyStates } from '../components/EmptyState';

// Modals
import { ModalProcesarPago } from './modals/ModalProcesarPago';
import GastoWizardSlideOver from './modals/GastoWizardSlideOver';

// Types
import { OrdenPendiente } from '../types/cajaTypes';

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';

export default function CajaPage() {
  // Hooks centralizados
  const { sesionActual, estadoCaja, abrirCaja, cerrarCaja, requiereSaneamiento, cerrarSesionPrevia } = useCajaSesion();
  const { 
    ordenesMesas,
    ordenesDelivery, 
    metricas, 
    procesarPago, 
    loading,
    error,
    refrescar
  } = useCaja();
  const { gastos, crearGasto, loading: loadingGastos } = useGastos();

  // Estado local simplificado
  const [tabActiva, setTabActiva] = useState<TabActiva>('movimientos');
  const [filtros, setFiltros] = useState({
    tiempo: 'hoy',
    fecha: new Date().toISOString().split('T')[0],
    busqueda: ''
  });
  const [modals, setModals] = useState({
    pago: false,
    gasto: false,
    orden: null as OrdenPendiente | null
  });

  // Datos combinados
  const ordenesPendientes = [...ordenesMesas, ...ordenesDelivery];
  const transaccionesDelDia = metricas.transaccionesDelDia || [];

  // Handlers
  const handleAbrirCaja = async () => {
    // Tu lógica de abrir caja
    await abrirCaja(5000000, 'Apertura automática');
  };

  const handleCerrarCaja = async () => {
    // Tu lógica de cerrar caja
    await cerrarCaja('Cierre automático');
  };

  const handleNuevaVenta = () => {
    // Tu lógica de nueva venta
    console.log('Nueva venta');
  };

  const handleNuevoGasto = () => {
    setModals(prev => ({ ...prev, gasto: true }));
  };

  const handleProcesarPago = (orden: OrdenPendiente) => {
    setModals(prev => ({ 
      ...prev, 
      pago: true, 
      orden 
    }));
  };

  const handleConfirmarPago = async (orden: OrdenPendiente, metodoPago: any, montoRecibido?: number) => {
    const resultado = await procesarPago(orden, metodoPago, montoRecibido);
    if (resultado.success) {
      setModals(prev => ({ ...prev, pago: false, orden: null }));
    }
    return resultado;
  };

  const handleConfirmarGasto = async (gasto: any) => {
    const resultado = await crearGasto(gasto);
    if (resultado.success) {
      setModals(prev => ({ ...prev, gasto: false }));
      refrescar();
    }
    return resultado;
  };

  const handleDescargarReporte = () => {
    // Tu lógica de descarga
    console.log('Descargando reporte...');
  };

  // Renderizado principal
  return (
  <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header fijo con estado de sesión */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100">
        <div className="px-5 py-4">
          <CajaHeader
            estadoCaja={estadoCaja}
            ordensPendientes={ordenesPendientes.length}
            onAbrirCaja={handleAbrirCaja}
            onCerrarCaja={handleCerrarCaja}
            onNuevaVenta={handleNuevaVenta}
            onNuevoGasto={handleNuevoGasto}
            loading={loading}
            requiereSaneamiento={requiereSaneamiento}
            onCerrarSesionPrevia={cerrarSesionPrevia}
          />
          <CajaStatus 
            sesionActual={sesionActual}
            estadoCaja={estadoCaja}
          />
        </div>
      </div>

      {/* Layout principal con sidebar - grid 70/30 */}
  <div className="px-5 py-5">
      {estadoCaja === 'cerrada' ? (
        <Card className="rounded-lg shadow-sm"><CardContent className="p-4">{EmptyStates.cajaAbierta(handleAbrirCaja)}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
          {/* Columna izquierda 70%: acciones + métricas + filtros/panel */}
          <div className="lg:col-span-7 space-y-5">
            <MetricasDashboard metricas={metricas} loading={loading} />
            <MetricasAlert metricas={metricas} />

            <FiltrosToolbar
              tabActiva={tabActiva}
              onTabChange={setTabActiva}
              filtroTiempo={filtros.tiempo}
              onFiltroTiempoChange={(tiempo) => setFiltros(prev => ({ ...prev, tiempo }))}
              filtroFecha={filtros.fecha}
              onFiltroFechaChange={(fecha) => setFiltros(prev => ({ ...prev, fecha }))}
              busqueda={filtros.busqueda}
              onBusquedaChange={(busqueda) => setFiltros(prev => ({ ...prev, busqueda }))}
              onDescargar={handleDescargarReporte}
              onRefresh={refrescar}
              loading={loading}
            />

            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-4">
                {tabActiva === 'movimientos' ? (
                  <MovimientosPanel
                    ordenesPendientes={ordenesPendientes}
                    transacciones={transaccionesDelDia}
                    gastos={gastos}
                    onProcesarPago={handleProcesarPago}
                    loading={loading}
                  />
                ) : tabActiva === 'arqueo' ? (
                  EmptyStates.proximamente()
                ) : (
                  EmptyStates.proximamente()
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar derecha 30% */}
          <div className="lg:col-span-3 space-y-5">
            <SidebarResumen
              variant="caja"
              balance={metricas.balance}
              ordenes={metricas.transaccionesDelDia?.length || 0}
              metaDelDia={'47%'}
              variacionVsAyer={'+12%'}
              estadisticas={[
                { label: 'Ticket Promedio', value: '$7.833' },
                { label: 'Hora Pico', value: '12:00-2:00' },
                { label: 'Productos Vendidos', value: '0' },
                { label: 'Tiempo Activo', value: '4h 30m' },
              ]}
              alertas={[
                { label: 'Caja abierta hace 4h 30m', tipo: 'info' },
                { label: 'Backup automático realizado', tipo: 'success' },
                { label: 'Cierre de caja recomendado', tipo: 'warning' },
              ]}
              actividad={[
                { label: 'Producto A x2', value: '$36.000' },
                { label: 'Producto B', value: '$10.500' },
                { label: 'Producto C', value: '$5.000' },
              ]}
            />
          </div>
        </div>
      )}
      </div>

      {/* Error global */}
      {error && (
  <div className="px-5 pb-5">
          <Card className="bg-red-50 border-red-200 rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <ModalProcesarPago
        orden={modals.orden}
        isOpen={modals.pago}
        onClose={() => setModals(prev => ({ ...prev, pago: false, orden: null }))}
        onConfirmar={handleConfirmarPago}
        loading={loading}
      />

      {/* Nuevo wizard de Gasto como slide-over desde la derecha */}
      <GastoWizardSlideOver
        isOpen={modals.gasto}
        onClose={() => setModals(prev => ({ ...prev, gasto: false }))}
        onConfirmar={handleConfirmarGasto}
        loading={loadingGastos}
      />
    </div>
  );
};