"use client";

// Página principal de gestión de mesas - Layout 70/30 con panel lateral fijo (350px)
import React, { useState } from 'react';
import { useSetPageTitle } from '@spoon/shared/Context/page-title-context';
import { Button as ButtonRaw } from '@spoon/shared/components/ui/Button';
// Cast de iconos para evitar conflictos de tipos de React en build (entorno monorepo)
import * as Lucide from 'lucide-react';
// Re-map con any para JSX mientras se estabiliza tipado global
const RefreshCw = Lucide.RefreshCw as any;
const DollarSign = Lucide.DollarSign as any;
const Settings = Lucide.Settings as any;
const AlertCircle = Lucide.AlertCircle as any;
const Plus = Lucide.Plus as any;
import { useMesas } from '@spoon/shared/hooks/mesas';
import { useCajaSesion } from '../../caja/hooks/useCajaSesion';
import MesaCard from './MesaCard';
import MesaDetallesPanel from './MesaDetallesPanel';
// Cast similar a otros componentes para evitar conflictos de tipos por múltiples React
import CrearOrdenWizardRaw from '@spoon/shared/components/mesas/CrearOrdenWizard';
const CrearOrdenWizard = CrearOrdenWizardRaw as any;
import ConfiguracionMesasPanelRaw from '@spoon/shared/components/mesas/ConfiguracionMesasPanel';
// Cast para evitar problemas de múltiples versiones de React en tipado
// (Solo a nivel de esta página; TODO: unificar @types/react en repo)
const Button = ButtonRaw as any;
const ConfiguracionMesasPanel = ConfiguracionMesasPanelRaw as any;
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';

// Interface para distribución de zonas
interface DistribucionZonas {
  [zona: string]: number; 
}

