'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/card';

// Hooks
import { useCaja } from '../hooks/useCaja';
import { useCajaSesion } from '../hooks/useCajaSesion';
import { useGastos } from '../hooks/useGastos';

// Componentes
import { CajaHeader, CajaStatus } from '../components/CajaHeader';
import { MetricasDashboard, MetricasAlert } from '../components/MetricasDashboard';
import { FiltrosToolbar } from '../components/FiltrosToolbar';
import { MovimientosPanel } from '../components/MovimientosPanel';
import { EmptyStates } from '../components/EmptyState';

// Modals
import { ModalProcesarPago } from './modals/ModalProcesarPago';
import { ModalNuevoGasto } from './modals/ModalNuevoGasto';

// Types
import { OrdenPendiente } from '../types/cajaTypes';

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';

export default function CajaPage() {
  // Hooks centralizados
  const { sesionActual, estadoCaja, abrirCaja, cerrarCaja } = useCajaSesion();
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
    <div className="space-y-6">
      {/* Header principal */}
      <CajaHeader
        estadoCaja={estadoCaja}
        ordensPendientes={ordenesPendientes.length}
        onAbrirCaja={handleAbrirCaja}
        onCerrarCaja={handleCerrarCaja}
        onNuevaVenta={handleNuevaVenta}
        onNuevoGasto={handleNuevoGasto}
        loading={loading}
      />

      {/* Información de sesión activa */}
      <CajaStatus 
        sesionActual={sesionActual}
        estadoCaja={estadoCaja}
      />

      {/* Contenido principal */}
      {estadoCaja === 'cerrada' ? (
        // Estado caja cerrada
        <Card>
          <CardContent>
            {EmptyStates.cajaAbierta(handleAbrirCaja)}
          </CardContent>
        </Card>
      ) : (
        // Estado caja abierta
        <>
          {/* Métricas principales */}
          <MetricasDashboard 
            metricas={metricas} 
            loading={loading} 
          />
          
          {/* Alertas contextuales */}
          <MetricasAlert metricas={metricas} />

          {/* Filtros y navegación */}
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

          {/* Panel principal */}
          <Card>
            <CardContent className="p-6">
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
        </>
      )}

      {/* Error global */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ModalProcesarPago
        orden={modals.orden}
        isOpen={modals.pago}
        onClose={() => setModals(prev => ({ ...prev, pago: false, orden: null }))}
        onConfirmar={handleConfirmarPago}
        loading={loading}
      />

      <ModalNuevoGasto
        isOpen={modals.gasto}
        onClose={() => setModals(prev => ({ ...prev, gasto: false }))}
        onConfirmar={handleConfirmarGasto}
        loading={loadingGastos}
      />
    </div>
  );
};