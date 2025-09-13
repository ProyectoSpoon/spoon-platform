'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus as PlusRaw, Truck as TruckRaw } from 'lucide-react';
const Plus: any = PlusRaw; // Cast temporal por duplicación de tipos React
const Truck: any = TruckRaw;
const LinkAny: any = Link;
import { ESTADOS_PEDIDO, REFRESH_INTERVAL } from '../constants/domiciliosConstants';
import PedidoForm from './PedidoForm';
import PedidoDetailCard from './PedidoDetailCard';
import PedidosTableOverview from './PedidosTableOverview';
import DomiciliariosPanel from './DomiciliariosPanel';
import DomiciliariosWizardSlideOver from './modals/DomiciliariosWizardSlideOver';
import PagoModal from './PagoModal';
import TopBannerCaja from '../components/TopBannerCaja';
import HeaderTabsAndActions from '../components/HeaderTabsAndActions';
import CompactMetrics from '../components/CompactMetrics';
import FiltersCompact from '../components/FiltersCompact';
import { useDomiciliosPageController } from '../hooks/useDomiciliosPageController';

export default function DomiciliosPage() {
  // Inline sort controls component (stateless)
  function SortControls({ value, onChange }: { value: { key: 'tiempo'|'valor'|'estado'; dir: 'asc'|'desc' }, onChange: (v: { key: 'tiempo'|'valor'|'estado'; dir: 'asc'|'desc' })=>void }) {
    return (
      <div className="flex items-center gap-1">
        <select value={value.key} onChange={(e)=> onChange({ key: e.target.value as any, dir: value.dir })} className="px-2 py-1 border rounded-md text-xs">
          <option value="tiempo">Tiempo</option>
          <option value="valor">Valor</option>
          <option value="estado">Estado</option>
        </select>
        <select value={value.dir} onChange={(e)=> onChange({ key: value.key, dir: e.target.value as any })} className="px-2 py-1 border rounded-md text-xs">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
    );
  }
  const {
    // data
    pedidos,
    domiciliarios,
    domiciliariosDisponibles,
    menu,
    filtros,

    // loading
    loadingPedidos,
    loadingDomiciliarios,
    loadingMenu,
    loadingStates,
  // error/info
    

    // caja
    hasOpenCajaSession,
  hayMenuHoy,

    // pagination/limits
    limit,

    // ui state
  tab, setTab,
    mostrarFormulario, setMostrarFormulario,
    pedidoParaPago, setPedidoParaPago,
    wizardOpen, setWizardOpen,
    isCompact,

    // metrics
    pendientes, enRuta, entregados, totalDia, disponibles,

    // actions
    crearPedido,
    actualizarEstado,
    actualizarEstadoDomiciliario,
    registrarPago,
    cargarPedidos,
    updateFiltros,
    loadMore,
  agregarDomiciliario,
  onChangeTab,
  onAplicarFiltros,
  } = useDomiciliosPageController();

  // Estado de vista y selección deben declararse al tope (reglas de hooks)
  type VistaActiva = 'tabla' | 'detalle';
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('tabla');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'tiempo'|'valor'|'estado'>('tiempo');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  // Auto-refresh cada 30s
  useEffect(() => {
    const id = setInterval(() => {
      cargarPedidos();
    }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [cargarPedidos]);

  if (loadingPedidos || loadingDomiciliarios || loadingMenu) {
    return (
      <div className="min-h-screen bg-[--sp-surface] flex items-center justify-center">
        <div className="bg-[--sp-surface-elevated] rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-500)] mx-auto mb-4"></div>
          <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">
            Cargando sistema de domicilios...
          </h3>
          <p className="text-[color:var(--sp-neutral-600)] text-sm">
            Preparando toda la informacion.
          </p>
          <div role="status" aria-live="polite" className="sr-only">Cargando contenidos</div>
        </div>
      </div>
    );
  }

  if (!hayMenuHoy) {
    return (
    <div className="min-h-screen bg-[--sp-surface] p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-page mb-6">Domicilios</h1>
          
      <div className="bg-[--sp-surface-elevated] rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-[color:var(--sp-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-12 h-12 text-[color:var(--sp-primary-600)]" />
            </div>
            <h3 className="heading-section mb-4">
              No hay menu configurado para hoy
            </h3>
            <p className="text-[color:var(--sp-neutral-600)] mb-8 max-w-md mx-auto">
              Necesitas configurar el menu del dia antes de recibir pedidos de domicilio.
            </p>
            
            <LinkAny
              href="/dashboard/carta/menu-dia"
        className="px-6 py-3 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Configurar Menu del Dia
            </LinkAny>
          </div>
        </div>
      </div>
    );
  }

  // isCompact viene del hook controlador

  return (
	<div className="min-h-screen bg-[--sp-surface]">
      <div className={(isCompact ? 'max-w-5xl' : 'max-w-7xl') + ' mx-auto px-4 py-6 transition-[max-width]'}>
  <TopBannerCaja visible={!hasOpenCajaSession} />
  {/* Error live region */}
  <div aria-live="assertive" className="sr-only" id="domicilios-aria-errors"></div>
        
        <HeaderTabsAndActions
          tab={tab}
          registros={pedidos.length}
          limit={limit}
          onChangeTab={onChangeTab}
          onActualizar={onAplicarFiltros}
          onNuevoPedido={() => setMostrarFormulario(true)}
          onGestionarDomiciliarios={() => setWizardOpen(true)}
          descripcion={tab==='hoy' ? 'Gestiona los pedidos del día en tiempo real.' : 'Explora pedidos anteriores, filtra por estado y domiciliario.'}
        />

        <CompactMetrics
          pendientes={pendientes}
          enRuta={enRuta}
          entregados={entregados}
          totalDia={totalDia}
          disponibles={disponibles}
          showCajaBannerInside={!hasOpenCajaSession}
        />

  {/* Toggle vista tabla/detalle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            className={`px-3 py-1.5 text-sm rounded-md border ${vistaActiva==='tabla' ? 'bg-[color:var(--sp-neutral-100)] font-medium' : ''}`}
            onClick={()=> setVistaActiva('tabla')}
            aria-pressed={vistaActiva==='tabla'}
          >
            Tabla
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md border ${vistaActiva==='detalle' ? 'bg-[color:var(--sp-neutral-100)] font-medium' : ''}`}
            onClick={()=> setVistaActiva('detalle')}
            aria-pressed={vistaActiva==='detalle'}
          >
            Detalle
          </button>
        </div>

        {/* Filtros rápidos y orden (solo tabla) */}
        {vistaActiva === 'tabla' && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-[color:var(--sp-neutral-600)]">Estado:</span>
              {['todos', ESTADOS_PEDIDO.RECIBIDO, ESTADOS_PEDIDO.COCINANDO, ESTADOS_PEDIDO.LISTO, ESTADOS_PEDIDO.ENVIADO, ESTADOS_PEDIDO.ENTREGADO, ESTADOS_PEDIDO.PAGADO].map(e => (
                <button
                  key={e}
                  className={`px-2 py-1 border rounded-md text-xs ${String(filtros.estado)===e ? 'bg-[color:var(--sp-neutral-100)] font-medium' : ''}`}
                  onClick={()=> updateFiltros({ estado: e as any })}
                >{e}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-[color:var(--sp-neutral-600)]">Ordenar por:</span>
              <SortControls value={{ key: sortKey, dir: sortDir }} onChange={(v)=> { setSortKey(v.key); setSortDir(v.dir); }} />
            </div>
          </div>
        )}

  <FiltersCompact
          tab={tab}
          filtros={{ estado: filtros.estado as string, domiciliario: filtros.domiciliario as string, fecha: filtros.fecha as string, buscar: (filtros as any).buscar }}
          domiciliarios={domiciliarios}
          onUpdateFiltros={(patch) => updateFiltros(patch as any)}
        />

        <div
          className="grid grid-cols-1 gap-6 items-start"
          id={tab==='hoy' ? 'panel-hoy' : 'panel-historial'}
          role="tabpanel"
          aria-labelledby={tab==='hoy' ? 'tab-hoy' : 'tab-historial'}
        >
          <div className="space-y-5">
            {vistaActiva === 'tabla' ? (
              <PedidosTableOverview
                pedidos={pedidos}
                domiciliarios={domiciliarios}
                sortKey={sortKey}
                sortDir={sortDir}
                onChangeEstado={(id, estado) => actualizarEstado({ pedido_id: id, nuevo_estado: estado })}
                onAsignarDomiciliario={(id, domId) => actualizarEstado({ pedido_id: id, nuevo_estado: ESTADOS_PEDIDO.ENVIADO, domiciliario_id: domId })}
                onVerDetalle={(id)=> { setPedidoSeleccionado(id); setVistaActiva('detalle'); }}
              />
            ) : (
              <PedidoDetailCard 
                pedidos={pedidoSeleccionado ? pedidos.filter(p=>p.id===pedidoSeleccionado) : pedidos}
                domiciliarios={domiciliarios}
                onUpdateEstado={actualizarEstado}
                onRegistrarPago={(data) => {
                  registrarPago(data);
                  setPedidoParaPago(null);
                }}
                loading={loadingStates}
                hasOpenCajaSession={hasOpenCajaSession}
              />
            )}
            {tab==='historial' && pedidos.length >= limit && (
              <div className="flex justify-center pb-4">
                <button
                  onClick={loadMore}
                  className="px-5 py-2 text-sm bg-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-300)] rounded-md text-[color:var(--sp-neutral-800)]"
                >
                  Cargar más
                </button>
              </div>
            )}
          </div>
        </div>

  {mostrarFormulario && (
      <div className="fixed inset-0 z-50 overflow-hidden">
    <div className="absolute inset-0 bg-[--sp-overlay] backdrop-blur-sm" onClick={() => setMostrarFormulario(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-[--sp-surface-elevated] shadow-xl">
              <PedidoForm 
                menu={menu}
                onSubmit={async (nuevoPedido) => {
                  const ok = await crearPedido(nuevoPedido);
                  if (ok) setMostrarFormulario(false);
                  return ok;
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
        <DomiciliariosWizardSlideOver
          isOpen={wizardOpen}
          onClose={()=>setWizardOpen(false)}
          domiciliarios={domiciliarios}
          onAdd={agregarDomiciliario}
          onUpdateStatus={actualizarEstadoDomiciliario}
          loading={loadingDomiciliarios}
        />
      </div>
    </div>
  );
}
