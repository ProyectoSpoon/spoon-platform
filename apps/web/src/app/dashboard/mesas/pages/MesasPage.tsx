'use client';

// Página principal de gestión de mesas - Layout 80/20 con panel lateral
import React, { useState } from 'react';
import { useSetPageTitle } from '@spoon/shared/Context/page-title-context';
import { Button } from '@spoon/shared/components/ui/Button';
import { RefreshCw, DollarSign, Settings, AlertCircle, Plus } from 'lucide-react';
import { useMesas } from '@spoon/shared//hooks/mesas/useMesas';
import MesaCard from './MesaCard';
import MesaDetallesPanel from './MesaDetallesPanel';
import ConfiguracionMesasModal from '@spoon/shared/components/mesas/ConfiguracionMesasModal';

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
  const handleConfigurar = async (
    totalMesas: number, 
    distribucion: DistribucionZonas
  ): Promise<boolean> => {
    console.log('🔧 Configurando mesas:', { totalMesas, distribucion });
    
    try {
      const result = await configurarMesasIniciales(totalMesas, distribucion);
      console.log('✅ Resultado configuración:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en configuración:', error);
      return false;
    }
  };

  // ========================================
  // VALORES CALCULADOS
  // ========================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Usar estadísticas del sistema maestro si están disponibles
  const totalPendiente = configuracion.configuradas 
    ? estadisticas.totalPendiente
    : Object.values(mesasOcupadas).reduce((sum, mesa) => sum + mesa.total, 0);
    
  const mesasActivas = configuracion.configuradas
    ? estadisticas.mesasOcupadas
    : Object.keys(mesasOcupadas).length;

  // ========================================
  // RENDERIZADO CONDICIONAL
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout principal: 80% mesas + 20% panel lateral */}
      <div className="flex h-screen">
        
        {/* ========================================
            COLUMNA IZQUIERDA - 80% GESTIÓN DE MESAS
            ======================================== */}
        <div className="flex-1 flex flex-col p-6" style={{ width: '80%' }}>
          <div className="max-w-7xl mx-auto space-y-6 flex-1">
            
            {/* Header con KPIs */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
                <p className="text-gray-500">
                  {configuracion.configuradas 
                    ? `${configuracion.totalMesas} mesas configuradas en ${configuracion.zonas.length} zona${configuracion.zonas.length > 1 ? 's' : ''}`
                    : 'Control de mesas y cobros'
                  }
                  {mesaSeleccionada && ` • Mesa ${mesaSeleccionada} seleccionada`}
                </p>
              </div>
              
              <div className="flex gap-4 items-center">
                {/* KPIs */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{mesasActivas}</div>
                  <div className="text-sm text-gray-500">Mesas Activas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPendiente)}
                  </div>
                  <div className="text-sm text-gray-500">Total Pendiente</div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2">
                  {configuracion.configuradas && (
                    <Button 
                      onClick={cargarMesas}
                      variant="outline"
                      className="bg-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => setModalConfiguracion(true)}
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    disabled={loadingConfiguracion}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {configuracion.configuradas ? 'Reconfigurar' : 'Configurar Mesas'}
                  </Button>
                </div>
              </div>
            </div>

            {/* ========================================
                SISTEMA MAESTRO CONFIGURADO
                ======================================== */}
            {configuracion.configuradas ? (
              <div className="flex-1 space-y-6">
                {/* Estadísticas adicionales del sistema maestro */}
                {configuracion.zonas.length > 1 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">Distribución por zonas:</h3>
                    <div className="flex gap-4">
                      {configuracion.zonas.map(zona => {
                        const mesasZona = mesasCompletas.filter(m => m.zona === zona);
                        const ocupadasZona = mesasZona.filter(m => m.ocupada).length;
                        return (
                          <div key={zona} className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {ocupadasZona}/{mesasZona.length}
                            </div>
                            <div className="text-sm text-gray-500">{zona}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grid de mesas - Sistema Maestro */}
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {mesasCompletas
                    .filter(mesa => mesa.estado !== 'inactiva') // No mostrar mesas inactivas
                    .map((mesa) => (
                      <MesaCard
                        key={mesa.numero}
                        numero={mesa.numero}
                        estado={mesa.ocupada ? 'ocupada' : 'vacia'}
                        total={mesa.detallesOrden?.total}
                        onClick={() => handleMesaClick(mesa.numero)}
                        // Props adicionales del sistema maestro
                        nombre={mesa.nombre}
                        zona={mesa.zona}
                        capacidad={mesa.capacidad}
                        estadoMesa={mesa.estado}
                      />
                    ))
                  }
                </div>

                {/* Resumen */}
                {mesasActivas > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-blue-800">Resumen del día</h3>
                        <p className="text-blue-700 text-sm">
                          {mesasActivas} mesa{mesasActivas > 1 ? 's' : ''} pendiente{mesasActivas > 1 ? 's' : ''} de cobro
                          {configuracion.zonas.length > 1 && ` • ${configuracion.zonas.length} zonas activas`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-xl font-bold">{formatCurrency(totalPendiente)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ========================================
                  SISTEMA NO CONFIGURADO
                  ======================================== */
              <div className="bg-white border border-yellow-200 rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Configura tus mesas para empezar!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  El sistema maestro de mesas te permite personalizar tu restaurante con nombres, zonas, 
                  capacidades y mucho más. Es rápido y fácil de configurar.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setModalConfiguracion(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loadingConfiguracion}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loadingConfiguracion ? 'Configurando...' : 'Configurar Mesas'}
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    💡 <strong>Tip:</strong> Puedes configurar zonas como "Comedor", "Terraza", "VIP" 
                    y personalizar cada mesa con nombres y capacidades específicas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================
            COLUMNA DERECHA - 20% PANEL DE DETALLES ADMINISTRADOR
            ======================================== */}
        <div className="bg-white border-l border-gray-200" style={{ width: '20%', minWidth: '320px' }}>
          <MesaDetallesPanel
            mesaNumero={mesaSeleccionada}
            isVisible={mesaSeleccionada !== null}
            onCobrar={handleCobrarMesa}
            onClose={handleCerrarPanel}
            restaurantId={restaurantId}
            // Props adicionales para funcionalidad de administrador
            mesasOcupadas={mesasOcupadas}
            mesasCompletas={mesasCompletas}
          />
        </div>

      </div>

      {/* Modal de configuración de mesas (mantiene funcionalidad) */}
      <ConfiguracionMesasModal
        isOpen={modalConfiguracion}
        onClose={() => setModalConfiguracion(false)}
        onConfigurar={handleConfigurar}
        loading={loadingConfiguracion}
        configuracionActual={configuracion}
      />
    </div>
  );
};

export default MesasPage;