const MesasPage: React.FC = () => {
  useSetPageTitle('Gestión de Mesas', 'Control de mesas y cobros');

  // Hook integrado con sistema maestro
  const { 
    // Estados compatibles (anterior)
    mesasOcupadas,
    loading,
    restaurantId,
    
    // Estados del sistema maestro
    mesasCompletas,
    configuracion,
    loadingConfiguracion,
    estadisticas,
    
    // Funciones compatibles (anterior)
    cargarMesas,
    procesarCobro,
    
  // Funciones del sistema maestro
  configurarMesasIniciales,
  // Acciones adicionales
  crearOrden
  } = useMesas();
  // Estado de caja (abierta/cerrada)
  const { estadoCaja } = useCajaSesion();

  // Estados locales - SIN modal, CON panel lateral
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [modalConfiguracion, setModalConfiguracion] = useState(false);
  // Wizard para crear orden (ocupar mesa)
  const [wizardMesaNumero, setWizardMesaNumero] = useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [creandoMesa, setCreandoMesa] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  // Estado para recibo post-cobro
  const [reciboVisible, setReciboVisible] = useState(false);
  const [reciboData, setReciboData] = useState<null | {
    mesaNumero: number;
    fecha: string;
    items: { nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
    total: number;
  persistido?: boolean;
  persistError?: string;
  }>(null);

  // ========================================
  // FUNCIONES DE INTERACCIÓN
  // ========================================

  // Manejar click en mesa - ADMINISTRADOR: TODAS LAS MESAS
  const handleMesaClick = (numero: number) => {
    // Buscar la mesa en estructura completa
    const mesa = mesasCompletas.find(m => m.numero === numero);
    const displayEstado = mesa ? getEstadoDisplay(mesa).estado : (mesasOcupadas[numero] ? 'ocupada' : 'libre');
    const hasOrdenActiva = !!mesa?.detallesOrden && (
      (mesa.detallesOrden.items?.length ?? 0) > 0 || (mesa.detallesOrden.total ?? 0) > 0
    );

    // Caso especial: hay orden pero estado reporta libre -> tratar como ocupada (abrir detalles)
    if (displayEstado === 'libre' && hasOrdenActiva) {
      setMesaSeleccionada(numero);
      return;
    }

    // Si realmente está libre (sin orden) -> abrir wizard
    if (displayEstado === 'libre') {
      setWizardMesaNumero(numero);
      setWizardOpen(true);
      return;
    }

    // Estados ocupada / en_cocina / servida / por_cobrar / reservada etc.
    setMesaSeleccionada(numero);
  };

  // Crear orden a partir de items seleccionados en wizard
  const handleCrearOrdenWizard = async (items: { combinacionId: string; nombre: string; precio: number; cantidad: number; tipo: 'menu_dia' | 'especial'; }[]): Promise<boolean> => {
    setErrorCrear(null);
    if (estadoCaja !== 'abierta') {
      setErrorCrear('La caja está cerrada. Abre la caja antes de crear una orden.');
      return false;
    }
    if (!restaurantId || !wizardMesaNumero) {
      setErrorCrear('Contexto incompleto para crear la orden.');
      return false;
    }
    try {
      setCreandoMesa(true);
      // Mapear items al formato esperado por crearOrden
      const payloadItems = items.map(it => ({
        tipo: it.tipo,
        cantidad: it.cantidad,
        precioUnitario: it.precio,
        combinacionId: it.tipo === 'menu_dia' ? it.combinacionId : undefined,
        combinacionEspecialId: it.tipo === 'especial' ? it.combinacionId : undefined
      }));
  // Usamos crearOrden expuesto por hook local (ya instanciado arriba)
  const actionResult = await (crearOrden as any)?.({
        numeroMesa: wizardMesaNumero,
        mesero: 'Sistema',
        items: payloadItems
      });
      if (actionResult?.success) {
        // Refrescar mesas
        await cargarMesas();
        setWizardOpen(false);
        setMesaSeleccionada(wizardMesaNumero); // abrir panel detalles ya ocupada
        return true;
      }
      setErrorCrear(actionResult?.error || 'No se pudo crear la orden');
      return false;
    } catch (e) {
      console.error('Error creando orden desde wizard:', e);
      setErrorCrear(e instanceof Error ? e.message : 'Error desconocido');
      return false;
    } finally {
      setCreandoMesa(false);
    }
  };

  // Manejar cobro de mesa
  const handleCobrarMesa = async (numero: number) => {
    // Capturar datos antes de cobrar (orden actual)
    const mesaAntes = mesasCompletas.find(m => m.numero === numero);
    if (mesaAntes?.detallesOrden) {
      const items = (mesaAntes.detallesOrden.items || []).map((it: any) => {
        const cantidad = it.cantidad ?? 1;
        const unit = it.precio_unitario ?? it.precioUnitario ?? (it.precio_total && cantidad ? it.precio_total / cantidad : 0);
        const subtotal = (it.precio_total) ?? (unit * cantidad);
        return {
          nombre: it.nombre || it.name || 'Item',
          cantidad,
          precioUnitario: unit,
          subtotal
        };
      });
  const total = items.reduce((s: number, i: { subtotal: number }) => s + i.subtotal, 0);
      setReciboData({ mesaNumero: numero, fecha: new Date().toLocaleString(), items, total });
    }
    const success = await procesarCobro(numero);
    if (success) {
      // Intentar registrar cobro histórico
      if (reciboData) {
        try {
          const { registrarCobroMesa } = await import('@spoon/shared/lib/supabase');
          const result = await registrarCobroMesa({
            restaurantId: restaurantId || '',
            mesaNumero: numero,
            total: reciboData.total,
            items: reciboData.items,
            metodo: 'efectivo'
          });
          setReciboData(prev => prev ? { ...prev, persistido: result.success && result.logged } : prev);
        } catch (e) {
          console.warn('No se pudo registrar cobro histórico', e);
          setReciboData(prev => prev ? { ...prev, persistido: false, persistError: (e as Error)?.message } : prev);
        }
      }
      // Refrescar mesas y mostrar modal
      await cargarMesas();
      setMesaSeleccionada(null);
      setReciboVisible(true);
    } else {
      // Si falló, limpiar recibo provisional
      setReciboData(null);
    }
    return success;
  };

  // Cerrar panel de detalles
  const handleCerrarPanel = () => {
    setMesaSeleccionada(null);
  };

  // Manejar configuración
  const handleConfigurar = async (totalMesas: number): Promise<boolean> => {
    try {
      const result = await configurarMesasIniciales(totalMesas);
      return result;
    } catch (error) {
      console.error('❌ Error en configuración:', error);
      return false;
    }
  };

  // ========================================
  // VALORES CALCULADOS
  // ========================================

  const formatCurrency = (amount: number) => formatCurrencyCOP(amount);

  // Usar estadísticas del sistema maestro si están disponibles
  const totalPendiente = configuracion.configuradas 
    ? estadisticas.totalPendiente
    : Object.values(mesasOcupadas).reduce((sum, mesa) => sum + mesa.total, 0);
    
  const mesasActivas = estadoCaja === 'cerrada'
    ? 0
    : (configuracion.configuradas
      ? mesasCompletas.filter(m => ['ocupada', 'en_cocina', 'servida', 'por_cobrar'].includes(getEstadoDisplay(m).estado)).length
      : Object.keys(mesasOcupadas).length);

  const ordenesEnCocina = estadoCaja === 'cerrada'
    ? 0
    : (configuracion.configuradas
      ? mesasCompletas.filter(m => getEstadoDisplay(m).estado === 'en_cocina').length
      : 0);

  const totalPorCobrar = estadoCaja === 'cerrada'
    ? 0
    : (configuracion.configuradas
      ? mesasCompletas
          .filter(m => getEstadoDisplay(m).estado === 'por_cobrar' && m.detallesOrden)
          .reduce((sum, m) => sum + (m.detallesOrden?.total || 0), 0)
      : 0);

  // ========================================
  // RENDERIZADO CONDICIONAL
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--sp-neutral-50)] flex justify-center items-center">
  <div className="bg-[color:var(--sp-surface-elevated)] p-6 border border-[color:var(--sp-border)] rounded-lg shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-[color:var(--sp-neutral-500)] mx-auto mb-2" />
          <p className="text-[color:var(--sp-neutral-600)]">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="relative min-h-screen bg-[color:var(--sp-neutral-50)]">
      {/* Header superior fijo de la vista */}
  <div className="bg-[color:var(--sp-surface)] border-b border-[color:var(--sp-border)]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="heading-page">Gestión de Mesas</h1>
            <p className="subtitle">
              {configuracion.configuradas
                ? `${configuracion.totalMesas} mesas configuradas`
                : 'Control de mesas y cobros'}
              {mesaSeleccionada && ` • Mesa ${mesaSeleccionada} seleccionada`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {configuracion.configuradas && (
              <Button
                onClick={cargarMesas}
                variant="outline"
                className="bg-[color:var(--sp-surface-elevated)] border-[color:var(--sp-border)]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button> 
            )}
            <Button
              onClick={() => setModalConfiguracion(true)}
              variant="outline"
              className="bg-[color:var(--sp-primary-50)] border-[color:var(--sp-primary-200)] text-[color:var(--sp-primary-700)] hover:bg-[color:var(--sp-primary-100)]"
              disabled={loadingConfiguracion}
            >
              <Settings className="h-4 w-4 mr-2" />
              {configuracion.configuradas ? 'Reconfigurar' : 'Configurar Mesas'}
            </Button>
          </div>
        </div>
      </div>

  {/* Contenido principal: grid 70/30 con panel derecho de 350px */}
  <div className="max-w-[1400px] mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* Columna izquierda */}
        <div className="space-y-6 order-1 md:order-2 lg:order-1">
          {/* KPIs compactos */}
          <div className="flex w-full gap-3 overflow-x-auto lg:overflow-visible">
            <div className="flex-[1_1_140px] bg-[color:var(--sp-surface-elevated)] border-l-4 border-[color:var(--sp-success-500)] rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md">
              <div className="label-tertiary text-xs">Mesas activas</div>
              <div className="mt-1 value-number">{mesasActivas}</div>
            </div>
            <div className="flex-[2_1_200px] bg-[color:var(--sp-surface-elevated)] border-l-4 border-[color:var(--sp-primary-500)] rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md">
              <div className="label-tertiary text-xs">Total pendiente</div>
              <div className="mt-1 value-number text-[color:var(--sp-primary-700)]">{formatCurrency(totalPendiente)}</div>
            </div>
            {configuracion.configuradas && (
              <div className="flex-[1_1_160px] bg-[color:var(--sp-surface-elevated)] border-l-4 border-[color:var(--sp-primary-500)] rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md">
                <div className="label-tertiary text-xs">Órdenes en cocina</div>
                <div className="mt-1 value-number text-[color:var(--sp-primary-700)]">{ordenesEnCocina}</div>
              </div>
            )}
            {configuracion.configuradas && (
              <div className="flex-[2_1_200px] bg-[color:var(--sp-surface-elevated)] border-l-4 border-[color:var(--sp-warning-500)] rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md">
                <div className="label-tertiary text-xs">Total por cobrar</div>
                <div className="mt-1 value-number text-[color:var(--sp-warning-700)]">{formatCurrency(totalPorCobrar)}</div>
              </div>
            )}
            {/* Zonas eliminadas del modelo: se remueven KPIs por zona */}
          </div>

          {/* Contenido según configuración */}
          {configuracion.configuradas ? (
            <>
              {/* Grid de mesas - auto-fit */}
              {estadoCaja === 'cerrada' && (
                <div className="bg-[color:var(--sp-neutral-100)] border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg p-4 mb-2 text-sm">
                  Caja cerrada: no hay servicio activo. Las mesas se muestran como libres (solo mantenimiento/inactivas si existieran).
                </div>
              )}
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] [grid-auto-rows:1fr]">
                {mesasCompletas.map((mesa) => {
                  const display = getEstadoDisplay(mesa);
                  const hasOrdenActiva = !!mesa.detallesOrden && ((mesa.detallesOrden.items?.length ?? 0) > 0 || (mesa.detallesOrden.total ?? 0) > 0);
                  // Si el display dice libre pero hay orden, forzamos ocupada visual
                  const estadoVisualAjustado = (display.estado === 'libre' && hasOrdenActiva) ? 'ocupada' : display.estado;
                  const forzarLibre = estadoCaja === 'cerrada' && !['inactiva','mantenimiento'].includes(estadoVisualAjustado);
                  return (
                    <MesaCard
                      key={mesa.numero}
                      numero={mesa.numero}
                      estado={forzarLibre ? 'vacia' : (estadoVisualAjustado === 'libre' ? 'vacia' : 'ocupada')}
                      total={forzarLibre ? undefined : mesa.detallesOrden?.total}
                      onClick={() => !forzarLibre && handleMesaClick(mesa.numero)}
                      nombre={mesa.nombre}
                      zona={mesa.zona}
                      capacidad={mesa.capacidad}
                      estadoMesa={forzarLibre ? 'libre' : estadoVisualAjustado}
                      items={forzarLibre ? undefined : mesa.detallesOrden?.items?.length}
                      comensales={forzarLibre ? undefined : mesa.detallesOrden?.comensales}
                      inicioAtencion={forzarLibre ? undefined : mesa.detallesOrden?.fechaCreacion}
                      seleccionada={!forzarLibre && mesaSeleccionada === mesa.numero}
                    />
                  );
                })}
              </div>

              {/* Resumen */}
              {estadoCaja === 'abierta' && mesasActivas > 0 && (
                <div className="bg-[color:var(--sp-primary-50)] border border-[color:var(--sp-primary-200)] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="heading-section text-[color:var(--sp-primary-800)]">Resumen del día</h3>
                      <p className="text-[color:var(--sp-primary-700)] text-sm">
                        {mesasActivas} mesa{mesasActivas > 1 ? 's' : ''} pendiente{mesasActivas > 1 ? 's' : ''} de cobro
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[color:var(--sp-primary-800)]">
                      <DollarSign className="h-5 w-5" />
                      <span className="value-number">{formatCurrency(totalPendiente)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-warning-200)] rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-[color:var(--sp-warning-500)] mx-auto mb-4" />
              <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">
                ¡Configura tus mesas para empezar!
              </h3>
              <p className="text-[color:var(--sp-neutral-600)] mb-6 max-w-md mx-auto">
                El sistema maestro de mesas te permite personalizar tu restaurante con nombres y capacidades.
                Es rápido y fácil de configurar.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setModalConfiguracion(true)}
                  className="bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[color:var(--sp-on-primary)]"
                  disabled={loadingConfiguracion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loadingConfiguracion ? 'Configurando...' : 'Configurar Mesas'}
                </Button>
              </div>
              {/* Zonas eliminadas: se retira tip relacionado */}
            </div>
          )}
        </div>

        {/* Panel derecho fijo 350px */}
        <div className="bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-lg lg:rounded-none lg:border-0 lg:border-l lg:border-[color:var(--sp-border)] lg:bg-[color:var(--sp-surface-elevated)] min-h-[400px] order-2 md:order-1 lg:order-2">
          <MesaDetallesPanel
            mesa={
              mesaSeleccionada == null
                ? null
                : mesasCompletas.length === 0
                  ? null
                  : mesasCompletas.find(m => m.numero === mesaSeleccionada) || null
            }
            onClose={handleCerrarPanel}
            restaurantId={restaurantId || ''}
            onCobrar={handleCobrarMesa}
            cajaAbierta={estadoCaja === 'abierta'}
          />
        </div>
      </div>

      {/* Panel de configuración de mesas (una sola pantalla, fondo difuminado) */}
      <ConfiguracionMesasPanel
        isOpen={modalConfiguracion}
        onClose={() => setModalConfiguracion(false)}
        onConfigurar={handleConfigurar}
        loading={loadingConfiguracion}
  configuracionActual={configuracion}
  restaurantId={restaurantId || undefined}
      />

      {/* Wizard creación de orden (ocupar mesa) */}
      <CrearOrdenWizard
        isOpen={wizardOpen}
        onClose={() => { if (!creandoMesa) { setWizardOpen(false); setWizardMesaNumero(null);} }}
        onCrearOrden={handleCrearOrdenWizard}
        restaurantId={restaurantId || ''}
        mesaNumero={wizardMesaNumero || 0}
        loading={creandoMesa}
      />
      {wizardOpen && errorCrear && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-[color:var(--sp-error-600)] text-[color:var(--sp-on-error)] shadow-lg text-sm">
          {errorCrear}
        </div>
      )}
      {reciboVisible && reciboData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[color:color-mix(in_srgb,black_40%,transparent)] p-4">
          <div className="w-full max-w-md bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-lg shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[color:var(--sp-border)] flex items-center justify-between">
              <h3 className="heading-section">Recibo Mesa {reciboData.mesaNumero}</h3>
              <button onClick={() => { setReciboVisible(false); setReciboData(null); }} className="text-sm px-2 py-1 rounded hover:bg-[color:var(--sp-neutral-100)]">✕</button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto text-sm">
              <div className="flex justify-between text-[color:var(--sp-neutral-600)]">
                <span>Fecha</span><span>{reciboData.fecha}</span>
              </div>
              <div className="flex justify-between text-[color:var(--sp-neutral-600)] text-xs">
                <span>Registro</span>
                {reciboData.persistido === undefined ? (
                  <span className="italic">(memoria)</span>
                ) : reciboData.persistido ? (
                  <span className="text-[color:var(--sp-success-600)]">guardado</span>
                ) : (
                  <span className="text-[color:var(--sp-warning-600)]">no guardado{reciboData.persistError ? '*' : ''}</span>
                )}
              </div>
              <div className="border-t border-[color:var(--sp-border)] pt-2">
                {reciboData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <div className="pr-2 truncate">
                      <span className="font-medium text-[color:var(--sp-neutral-800)]">{it.nombre}</span>
                      <span className="text-[color:var(--sp-neutral-500)]"> × {it.cantidad}</span>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="text-[color:var(--sp-neutral-600)]">{Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(it.precioUnitario)}</div>
                      <div className="text-[color:var(--sp-neutral-900)] font-semibold">{Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(it.subtotal)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-[color:var(--sp-border)] pt-3 mt-2 font-semibold text-[color:var(--sp-neutral-900)]">
                <span>Total</span>
                <span>{Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(reciboData.total)}</span>
              </div>
            </div>
            <div className="px-5 py-4 bg-[color:var(--sp-neutral-50)] flex gap-2">
              <button
                onClick={() => { window.print(); }}
                className="flex-1 px-3 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] text-sm hover:bg-[color:var(--sp-primary-700)]"
              >Imprimir</button>
              <button
                onClick={() => { setReciboVisible(false); setReciboData(null); }}
                className="px-3 py-2 rounded bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-800)] text-sm hover:bg-[color:var(--sp-neutral-300)]"
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesasPage;


