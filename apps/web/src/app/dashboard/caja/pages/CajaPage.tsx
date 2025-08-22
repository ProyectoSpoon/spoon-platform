'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';

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
import ModalNuevaVenta from './modals/ModalNuevaVenta';
import GastoWizardSlideOver from './modals/GastoWizardSlideOver';
import ModalAperturaCaja from './modals/ModalAperturaCaja';

// Types
import { OrdenPendiente } from '../types/cajaTypes';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';

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
  refrescar,
  setFechaFiltro,
  periodo,
  setPeriodo,
  fechaFinFiltro,
  setFechaFinFiltro
  } = useCaja();
  const { gastos, crearGasto, loading: loadingGastos } = useGastos();

  // Estado local simplificado
  const [tabActiva, setTabActiva] = useState<TabActiva>('movimientos');
  const [filtros, setFiltros] = useState({
    tiempo: 'hoy',
    fecha: new Date().toISOString().split('T')[0],
  fechaFin: new Date().toISOString().split('T')[0],
  busqueda: ''
  });
  const [modals, setModals] = useState({
    pago: false,
    gasto: false,
  orden: null as OrdenPendiente | null,
  apertura: false,
  nuevaVenta: false
  });

  // Datos combinados y filtrados
  const ordenesPendientes = useMemo(() => {
    const all = [...ordenesMesas, ...ordenesDelivery];
    const term = filtros.busqueda?.trim().toLowerCase();
    if (!term) return all;
    return all.filter(o =>
      (o.identificador?.toLowerCase().includes(term)) ||
      (o.detalles?.toLowerCase().includes(term))
    );
  }, [ordenesMesas, ordenesDelivery, filtros.busqueda]);

  const transaccionesDelDia = useMemo(() => {
    const list = metricas.transaccionesDelDia || [];
    const term = filtros.busqueda?.trim().toLowerCase();
    if (!term) return list;
    return list.filter(t =>
      t.metodo_pago?.toLowerCase().includes(term) ||
      t.tipo_orden?.toLowerCase().includes(term) ||
  ((t.orden_id || '') as string).toLowerCase().includes(term)
    );
  }, [metricas.transaccionesDelDia, filtros.busqueda]);

  const gastosFiltrados = useMemo(() => {
    // Si useCaja ya calculó gastos del periodo seleccionado, usarlos; de lo contrario fallback al hook de gastos (día)
    const list = (metricas as any)?.gastosDelPeriodo?.length ? (metricas as any).gastosDelPeriodo : (gastos || []);
    const term = filtros.busqueda?.trim().toLowerCase();
    if (!term) return list;
    return list.filter((g: any) =>
      g.concepto?.toLowerCase().includes(term) ||
      g.categoria?.toLowerCase().includes(term) ||
      g.notas?.toLowerCase().includes(term)
    );
  }, [metricas, gastos, filtros.busqueda]);

  // Handlers
  const handleAbrirCaja = () => {
    setModals(prev => ({ ...prev, apertura: true }));
  };

  const handleCerrarCaja = async () => {
    // Tu lógica de cerrar caja
    await cerrarCaja('Cierre automático');
  };

  const handleNuevaVenta = async () => {
    // Bloquear si no hay sesión abierta
    if (estadoCaja === 'cerrada' || !sesionActual?.id) {
  setModals(prev => ({ ...prev, apertura: true }));
  return; // el modal de apertura guiará al usuario
    }
    // Verificar rol: solo cajero/admin
    try {
      const profile = await getUserProfile();
      const role = (profile as any)?.role;
  if (role !== 'cajero' && role !== 'admin' && role !== 'restaurant_owner') {
        alert('No tienes permisos para registrar ventas');
        return;
      }
    } catch {
      // Si falla el perfil, por seguridad no permitir
      alert('No se pudo verificar permisos del usuario');
      return;
    }
    setModals(prev => ({ ...prev, nuevaVenta: true }));
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
  <div className="min-h-screen bg-[color:var(--sp-neutral-50)] font-sans">
      {/* Header fijo con estado de sesión */}
  <div className="sticky top-0 z-20 bg-[color:var(--sp-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--sp-surface)]/80 border-b border-[color:var(--sp-border)]">
        <div className="px-5 py-4">
          <CajaHeader
            estadoCaja={estadoCaja}
            ordenesPendientes={ordenesPendientes.length}
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
          {/* Columna principal: acciones + métricas + filtros/panel */}
          <div className="lg:col-span-10 space-y-5">
            <MetricasDashboard metricas={metricas} loading={loading} />
            <MetricasAlert metricas={metricas} />

            <FiltrosToolbar
              tabActiva={tabActiva}
              onTabChange={setTabActiva}
              filtroTiempo={periodo}
              onFiltroTiempoChange={(tiempo) => {
                setFiltros(prev => ({ ...prev, tiempo }));
                setPeriodo(tiempo as any);
                // Refrescar después de que setPeriodo se aplique
                setTimeout(() => refrescar(), 0);
              }}
              filtroFecha={filtros.fecha}
              onFiltroFechaChange={(fecha) => {
                setFiltros(prev => ({ ...prev, fecha }));
                setFechaFiltro(fecha);
                setTimeout(() => refrescar(), 0);
              }}
              filtroFechaFin={filtros.fechaFin}
              onFiltroFechaFinChange={(fecha) => {
                setFiltros(prev => ({ ...prev, fechaFin: fecha }));
                setFechaFinFiltro(fecha);
                setTimeout(() => refrescar(), 0);
              }}
              // soporte opcional de fecha fin para personalizado
              // el componente actual no recibe fechaFin explícita, pero dejamos el estado listo
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
                    gastos={gastosFiltrados}
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
        </div>
      )}
      </div>

      {/* Error global */}
      {error && (
  <div className="px-5 pb-5">
      <Card className="bg-[color:var(--sp-error-50)] border-[color:var(--sp-error-200)] rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
        <span className="text-[color:var(--sp-error-500)]">⚠️</span>
        <span className="text-[color:var(--sp-error-700)] text-sm">{error}</span>
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

      {/* Modal: Nueva Venta directa */}
      <ModalNuevaVenta
        isOpen={modals.nuevaVenta}
        onClose={() => setModals(prev => ({ ...prev, nuevaVenta: false }))}
        loading={loading}
        onConfirmar={async (venta) => {
          try {
            if (!sesionActual?.id) {
              return { success: false, error: 'No hay sesión de caja abierta' };
            }
            const profile = await getUserProfile();
            if (!profile?.id) {
              return { success: false, error: 'Usuario no autenticado' };
            }
            const montoCambio = venta.metodoPago === 'efectivo' && (venta.montoRecibido || 0) > 0
              ? Math.max(0, (venta.montoRecibido as number) - venta.total)
              : 0;

            // Insertar transacción directa
      const { data, error: errIns } = await supabase
              .from('transacciones_caja')
              .insert({
                caja_sesion_id: sesionActual.id,
                orden_id: null,
                tipo_orden: 'directa',
                metodo_pago: venta.metodoPago,
                monto_total: venta.total,
                monto_recibido: venta.metodoPago === 'efectivo' ? (venta.montoRecibido || venta.total) : venta.total,
        monto_cambio: montoCambio,
        cajero_id: (profile as any).id
              })
              .select('id')
              .single();

            if (errIns) {
              return { success: false, error: (errIns as any).message || 'Error registrando la transacción' };
            }

            // Refrescar métricas/listas (aunque hay realtime, forzamos)
            setModals(prev => ({ ...prev, nuevaVenta: false }));
            await refrescar();
            return { success: true, cambio: montoCambio };
          } catch (e: any) {
            return { success: false, error: e?.message || 'Error inesperado' };
          }
        }}
      />

      {/* Modal: Apertura de caja */}
      <ModalAperturaCaja
        isOpen={modals.apertura}
        onClose={() => setModals(prev => ({ ...prev, apertura: false }))}
        onConfirmar={async (monto, notas, cajeroId) => {
          const res = await abrirCaja(monto, notas, cajeroId);
          if (!res.success) {
            return { success: false, error: res.error } as any;
          }
          return { success: true } as any;
        }}
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