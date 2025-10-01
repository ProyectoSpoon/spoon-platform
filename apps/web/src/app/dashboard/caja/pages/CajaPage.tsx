'use client';

import React, { useMemo, useState } from 'react';
import { Card as CardRaw, CardContent as CardContentRaw } from '@spoon/shared/components/ui/Card';
const Card = CardRaw as any; // Cast temporal para conflictos de tipos React duplicados
const CardContent = CardContentRaw as any;

// Hooks
import { useCaja, useCajaSesion, useGastos } from '@spoon/shared/caja';
import { useSaldoCalculado } from '../hooks/useSaldoCalculado';

// Componentes
import { CajaHeader, CajaStatus } from '../components/CajaHeader';
import { MetricasDashboard, MetricasAlert } from '../components/MetricasDashboard';
import { FiltrosToolbar } from '../components/FiltrosToolbar';
import { MovimientosPanel } from '../components/MovimientosPanel';
import { EmptyStates } from '../components/EmptyState';
import { CierresList, CierreCajaItem } from '../components/cierres/CierresList';
import CierreDetalle from '../components/cierres/CierreDetalle';
import { SecurityPanel } from '../components/SecurityPanel';
import { ReportesCaja } from '@spoon/shared/caja/components/ReportesCaja';

// Modals
import { ModalProcesarPago } from './modals/ModalProcesarPago';
import ModalNuevaVenta from './modals/ModalNuevaVenta';
import GastoWizardSlideOver from './modals/GastoWizardSlideOver';
import ModalAperturaCaja from './modals/ModalAperturaCaja';
import { ModalCierreCaja } from '../components/ModalCierreCaja';

// Types
import { OrdenPendiente } from '../types/cajaTypes';
import { getCierresCajaRecientes } from '@spoon/shared/lib/supabase';
import { toast } from '@spoon/shared/components/ui/Toast';

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';

