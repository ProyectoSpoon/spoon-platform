/**
 * Componente principal para reportes del sistema de caja
 * Reporte diario/turno completo con ingresos, egresos y arqueo
 */

import React, { useState, useEffect } from 'react';
import { useCajaSesion } from '../hooks/useCajaSesion';
import { DashboardCaja, ConciliacionRealizada, ResumenDiferencias, TransaccionSesion } from '../hooks/useCajaReportes';
import { Loader2, Download, TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle, Calculator, Receipt, CreditCard, Banknote } from 'lucide-react';
import { getUserProfile, supabase } from '@spoon/shared/lib/supabase';

export const ReportesCaja: React.FC = () => {
  const { reportes } = useCajaSesion();
  const [reporteDiario, setReporteDiario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('dia_completo');

  useEffect(() => {
    cargarReporteDiario();
  }, [fechaSeleccionada, turnoSeleccionado]);

  const cargarReporteDiario = async () => {
    try {
      setLoading(true);

      // Obtener restaurant_id del usuario actual
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) {
        throw new Error('Usuario no tiene restaurante asignado');
      }

      // Llamar a la función SQL para obtener datos reales
      const { data, error } = await supabase.rpc('reporte_diario_caja', {
        p_restaurant_id: profile.restaurant_id,
        p_fecha: fechaSeleccionada,
        p_turno: turnoSeleccionado
      });

      if (error) throw error;

      // Transformar los datos del formato SQL al formato esperado por el componente
      const datosTransformados = {
        informacion_basica: {
          fecha: data.informacion_basica.fecha,
          turno: data.informacion_basica.turno,
          cajero: data.informacion_basica.cajero,
          folio: data.informacion_basica.folio,
          hora_generacion: data.informacion_basica.hora_generacion
        },
        ingresos: {
          metodos_pago: {
            efectivo: data.ingresos.efectivo || 0,
            tarjeta_debito: data.ingresos.tarjeta_debito || 0,
            tarjeta_credito: data.ingresos.tarjeta_credito || 0,
            transferencias: data.ingresos.transferencias || 0,
            vales_comida: data.ingresos.vales_comida || 0,
            apps_delivery: data.ingresos.apps_delivery || 0
          },
          desglose_ventas: {
            total_ordenes: data.ingresos.desglose_ventas.total_ordenes || 0,
            ticket_promedio: data.ingresos.desglose_ventas.ticket_promedio || 0,
            propinas_recibidas: data.ingresos.desglose_ventas.propinas_recibidas || 0
          }
        },
        egresos: {
          compras_menores: data.egresos.compras_menores || 0,
          gastos_operacion: data.egresos.gastos_operacion || 0,
          propinas_pagadas: data.egresos.propinas_pagadas || 0,
          cambio_entregado: data.egresos.cambio_entregado || 0,
          devoluciones: data.egresos.devoluciones || 0
        },
        resumen_caja: {
          saldo_inicial: data.resumen_caja.saldo_inicial || 0,
          total_ingresos: data.resumen_caja.total_ingresos || 0,
          total_egresos: data.resumen_caja.total_egresos || 0,
          saldo_teorico: data.resumen_caja.saldo_teorico || 0,
          conteo_fisico: data.resumen_caja.conteo_fisico || {
            efectivo_caja: 0,
            comprobantes_tarjetas: 0,
            otros_comprobantes: 0,
            total_fisico: 0
          },
          diferencia: data.resumen_caja.diferencia || 0
        }
      };

      setReporteDiario(datosTransformados);
    } catch (error) {
      console.error('Error cargando reporte diario:', error);
      // En caso de error, mostrar datos vacíos
      setReporteDiario({
        informacion_basica: {
          fecha: fechaSeleccionada,
          turno: turnoSeleccionado,
          cajero: 'No disponible',
          folio: 'N/A',
          hora_generacion: new Date().toLocaleTimeString()
        },
        ingresos: {
          metodos_pago: {
            efectivo: 0,
            tarjeta_debito: 0,
            tarjeta_credito: 0,
            transferencias: 0,
            vales_comida: 0,
            apps_delivery: 0
          },
          desglose_ventas: {
            total_ordenes: 0,
            ticket_promedio: 0,
            propinas_recibidas: 0
          }
        },
        egresos: {
          compras_menores: 0,
          gastos_operacion: 0,
          propinas_pagadas: 0,
          cambio_entregado: 0,
          devoluciones: 0
        },
        resumen_caja: {
          saldo_inicial: 0,
          total_ingresos: 0,
          total_egresos: 0,
          saldo_teorico: 0,
          conteo_fisico: {
            efectivo_caja: 0,
            comprobantes_tarjetas: 0,
            otros_comprobantes: 0,
            total_fisico: 0
          },
          diferencia: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = () => {
    // Lógica para exportar el reporte
    console.log('Exportando reporte diario...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reporte diario...</span>
      </div>
    );
  }

  if (!reporteDiario) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se pudo cargar el reporte diario
      </div>
    );
  }

  const { informacion_basica, ingresos, egresos, resumen_caja } = reporteDiario;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporte Diario de Caja</h1>
          <p className="text-gray-600 mt-1">
            Resumen completo del movimiento de caja del día/turno
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportarReporte}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
            <select
              value={turnoSeleccionado}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dia_completo">Día Completo</option>
              <option value="desayuno">Desayuno (6:00 - 12:00)</option>
              <option value="almuerzo">Almuerzo (12:00 - 18:00)</option>
              <option value="cena">Cena (18:00 - 24:00)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={cargarReporteDiario}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
            >
              Actualizar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Información Básica */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-600" />
            Información Básica
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="text-lg font-semibold">{new Date(informacion_basica.fecha).toLocaleDateString('es-CO')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Turno</p>
              <p className="text-lg font-semibold capitalize">{informacion_basica.turno.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cajero</p>
              <p className="text-lg font-semibold">{informacion_basica.cajero}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Folio</p>
              <p className="text-lg font-semibold text-blue-600">{informacion_basica.folio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingresos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Ingresos (Entradas)
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Ventas por método de pago */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas por Método de Pago</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium">Efectivo</span>
                </div>
                <span className="text-lg font-bold text-green-600">${ingresos.metodos_pago.efectivo.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">Tarjeta Débito</span>
                </div>
                <span className="text-lg font-bold text-blue-600">${ingresos.metodos_pago.tarjeta_debito.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium">Tarjeta Crédito</span>
                </div>
                <span className="text-lg font-bold text-purple-600">${ingresos.metodos_pago.tarjeta_credito.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-sm font-medium">Transferencias</span>
                </div>
                <span className="text-lg font-bold text-orange-600">${ingresos.metodos_pago.transferencias.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2 text-yellow-600" />
                  <span className="text-sm font-medium">Vale de Comida</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">${ingresos.metodos_pago.vales_comida.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm font-medium">Apps Delivery</span>
                </div>
                <span className="text-lg font-bold text-indigo-600">${ingresos.metodos_pago.apps_delivery.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Desglose de ventas */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Desglose de Ventas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{ingresos.desglose_ventas.total_ordenes}</p>
                <p className="text-sm text-gray-600">Total de Órdenes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">${ingresos.desglose_ventas.ticket_promedio.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Ticket Promedio</p>
              </div>
              {/* Propinas eliminadas - no existen en BD */}
            </div>
          </div>
        </div>
      </div>

      {/* Egresos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
            Egresos (Salidas)
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium">Compras menores</span>
              <span className="text-lg font-bold text-red-600">-${egresos.compras_menores.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium">Gastos de operación</span>
              <span className="text-lg font-bold text-red-600">-${egresos.gastos_operacion.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium">Propinas pagadas</span>
              <span className="text-lg font-bold text-red-600">-${egresos.propinas_pagadas.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium">Cambio entregado</span>
              <span className="text-lg font-bold text-red-600">-${egresos.cambio_entregado.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium">Devoluciones</span>
              <span className="text-lg font-bold text-red-600">-${egresos.devoluciones.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Caja */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
            Resumen de Caja
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Cálculo del saldo teórico */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cálculo del Saldo Teórico</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>Saldo inicial:</span>
                <span className="font-semibold">${resumen_caja.saldo_inicial.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>+ Total ingresos:</span>
                <span className="font-semibold">${resumen_caja.total_ingresos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Total egresos:</span>
                <span className="font-semibold">${resumen_caja.total_egresos.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold">
                <span>= Saldo teórico:</span>
                <span className="text-blue-600">${resumen_caja.saldo_teorico.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Conteo físico vs teórico */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conteo Físico vs Teórico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conteo Físico */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Conteo Físico Realizado</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Efectivo en caja:</span>
                    <span className="font-semibold">${resumen_caja.conteo_fisico.efectivo_caja.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Comprobantes tarjetas:</span>
                    <span className="font-semibold">${resumen_caja.conteo_fisico.comprobantes_tarjetas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Otros comprobantes:</span>
                    <span className="font-semibold">${resumen_caja.conteo_fisico.otros_comprobantes.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>= Total físico:</span>
                    <span className="text-green-600">${resumen_caja.conteo_fisico.total_fisico.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Comparación */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Resultado de Conciliación</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Saldo teórico:</span>
                    <span className="font-semibold">${resumen_caja.saldo_teorico.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total físico:</span>
                    <span className="font-semibold">${resumen_caja.conteo_fisico.total_fisico.toLocaleString()}</span>
                  </div>
                  <div className={`border-t-2 pt-2 flex justify-between text-xl font-bold ${
                    resumen_caja.diferencia === 0
                      ? 'text-green-600'
                      : resumen_caja.diferencia > 0
                        ? 'text-blue-600'
                        : 'text-red-600'
                  }`}>
                    <span>DIFERENCIA:</span>
                    <span>
                      {resumen_caja.diferencia === 0
                        ? '$0 ✅'
                        : resumen_caja.diferencia > 0
                          ? `+$${resumen_caja.diferencia.toLocaleString()} (Sobrante)`
                          : `-$${Math.abs(resumen_caja.diferencia).toLocaleString()} (Faltante)`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el Dashboard
const DashboardTab: React.FC<{ dashboard: DashboardCaja }> = ({ dashboard }) => {
  const { metricas_principales, diferencias, porcentajes } = dashboard;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Métricas Principales */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Conciliaciones</h3>
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{metricas_principales.total_conciliaciones}</div>
            <p className="text-xs text-gray-500">
              Últimos {dashboard.periodo_dias} días
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Tasa de Conciliación</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{porcentajes.tasa_conciliacion}%</div>
            <p className="text-xs text-gray-500">
              Sesiones conciliadas
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Balance Neto</h3>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${diferencias.balance_neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(diferencias.balance_neto).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {diferencias.balance_neto >= 0 ? 'Sobrante' : 'Faltante'} neto
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Sesiones Auto-cerradas</h3>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{metricas_principales.sesiones_auto_cerradas}</div>
            <p className="text-xs text-gray-500">
              Pendientes: {metricas_principales.conciliaciones_pendientes}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {metricas_principales.conciliaciones_pendientes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Hay {metricas_principales.conciliaciones_pendientes} sesiones cerradas automáticamente
                que requieren conciliación física antes de poder abrir nuevas cajas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para Conciliaciones
const ConciliacionesTab: React.FC<{ conciliaciones: ConciliacionRealizada[] }> = ({ conciliaciones }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Conciliaciones Realizadas</h2>
        <p className="text-sm text-gray-600">
          Historial completo de conciliaciones físicas realizadas
        </p>
      </div>
      <div className="p-6">
        {conciliaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay conciliaciones realizadas en el período seleccionado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sesión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Calculado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Real
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Justificación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conciliaciones.map((conciliacion, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(conciliacion.fecha_conciliacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {conciliacion.sesion_id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${conciliacion.saldo_calculado.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${conciliacion.saldo_fisico_real.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conciliacion.diferencia >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        ${Math.abs(conciliacion.diferencia).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conciliacion.tipo_diferencia === 'Sobrante'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conciliacion.tipo_diferencia}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={conciliacion.justificacion}>
                      {conciliacion.justificacion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para Análisis
const AnalisisTab: React.FC<{ resumenDiferencias: ResumenDiferencias[] }> = ({ resumenDiferencias }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Análisis de Diferencias por Mes</h2>
          <p className="text-sm text-gray-600">
            Tendencias de sobrantes y faltantes en el tiempo
          </p>
        </div>
        <div className="p-6">
          {resumenDiferencias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay datos de diferencias para analizar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conciliaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sobrantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faltantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Sobrantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Faltantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Conciliado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resumenDiferencias.map((resumen, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resumen.periodo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resumen.total_conciliaciones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resumen.total_sobrantes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resumen.total_faltantes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ${resumen.monto_total_sobrantes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ${resumen.monto_total_faltantes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {resumen.porcentaje_conciliado}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para Arqueo de Caja
const ArqueoTab: React.FC<{
  conciliaciones: ConciliacionRealizada[];
  arqueoSesion: TransaccionSesion[];
  sesionSeleccionada: string;
  loadingArqueo: boolean;
  onCargarArqueo: (sesionId: string) => void;
  onExportarArqueo: () => void;
}> = ({
  conciliaciones,
  arqueoSesion,
  sesionSeleccionada,
  loadingArqueo,
  onCargarArqueo,
  onExportarArqueo
}) => {
  // Calcular totales del arqueo
  const totales = arqueoSesion.reduce(
    (acc, transaccion) => {
      if (transaccion.tipo_movimiento === 'Ingreso') {
        acc.ingresos += transaccion.monto;
      } else {
        acc.egresos += Math.abs(transaccion.monto);
      }
      return acc;
    },
    { ingresos: 0, egresos: 0 }
  );

  const balance = totales.ingresos - totales.egresos;

  return (
    <div className="space-y-6">
      {/* Selector de sesión */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Seleccionar Sesión:</label>
            <select
              value={sesionSeleccionada}
              onChange={(e) => onCargarArqueo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 min-w-64"
            >
              <option value="">Selecciona una sesión conciliada...</option>
              {conciliaciones.map((conciliacion) => (
                <option key={conciliacion.sesion_id} value={conciliacion.sesion_id}>
                  {new Date(conciliacion.fecha_conciliacion).toLocaleDateString()} - Sesión {conciliacion.sesion_id.slice(-8)}
                </option>
              ))}
            </select>
          </div>

          {sesionSeleccionada && (
            <button
              onClick={onExportarArqueo}
              disabled={arqueoSesion.length === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Arqueo
            </button>
          )}
        </div>
      </div>

      {/* Mostrar arqueo si hay sesión seleccionada */}
      {sesionSeleccionada && (
        <div className="space-y-6">
          {/* Resumen del arqueo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Total Ingresos</h3>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-600">
                  ${totales.ingresos.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  Ventas en efectivo
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Total Egresos</h3>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-red-600">
                  ${totales.egresos.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  Gastos y ajustes
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Balance Final</h3>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(balance).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla detallada del arqueo */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Arqueo de Caja - Sesión {sesionSeleccionada.slice(-8)}
              </h2>
              <p className="text-sm text-gray-600">
                Detalle completo de ingresos y egresos de la sesión
              </p>
            </div>
            <div className="p-6">
              {loadingArqueo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando arqueo...</span>
                </div>
              ) : arqueoSesion.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay transacciones para esta sesión
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {arqueoSesion.map((transaccion, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaccion.fecha_hora).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaccion.tipo_movimiento === 'Ingreso'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaccion.tipo_movimiento}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={transaccion.descripcion}>
                            {transaccion.descripcion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaccion.metodo_pago}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaccion.categoria || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={transaccion.tipo_movimiento === 'Ingreso' ? 'text-green-600' : 'text-red-600'}>
                              {transaccion.tipo_movimiento === 'Ingreso' ? '+' : '-'}${Math.abs(transaccion.monto).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          Total Ingresos:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                          +${totales.ingresos.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          Total Egresos:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">
                          -${totales.egresos.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={5} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          Balance Final:
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                          balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {balance >= 0 ? '+' : '-'}${Math.abs(balance).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje inicial */}
      {!sesionSeleccionada && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Arqueo de Caja Detallado
          </h3>
          <p className="text-blue-700">
            Selecciona una sesión conciliada del dropdown superior para ver el detalle completo
            de todos los ingresos y egresos de esa sesión de caja.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportesCaja;
