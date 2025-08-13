'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { ControlesCaja } from './ControlesCaja';
import { OrdenPendiente, EstadisticasOrdenes, OrdenesVacias } from '../pages/OrdenPendiente';
import { ModalProcesarPago } from '../pages/modals/ModalProcesarPago';
import GastoWizardSlideOver from '../pages/modals/GastoWizardSlideOver';
import { useCaja } from '../../caja/hooks/useCaja';
import { useCajaSesion } from '../../caja/hooks/useCajaSesion';
import { useGastos } from '../../caja/hooks/useGastos';
import { useSecurityLimits } from '../../caja/hooks/useSecurityLimits';
import { SecurityAlert } from '../../caja/components/SecurityAlert';
import { OrdenPendiente as OrdenPendienteType } from '../../caja/types/cajaTypes';
import { formatCurrency, getIconoCategoria, getColorCategoria } from '../../caja/constants/cajaConstants';
import { AlertTriangle, Shield, DollarSign } from 'lucide-react';
import ActionBar from '@spoon/shared/components/ui/ActionBar';

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';
type SubTabMovimientos = 'por_cobrar' | 'ingresos' | 'egresos';

export const CajaTerminal: React.FC = () => {
  const { sesionActual, estadoCaja } = useCajaSesion();
  const estadoCajaActual = estadoCaja as 'abierta' | 'cerrada';
  const {
    ordenesMesas,
    ordenesDelivery,
    loading,
    error,
    totalOrdenesPendientes,
    montoTotalPendiente,
    metricas,
    procesarPago,
    refrescar
  } = useCaja();
  const { gastos, crearGasto, loading: loadingGastos } = useGastos();
  
  // NUEVO: Hook de seguridad
  const { limits, validarMonto, formatearMonto } = useSecurityLimits();

  const [tabActiva, setTabActiva] = useState<TabActiva>('movimientos');
  const [subTabMovimientos, setSubTabMovimientos] = useState<SubTabMovimientos>('por_cobrar');
  const [filtroTiempo, setFiltroTiempo] = useState('hoy');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenPendienteType | null>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalGastoAbierto, setModalGastoAbierto] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [busqueda, setBusqueda] = useState('');
  
  // NUEVO: Estado para alertas de seguridad
  const [securityAlert, setSecurityAlert] = useState<{
    type: 'warning' | 'info' | 'error';
    title: string;
    messages: string[];
    show: boolean;
  } | null>(null);

  const handleProcesarPago = (orden: OrdenPendienteType) => {
    // NUEVO: Validar antes de abrir modal
    const validation = validarMonto(orden.monto_total, 'efectivo'); // Asumir peor caso
    
    if (!validation.valid) {
      setSecurityAlert({
        type: 'error',
        title: 'Transacción Bloqueada',
        messages: validation.warnings,
        show: true
      });
      return;
    }
    
    if (validation.requiresAuth) {
      setSecurityAlert({
        type: 'warning',
        title: 'Autorización Requerida',
        messages: [
          ...validation.warnings,
          'Esta transacción requiere autorización de supervisor'
        ],
        show: true
      });
      
      // Permitir continuar con confirmación
      const confirmAuth = window.confirm(
        'Esta transacción requiere autorización. ¿Desea continuar?'
      );
      if (!confirmAuth) return;
    }

    setOrdenSeleccionada(orden);
    setModalPagoAbierto(true);
  };