export default function CajaPage() {
  // Hooks centralizados
  const { sesionActual, estadoCaja, abrirCaja, cerrarCaja, requiereSaneamiento, cerrarSesionPrevia, rpcValidacionHabilitada } = useCajaSesion();
  // Saldo calculado dinámico (evita depender de campo inexistente saldo_final_calculado)
  const { saldoCalculado: saldoCalculadoDin, loading: loadingSaldoCalc } = useSaldoCalculado(
    sesionActual?.id || null,
    sesionActual?.monto_inicial || 0
  );
  const { 
    ordenesMesas,
    ordenesDelivery, 
    metricas, 
    procesarPago, 
    loading,
    error,
  refrescar,
  fechaFiltro,
  setFechaFiltro,
  periodo,
  setPeriodo,
  fechaFinFiltro,
  setFechaFinFiltro,
  registrarVentaDirecta
  } = useCaja();
  const { gastos, crearGasto, loading: loadingGastos } = useGastos();
  // Feature flag (panel de seguridad opcional)
  const [showSecurityPanel, setShowSecurityPanel] = React.useState<boolean>(() => {
    // Prioridad: variable de entorno pública NEXT_PUBLIC_SHOW_SECURITY_PANEL
    const envFlag = (process as any)?.env?.NEXT_PUBLIC_SHOW_SECURITY_PANEL;
    if (typeof envFlag === 'string') {
      return envFlag === 'true' || envFlag === '1';
    }
    // Fallback: localStorage key
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('showSecurityPanel');
      if (stored != null) return stored === 'true';
    }
    return true; // default ON
  });

  // Estado local simplificado
  const [tabActiva, setTabActiva] = useState<TabActiva>('movimientos');
  // Usar día local de Bogotá en lugar de toISOString (UTC) para evitar desfasar al día siguiente
  const hoyBogota = React.useMemo(() => {
    const now = new Date();
    const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    return bogota.toISOString().split('T')[0];
  }, []);
  const [filtros, setFiltros] = useState({
    tiempo: 'hoy',
    fecha: hoyBogota,
    fechaFin: hoyBogota,
    busqueda: ''
  });
  const [modals, setModals] = useState({
    pago: false,
    gasto: false,
    orden: null as OrdenPendiente | null,
    apertura: false,
    nuevaVenta: false,
    cierre: false
  });
  const [mensajeErrorCierre, setMensajeErrorCierre] = useState<string | null>(null);
  const mostrarAvisoValidacion = sesionActual && estadoCaja === 'abierta' && rpcValidacionHabilitada === false;
  // Estado para cierres (scaffolding inicial)
  const [cierres, setCierres] = useState<CierreCajaItem[]>([]);
  const [loadingCierres, setLoadingCierres] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState<string | null>(null);

  // Mantener sincronizado el filtro visual con los filtros del hook (fechaFiltro/fechaFinFiltro)
  React.useEffect(() => {
    setFiltros(prev => ({
      ...prev,
      fecha: fechaFiltro || prev.fecha,
      fechaFin: fechaFinFiltro || prev.fechaFin || fechaFiltro || prev.fecha
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaFiltro, fechaFinFiltro]);

  // Cargar cierres reales cuando se activa tab 'arqueo'
  React.useEffect(() => {
    if (tabActiva !== 'arqueo') return;
    let cancel = false;
    const load = async () => {
      setLoadingCierres(true);
      try {
        if (!sesionActual?.restaurant_id) {
          if (!cancel) setCierres([]);
        } else {
          const data = await getCierresCajaRecientes(sesionActual.restaurant_id, 30);
          const mapped: CierreCajaItem[] = data.map(d => ({
            id: d.id,
            abierta_at: d.abierta_at,
            cerrada_at: d.cerrada_at,
            cajero_apertura: d.cajero_id,
            cajero_cierre: d.cajero_id,
            total_ventas_centavos: d.total_ventas_centavos,
            total_efectivo_centavos: d.total_efectivo_centavos,
            total_gastos_centavos: d.total_gastos_centavos,
            // cálculo preliminar de diferencia si existe saldo_final_reportado (solo efectivo vs teórico)
            ...(d as any).saldo_final_reportado != null ? (() => {
              const efectivoTeorico = (d.monto_inicial || 0) + d.total_efectivo_centavos - d.total_gastos_centavos;
              const contado = (d as any).saldo_final_reportado as number;
              const diff = contado - efectivoTeorico;
              let estado: 'cuadrado' | 'faltante' | 'sobrante' | null = 'cuadrado';
              const tolerancia = 0; // ajustar si se define umbral
              if (Math.abs(diff) > tolerancia) {
                estado = diff < 0 ? 'faltante' : 'sobrante';
              }
              return { estado_cuadre: estado, diferencia_centavos: diff };
            })() : { estado_cuadre: 'pendiente', diferencia_centavos: null }
          }));
          if (!cancel) setCierres(mapped);
        }
      } catch (e) {
        if (!cancel) setCierres([]);
      } finally {
        if (!cancel) setLoadingCierres(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [tabActiva, sesionActual?.restaurant_id]);

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
    setModals(prev => ({ ...prev, cierre: true }));
  };

  const handleConfirmarCierre = async (saldoReportado: number, notas: string): Promise<void> => {
    const res = await cerrarCaja(notas, { saldoFinalReportadoPesos: saldoReportado });
    if (!res.success) {
      setMensajeErrorCierre(res.error || 'No se pudo cerrar la caja');
      // Limpiar automáticamente después de unos segundos
      setTimeout(() => setMensajeErrorCierre(null), 6000);
    } else {
      setMensajeErrorCierre(null);
      setModals(prev => ({ ...prev, cierre: false }));
    }
  };

  const handleNuevaVenta = async () => {
    // Bloquear si no hay sesión abierta
    if (estadoCaja === 'cerrada' || !sesionActual?.id) {
  setModals(prev => ({ ...prev, apertura: true }));
  return; // el modal de apertura guiará al usuario
    }
    // Bloquear si requiere saneamiento (sesión de día previo)
    if (requiereSaneamiento) {
      alert('Sesión previa detectada. Debes cerrar la sesión anterior antes de registrar nuevas ventas.');
      setModals(prev => ({ ...prev, cierre: true }));
      return;
    }
    // Verificar rol: solo cajero/admin
    // Chequeo de permisos puede centralizarse en el hook o UI superior si aplica
    setModals(prev => ({ ...prev, nuevaVenta: true }));
  };

  const handleNuevoGasto = () => {
    if (estadoCaja === 'cerrada' || !sesionActual?.id) {
      setModals(prev => ({ ...prev, apertura: true }));
      return;
    }
    if (requiereSaneamiento) {
      alert('Sesión previa detectada. Debes cerrar la sesión anterior antes de registrar gastos.');
      setModals(prev => ({ ...prev, cierre: true }));
      return;
    }
    setModals(prev => ({ ...prev, gasto: true }));
  };

  const handleProcesarPago = (orden: OrdenPendiente) => {
    if (estadoCaja === 'cerrada' || !sesionActual?.id) {
      setModals(prev => ({ ...prev, apertura: true }));
      return;
    }
    if (requiereSaneamiento) {
      alert('Sesión previa detectada. Debes cerrar la sesión anterior antes de cobrar órdenes.');
      setModals(prev => ({ ...prev, cierre: true }));
      return;
    }
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
        <div className="px-4 sm:px-5 py-3 sm:py-4">
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

      {/* Layout principal */}
  <div className="px-4 sm:px-5 py-5 space-y-5">
      {mensajeErrorCierre && (
        <div className="mb-4">
          <Card className="bg-[color:var(--sp-error-50)] border-[color:var(--sp-error-200)] rounded-lg shadow-sm">
            <CardContent className="p-3 flex items-start space-x-2">
              <span className="text-[color:var(--sp-error-600)] text-sm">⚠️</span>
              <div className="text-[12px] leading-snug text-[color:var(--sp-error-700)]">
                {mensajeErrorCierre}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {estadoCaja === 'cerrada' ? (
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-4 sm:p-6">{EmptyStates.cajaAbierta(handleAbrirCaja)}</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
              {mostrarAvisoValidacion && (
                <div>
                  <Card className="border-[color:var(--sp-warning-300)] bg-[color:var(--sp-warning-50)] rounded-lg shadow-sm">
                    <CardContent className="p-3 flex items-start gap-2">
                      <span className="text-[color:var(--sp-warning-600)] text-sm">⚠️</span>
                      <div className="text-[11px] leading-snug text-[color:var(--sp-warning-700)]">
                        Validación avanzada de cierre deshabilitada (función validar_cierre_caja ausente).<br />
                        Se está usando una verificación simplificada (consulta directa de órdenes activas). Asegura cerrar manualmente mesas antes de cerrar la caja.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
          {/* Métricas en carrusel horizontal móvil */}
          <div className="-mx-4 sm:mx-0 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory flex gap-4 sm:block sm:overflow-visible">
            <div className="min-w-[640px] sm:min-w-0 flex-1 snap-start sm:snap-none">
              <MetricasDashboard metricas={metricas} loading={loading} />
            </div>
          </div>
          <MetricasAlert metricas={metricas} />

          <div className="bg-[color:var(--sp-surface)] border border-[color:var(--sp-border)] rounded-lg shadow-sm">
            <div className="p-4 sm:p-5">
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
            </div>
          </div>

          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-4 sm:p-5">
              {tabActiva === 'movimientos' ? (
                <MovimientosPanel
                  ordenesPendientes={ordenesPendientes}
                  transacciones={transaccionesDelDia}
                  gastos={gastosFiltrados}
                  onProcesarPago={handleProcesarPago}
                  loading={loading}
                  disabled={!!requiereSaneamiento}
                />
              ) : tabActiva === 'arqueo' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[color:var(--sp-neutral-900)]">Cierres de caja</h3>
                    <p className="text-[11px] text-[color:var(--sp-neutral-500)] mt-0.5">Histórico de sesiones cerradas. Versión inicial (placeholder).</p>
                  </div>
                  <CierresList
                    loading={loadingCierres}
                    cierres={cierres}
                    onSelect={(id) => setCierreSeleccionado(id)}
                  />
                </div>
              ) : tabActiva === 'reportes' ? (
                <ReportesCaja />
              ) : (
                EmptyStates.proximamente()
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>

      {/* Error global */}
      {error && (
  <div className="px-4 sm:px-5 pb-5">
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

      {/* Panel de seguridad (límites y progreso) al final */}
      {showSecurityPanel && (
        <div className="px-4 sm:px-5 pb-6">
          <SecurityPanel ventasTotalesPesos={metricas.ventasTotales || 0} />
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
          const res = await registrarVentaDirecta(venta);
          if (res.success) {
            setModals(prev => ({ ...prev, nuevaVenta: false }));
            await refrescar();
          }
          return res as any;
        }}
      />

      {/* Modal: Apertura de caja */}
      <ModalAperturaCaja
        isOpen={modals.apertura}
        onClose={() => setModals(prev => ({ ...prev, apertura: false }))}
        onConfirmar={async (monto, notas) => {
          const res = await abrirCaja(monto, notas);
          if (!res.success) {
            return { success: false, error: res.error } as any;
          }
          // Éxito: notificar y cerrar
          try {
            toast.success('Caja abierta correctamente');
          } catch {}
          setModals(prev => ({ ...prev, apertura: false }));
          // refrescar métricas/listas por si acaso
          setTimeout(() => refrescar(), 0);
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

      {/* Modal profesional de cierre de caja */}
      <ModalCierreCaja
        isOpen={modals.cierre}
        onClose={() => setModals(prev => ({ ...prev, cierre: false }))}
        onConfirm={handleConfirmarCierre}
        // Convertimos a PESOS para el modal (internamente ahora todo en pesos)
  saldoCalculado={saldoCalculadoDin}
        loading={loading || loadingSaldoCalc}
      />

  {/* Detalle cierre (placeholder) */}
  <CierreDetalle cierreId={cierreSeleccionado} onClose={() => setCierreSeleccionado(null)} />
    </div>
  );
};
