"use client";

// Página principal de gestión de mesas - Layout 70/30 con panel lateral fijo (350px)
import React, { useState } from 'react';
import { useSetPageTitle } from '@spoon/shared/Context/page-title-context';
import { Button } from '@spoon/shared/components/ui/Button';
import { RefreshCw, DollarSign, Settings, AlertCircle, Plus } from 'lucide-react';
import { useMesas } from '@spoon/shared/hooks/mesas';
import MesaCard from './MesaCard';
import MesaDetallesPanel from './MesaDetallesPanel';
import ConfiguracionMesasPanel from '@spoon/shared/components/mesas/ConfiguracionMesasPanel';
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
    configurarMesasIniciales
  } = useMesas();

  // Estados locales - SIN modal, CON panel lateral
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [modalConfiguracion, setModalConfiguracion] = useState(false);

  // ========================================
  // FUNCIONES DE INTERACCIÓN
  // ========================================

  // Manejar click en mesa - ADMINISTRADOR: TODAS LAS MESAS
  const handleMesaClick = (numero: number) => {
    // Como administrador, puedes hacer click en cualquier mesa
    setMesaSeleccionada(numero);
    console.log('🎯 Mesa seleccionada:', numero, '- Estado:', mesasOcupadas[numero] ? 'ocupada' : 'vacía');
  };

  // Manejar cobro de mesa
  const handleCobrarMesa = async (numero: number) => {
    const success = await procesarCobro(numero);
    if (success) {
      setMesaSeleccionada(null); // Cerrar panel después del cobro
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
    
  const mesasActivas = configuracion.configuradas
    ? mesasCompletas.filter(m => ['ocupada', 'en_cocina', 'servida', 'por_cobrar'].includes(getEstadoDisplay(m).estado)).length
    : Object.keys(mesasOcupadas).length;

  const ordenesEnCocina = configuracion.configuradas
    ? mesasCompletas.filter(m => getEstadoDisplay(m).estado === 'en_cocina').length
    : 0;

  const totalPorCobrar = configuracion.configuradas
    ? mesasCompletas
        .filter(m => getEstadoDisplay(m).estado === 'por_cobrar' && m.detallesOrden)
        .reduce((sum, m) => sum + (m.detallesOrden?.total || 0), 0)
    : 0;

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
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] [grid-auto-rows:1fr]">
                {mesasCompletas
                  .map((mesa) => (
                    <MesaCard
                      key={mesa.numero}
                      numero={mesa.numero}
                      estado={getEstadoDisplay(mesa).estado === 'libre' ? 'vacia' : 'ocupada'}
                      total={mesa.detallesOrden?.total}
                      onClick={() => handleMesaClick(mesa.numero)}
                      // Props adicionales del sistema maestro
                      nombre={mesa.nombre}
                      zona={mesa.zona}
                      capacidad={mesa.capacidad}
                      estadoMesa={getEstadoDisplay(mesa).estado}
                      items={mesa.detallesOrden?.items?.length}
                      comensales={mesa.detallesOrden?.comensales}
                      inicioAtencion={mesa.detallesOrden?.fechaCreacion}
                      seleccionada={mesaSeleccionada === mesa.numero}
                    />
                  ))
                }
              </div>

              {/* Resumen */}
              {mesasActivas > 0 && (
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
            mesa={mesasCompletas.find(m => m.numero === mesaSeleccionada) || null}
            onClose={handleCerrarPanel}
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
    </div>
  );
};

export default MesasPage;