const handleConfirmarPago = async (
  orden: OrdenPendienteType,
  metodoPago: any,
  montoRecibido?: number
) => {
  setProcesandoPago(true);
  try {
    const resultado = await procesarPago(orden, metodoPago, montoRecibido);
    
    if (!resultado.success) {
      // Manejar errores específicos de seguridad - usando type guard
      if ('error' in resultado && resultado.error) {
        if (resultado.error.includes('Autorización requerida')) {
          setSecurityAlert({
            type: 'warning',
            title: 'Autorización de Supervisor Necesaria',
            messages: [resultado.error],
            show: true
          });
          return resultado;
        }
        
        if (resultado.error.includes('bloqueada')) {
          setSecurityAlert({
            type: 'error',
            title: 'Transacción Bloqueada por Seguridad',
            messages: [resultado.error],
            show: true
          });
          return resultado;
        }
      }
    }

    // NUEVO: Mostrar warnings de seguridad si los hay - usando type guard
    if (resultado.success && 'securityInfo' in resultado && resultado.securityInfo?.warnings?.length > 0) {
      setSecurityAlert({
        type: 'info',
        title: 'Información de Seguridad',
        messages: resultado.securityInfo.warnings,
        show: true
      });
    }

    return resultado;
  } finally {
    setProcesandoPago(false);
  }
};

  const handleCerrarModal = () => {
    setModalPagoAbierto(false);
    setOrdenSeleccionada(null);
  };

  const handleNuevoGasto = () => {
    setModalGastoAbierto(true);
  };

  const handleConfirmarGasto = async (gasto: any) => {
    const resultado = await crearGasto(gasto);
    if (resultado.success) {
      setModalGastoAbierto(false);
      refrescar();
    }
    return resultado;
  };

  const handleCerrarModalGasto = () => {
    setModalGastoAbierto(false);
  };

  const todasLasOrdenes = [...ordenesMesas, ...ordenesDelivery];

  const getCategoriaClasses = (categoria: string) => {
    const colores: Record<string, string> = {
      proveedor: 'border-l-blue-500 bg-blue-50',
      servicios: 'border-l-green-500 bg-green-50',
      suministros: 'border-l-orange-500 bg-orange-50',
      otro: 'border-l-gray-500 bg-gray-50'
    };
    return colores[categoria] || 'border-l-gray-500 bg-gray-50';
  };

  const getCategoriaTagClasses = (categoria: string) => {
    const colores: Record<string, string> = {
      proveedor: 'bg-blue-100 text-blue-800',
      servicios: 'bg-green-100 text-green-800',
      suministros: 'bg-orange-100 text-orange-800',
      otro: 'bg-gray-100 text-gray-800'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

  // NUEVO: Componente de Dashboard de Seguridad
  const SecurityDashboard = () => {
    if (!limits) return null;
    
    const porcentajeUsado = (metricas.ventasTotales / limits.limite_diario_cajero) * 100;
    
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Límites de Seguridad</h3>
              <p className="text-xs text-gray-500">Controles automáticos</p>

          {/* Barra de acciones fija para acciones frecuentes */}
          <ActionBar
            primary={{
              label: 'Nuevo gasto',
              onClick: handleNuevoGasto,
              color: 'red',
              disabled: estadoCaja !== 'abierta',
            }}
            secondary={{
              label: loading ? 'Actualizando…' : 'Actualizar',
              onClick: refrescar,
              variant: 'outline',
              disabled: loading,
            }}
          />
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ventas del día</span>
                <span className={`font-medium ${
                  porcentajeUsado > 80 ? 'text-red-600' : 
                  porcentajeUsado > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {Math.round(porcentajeUsado)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    porcentajeUsado > 80 ? 'bg-red-500' : 
                    porcentajeUsado > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, porcentajeUsado)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatearMonto ? formatearMonto(metricas.ventasTotales) : formatCurrency(metricas.ventasTotales)}</span>
                <span>{formatearMonto ? formatearMonto(limits.limite_diario_cajero) : formatCurrency(limits.limite_diario_cajero)}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Límite por transacción:</span>
                <span>{formatearMonto ? formatearMonto(limits.limite_transaccion_normal) : formatCurrency(limits.limite_transaccion_normal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Límite efectivo:</span>
                <span>{formatearMonto ? formatearMonto(limits.limite_transaccion_efectivo) : formatCurrency(limits.limite_transaccion_efectivo)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Terminal de Caja</h1>
          <p className="text-gray-600">Sistema de punto de venta</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
            disabled
          >
            <span className="mr-2">🏪</span>
            Abrir caja
          </Button>
          <Button
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            disabled
          >
            <span className="mr-2">💵</span>
            Nueva venta
          </Button>
          <Button
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            onClick={handleNuevoGasto}
            disabled={estadoCaja !== 'abierta'}
          >
            <span className="mr-2">📊</span>
            Nuevo gasto
          </Button>
        </div>
      </div>

      {/* CONTROLES DE CAJA INTEGRADOS */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="py-4">
          <ControlesCaja />
        </CardContent>
      </Card>

      {/* NUEVA: Alerta de seguridad global */}
      {securityAlert?.show && (
        <SecurityAlert
          type={securityAlert.type}
          title={securityAlert.title}
          messages={securityAlert.messages}
          onDismiss={() => setSecurityAlert(null)}
        />
      )}

      {estadoCaja === 'cerrada' && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-50">🏪</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Caja Cerrada
              </h3>
              <p className="text-gray-600 mb-6">
                Abre la caja para comenzar a procesar pagos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {estadoCaja === 'abierta' && (
        <>
          {/* PESTAÑAS PRINCIPALES */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            <Button
              variant={tabActiva === 'movimientos' ? 'default' : 'ghost'}
              onClick={() => setTabActiva('movimientos')}
              className={tabActiva === 'movimientos' ? 'bg-white shadow-sm' : ''}
            >
              <span className="mr-2">💰</span>
              Movimientos
            </Button>
            <Button
              variant={tabActiva === 'arqueo' ? 'default' : 'ghost'}
              onClick={() => setTabActiva('arqueo')}
              className={tabActiva === 'arqueo' ? 'bg-white shadow-sm' : ''}
            >
              <span className="mr-2">🧮</span>
              Arqueo
            </Button>
            <Button
              variant={tabActiva === 'reportes' ? 'default' : 'ghost'}
              onClick={() => setTabActiva('reportes')}
              className={tabActiva === 'reportes' ? 'bg-white shadow-sm' : ''}
            >
              <span className="mr-2">📊</span>
              Reportes
            </Button>
          </div>

          {/* FILTROS Y BÚSQUEDA */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <span className="mr-2">🔍</span>
                  Filtrar
                </Button>
                
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={filtroTiempo}
                  onChange={(e) => setFiltroTiempo(e.target.value)}
                >
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                </select>

                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="w-40"
                />

                <div className="flex-1">
                  <Input
                    placeholder="🔍 Buscar concepto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button variant="outline" size="sm" onClick={refrescar} disabled={loading}>
                  {loading ? '🔄' : '↻'} Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* MÉTRICAS EN TIEMPO REAL + SEGURIDAD */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="value-number text-gray-900">
                      {formatCurrency(metricas.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ventas del día</p>
                    <p className="value-number text-green-600">
                      {formatCurrency(metricas.ventasTotales)}
                    </p>
                    {metricas.transaccionesDelDia.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          💵 {formatCurrency(metricas.totalEfectivo)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          💳 {formatCurrency(metricas.totalTarjeta)}
                        </span>
                        {metricas.totalDigital > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                            📱 {formatCurrency(metricas.totalDigital)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🟡</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Por cobrar</p>
                    <p className="value-number text-orange-600">
                      {formatCurrency(metricas.porCobrar)}
                    </p>
                    {totalOrdenesPendientes > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {totalOrdenesPendientes} órdenes pendientes
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gastos del día</p>
                    <p className="value-number text-red-600">
                      {formatCurrency(metricas.gastosTotales)}
                    </p>
                    {gastos.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {gastos.length} gastos registrados
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NUEVO: Dashboard de Seguridad */}
            <SecurityDashboard />
          </div>

          {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
          <Card>
            <CardContent className="p-6">
              {tabActiva === 'movimientos' && (
                <div className="space-y-4">
                  {/* Sub-pestañas de movimientos */}
                  <div className="flex space-x-1 bg-gray-50 rounded-lg p-1 w-fit">
                    <Button
                      variant={subTabMovimientos === 'por_cobrar' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSubTabMovimientos('por_cobrar')}
                      className={subTabMovimientos === 'por_cobrar' ? 'bg-white shadow-sm' : ''}
                    >
                      Por cobrar
                      {totalOrdenesPendientes > 0 && (
                        <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {totalOrdenesPendientes}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant={subTabMovimientos === 'ingresos' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSubTabMovimientos('ingresos')}
                      className={subTabMovimientos === 'ingresos' ? 'bg-white shadow-sm' : ''}
                    >
                      Ingresos
                    </Button>
                    <Button
                      variant={subTabMovimientos === 'egresos' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSubTabMovimientos('egresos')}
                      className={subTabMovimientos === 'egresos' ? 'bg-white shadow-sm' : ''}
                    >
                      Egresos
                      {gastos.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {gastos.length}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Contenido de movimientos */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {subTabMovimientos === 'por_cobrar' && (
                      <>
                        {loading && todasLasOrdenes.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              <span>Cargando órdenes...</span>
                            </div>
                          </div>
                        ) : todasLasOrdenes.length === 0 ? (
                          <OrdenesVacias tipo="ambos" />
                        ) : (
                          todasLasOrdenes.map((orden) => {
                            // NUEVO: Validar cada orden para mostrar indicadores
                            const validation = validarMonto ? validarMonto(orden.monto_total, 'efectivo') : { valid: true, warnings: [], requiresAuth: false };
                            const isHighValue = validation.requiresAuth;
                            const isBlocked = !validation.valid;
                            
                            return (
                              <div
                                key={orden.id}
                                className={`
                                  border rounded-lg p-4 hover:shadow-sm transition-shadow
                                  ${isBlocked ? 'border-red-300 bg-red-50' : ''}
                                  ${isHighValue && !isBlocked ? 'border-yellow-300 bg-yellow-50' : ''}
                                  ${!isBlocked && !isHighValue ? 'border-gray-200 bg-white' : ''}
                                `}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-lg">
                                        {orden.tipo === 'mesa' ? '🍽️' : '🚚'}
                                      </span>
                                      <h5 className="font-medium text-gray-900">{orden.identificador}</h5>
                                      
                                      {/* NUEVOS: Iconos de seguridad */}
                                      {isBlocked && (
                                        <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full">
                                          🚫 BLOQUEADO
                                        </span>
                                      )}
                                      {isHighValue && !isBlocked && (
                                        <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded-full">
                                          ⚠️ REQ. AUTH
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="value-number text-gray-900 mb-1">
                                      {formatCurrency(orden.monto_total)}
                                    </div>
                                    
                                    <div className="text-xs text-gray-500">
                                      ⏰ {new Date(orden.fecha_creacion).toLocaleTimeString('es-CO', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                      {orden.detalles && (
                                        <span className="ml-2">• {orden.detalles}</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleProcesarPago(orden)}
                                    disabled={isBlocked || procesandoPago}
                                    className={`
                                      ${isBlocked 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : isHighValue
                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }
                                    `}
                                    size="sm"
                                  >
                                    {isBlocked ? 'Bloqueado' : 'Procesar'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </>
                    )}

                    {subTabMovimientos === 'ingresos' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">✅</span>
                            <h4 className="font-medium">Ingresos procesados hoy</h4>
                            <span className="text-sm text-gray-500">
                              ({metricas.transaccionesDelDia.length} transacciones)
                            </span>
                          </div>
                        </div>

                        {metricas.transaccionesDelDia.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <span className="text-4xl mb-4 block">✅</span>
                            <h4 className="font-medium mb-2">No hay ingresos hoy</h4>
                            <p className="text-sm">
                              Los pagos que proceses aparecerán aquí
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {metricas.transaccionesDelDia.map((transaccion) => (
                              <div
                                key={transaccion.id}
                                className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow border-l-4 border-l-green-500"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-lg">
                                        {transaccion.tipo_orden === 'mesa' ? '🍽️' : '🚚'}
                                      </span>
                                      <h5 className="font-medium text-gray-900">
                                        {transaccion.tipo_orden === 'mesa' ? 'Mesa' : 'Delivery'} - {transaccion.orden_id.slice(-8)}
                                      </h5>
                                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        {transaccion.metodo_pago}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>
                                        ⏰ {new Date(transaccion.procesada_at).toLocaleTimeString('es-CO', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      {transaccion.monto_cambio > 0 && (
                                        <span>💰 Cambio: {formatCurrency(transaccion.monto_cambio)}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="value-number text-green-600">
                                      +{formatCurrency(transaccion.monto_total)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {subTabMovimientos === 'egresos' && (
                      <div className="space-y-3">
                        {/* Header de egresos */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">💸</span>
                            <h4 className="font-medium">Gastos registrados hoy</h4>
                            <span className="text-sm text-gray-500">
                              ({gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'})
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNuevoGasto}
                            disabled={estadoCaja !== 'abierta'}
                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          >
                            <span className="mr-1">+</span>
                            Nuevo Gasto
                          </Button>
                        </div>

                        {/* Resumen por categorías */}
                        {metricas.gastosTotales > 0 && (
                          <div className="bg-red-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-red-800">
                                Total gastado hoy
                              </span>
                              <span className="font-bold text-red-900">
                                {formatCurrency(metricas.gastosTotales)}
                              </span>
                            </div>
                            
                            {/* Desglose por categorías si hay gastos */}
                            {gastos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.entries({
                                  proveedor: gastos.filter(g => g.categoria === 'proveedor').reduce((sum, g) => sum + g.monto, 0),
                                  servicios: gastos.filter(g => g.categoria === 'servicios').reduce((sum, g) => sum + g.monto, 0),
                                  suministros: gastos.filter(g => g.categoria === 'suministros').reduce((sum, g) => sum + g.monto, 0),
                                  otro: gastos.filter(g => g.categoria === 'otro').reduce((sum, g) => sum + g.monto, 0)
                                }).filter(([_, monto]) => monto > 0).map(([categoria, monto]) => (
                                  <div key={categoria} className="flex items-center space-x-1 text-xs">
                                    <span>{getIconoCategoria(categoria as any)}</span>
                                    <span className="capitalize">{categoria}:</span>
                                    <span className="font-semibold">{formatCurrency(monto)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Lista de gastos */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {loadingGastos && gastos.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center space-x-2 text-gray-500">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                                <span>Cargando gastos...</span>
                              </div>
                            </div>
                          ) : gastos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <span className="text-4xl mb-4 block">💸</span>
                              <h4 className="font-medium mb-2">No hay gastos registrados</h4>
                              <p className="text-sm mb-4">
                                Los gastos que registres aparecerán aquí
                              </p>
                              <Button
                                variant="outline"
                                onClick={handleNuevoGasto}
                                disabled={estadoCaja !== 'abierta'}
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              >
                                <span className="mr-2">💸</span>
                                Registrar primer gasto
                              </Button>
                            </div>
                          ) : (
                            gastos.map((gasto) => (
                              <div
                                key={gasto.id}
                                className={`bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow border-l-4 ${getCategoriaClasses(gasto.categoria)}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-lg">{getIconoCategoria(gasto.categoria)}</span>
                                      <h5 className="font-medium text-gray-900">{gasto.concepto}</h5>
                                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoriaTagClasses(gasto.categoria)}`}>
                                        {gasto.categoria}
                                      </span>
                                    </div>
                                    
                                    {gasto.notas && (
                                      <p className="text-sm text-gray-600 mb-2">{gasto.notas}</p>
                                    )}
                                    
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>
                                        ⏰ {new Date(gasto.registrado_at).toLocaleTimeString('es-CO', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      <span>ID: {gasto.id.slice(-8)}</span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="value-number text-red-600">
                                      -{formatCurrency(gasto.monto)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tabActiva === 'arqueo' && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🧮</span>
                  <h3 className="heading-section mb-2">Arqueo de Caja</h3>
                  <p>Resumen y cierre del día</p>
                  <p className="text-sm">Próximamente disponible</p>
                </div>
              )}

              {tabActiva === 'reportes' && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📊</span>
                  <h3 className="heading-section mb-2">Reportes y Estadísticas</h3>
                  <p>Análisis de ventas y rendimiento</p>
                  <p className="text-sm">Próximamente disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Modal de procesamiento de pago */}
      <ModalProcesarPago
        orden={ordenSeleccionada}
        isOpen={modalPagoAbierto}
        onClose={handleCerrarModal}
        onConfirmar={handleConfirmarPago}
        loading={procesandoPago}
      />

      {/* Slide-over de nuevo gasto */}
      <GastoWizardSlideOver
        isOpen={modalGastoAbierto}
        onClose={handleCerrarModalGasto}
        onConfirmar={handleConfirmarGasto}
        loading={loadingGastos}
      />
    </div>
  );
};