// src/app/dashboard/facturacion/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Eye,
  Ban
} from 'lucide-react';

import { Tabs } from '@spoon/shared';
// Importar funciones de supabase
import { 
  getUserProfile, 
  getTransaccionesDelDia, 
  buscarFacturas
} from '@spoon/shared/lib/supabase';

// Función de formateo simple y directa
const formatearMonto = (centavos: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(centavos / 100);
};

// Tipos
interface EstadisticasRapidas {
  facturasHoy: number;
  ventasHoy: number;
  transaccionesHoy: number;
  facturasPendientes: number;
}

interface Factura {
  id: string;
  numero_factura: string;
  cliente_nombre: string;
  total: number;
  metodo_pago: string;
  estado: 'emitida' | 'anulada';
  generada_at: string;
}

export default function SistemaFacturacion() {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'dashboard' | 'facturas' | 'reportes'>('dashboard');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de datos
  const [estadisticas, setEstadisticas] = useState<EstadisticasRapidas>({
    facturasHoy: 0,
    ventasHoy: 0,
    transaccionesHoy: 0,
    facturasPendientes: 0
  });
  const [facturas, setFacturas] = useState<Factura[]>([]);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    numeroFactura: '',
    clienteNombre: '',
    estado: '' as 'emitida' | 'anulada' | ''
  });

  // Obtener información inicial
  useEffect(() => {
    const inicializar = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener perfil del usuario
        const profile = await getUserProfile();
        if (!profile?.restaurant_id) {
          throw new Error('No se encontró información del restaurante');
        }

        setRestaurantId(profile.restaurant_id);
        await cargarDatos(profile.restaurant_id);
      } catch (err) {
        console.error('Error inicializando:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    inicializar();
  }, []);

  // Cargar datos del restaurante
  const cargarDatos = async (restaurantId: string) => {
    try {
      // Cargar estadísticas rápidas del día
      const hoy = new Date().toISOString().split('T')[0];
      const { transacciones } = await getTransaccionesDelDia(restaurantId, hoy);
      
      // Cargar facturas recientes
      const { data: facturasData, error: facturasError } = await buscarFacturas(restaurantId, {
        fechaInicio: hoy,
        fechaFin: hoy,
        limite: 20
      });

      if (facturasError) {
        console.error('Error cargando facturas:', facturasError);
      }

      // Calcular estadísticas
      setEstadisticas({
        transaccionesHoy: transacciones.length,
        ventasHoy: transacciones.reduce((sum, t) => sum + t.monto_total, 0),
        facturasHoy: facturasData?.length || 0,
        facturasPendientes: transacciones.length - (facturasData?.length || 0)
      });

      setFacturas(facturasData || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  // Buscar facturas con filtros
  const buscarConFiltros = async () => {
    if (!restaurantId) return;

    try {
      const { data, error } = await buscarFacturas(restaurantId, {
        ...filtros,
        estado: filtros.estado || undefined
      });
      
      if (error) {
        console.error('Error en consulta:', error);
        return;
      }
      
      setFacturas(data || []);
    } catch (err) {
      console.error('Error buscando facturas:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema de facturación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error del Sistema</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Recargar Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="heading-page">Sistema de Facturación</h1>
                <p className="text-sm text-gray-500">Gestión completa de facturas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Facturas hoy</p>
                <p className="font-semibold">{estadisticas.facturasHoy}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ventas hoy</p>
                <p className="font-semibold text-green-600">
                  {formatearMonto(estadisticas.ventasHoy)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            className=""
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            items={[
              { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'facturas', label: 'Facturas', icon: <FileText className="w-4 h-4" /> },
              { id: 'reportes', label: 'Reportes', icon: <Calendar className="w-4 h-4" /> }
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Facturas Hoy</p>
                    <p className="value-number">{estadisticas.facturasHoy}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ventas Hoy</p>
                    <p className="value-number text-green-600">
                      {formatearMonto(estadisticas.ventasHoy)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transacciones</p>
                    <p className="value-number">{estadisticas.transaccionesHoy}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="value-number text-orange-600">
                      {estadisticas.facturasPendientes}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Facturas Recientes */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="heading-section">Facturas Recientes</h3>
                  <button
                    onClick={() => setActiveTab('facturas')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver todas →
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {facturas.slice(0, 5).map(factura => (
                      <tr key={factura.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium">
                            {factura.numero_factura}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {factura.cliente_nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">
                            {formatearMonto(factura.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            factura.estado === 'emitida' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {factura.estado === 'emitida' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {factura.estado === 'anulada' && <Ban className="w-3 h-3 mr-1" />}
                            {factura.estado === 'emitida' ? 'Emitida' : 'Anulada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(factura.generada_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {facturas.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay facturas registradas hoy</p>
                    <p className="text-sm text-gray-500">Las facturas aparecerán aquí cuando se generen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facturas' && (
          <div className="space-y-6">
            {/* Filtros de Búsqueda */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Filtros de Búsqueda</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="FACT000001"
                    value={filtros.numeroFactura}
                    onChange={(e) => setFiltros(prev => ({ ...prev, numeroFactura: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={filtros.clienteNombre}
                    onChange={(e) => setFiltros(prev => ({ ...prev, clienteNombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="emitida">Emitida</option>
                    <option value="anulada">Anulada</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={buscarConFiltros}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Facturas */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="heading-section">Facturas ({facturas.length})</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {facturas.map(factura => (
                      <tr key={factura.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium">
                            {factura.numero_factura}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {factura.cliente_nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">
                            {formatearMonto(factura.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 capitalize">
                            {factura.metodo_pago}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            factura.estado === 'emitida' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {factura.estado === 'emitida' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {factura.estado === 'anulada' && <Ban className="w-3 h-3 mr-1" />}
                            {factura.estado === 'emitida' ? 'Emitida' : 'Anulada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(factura.generada_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-700">
                              <Download className="w-4 h-4" />
                            </button>
                            {factura.estado === 'emitida' && (
                              <button className="text-red-600 hover:text-red-700">
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {facturas.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron facturas</p>
                    <p className="text-sm text-gray-500">Ajusta los filtros de búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="heading-section mb-4">Reportes de Facturación</h3>
            <p className="text-gray-600">
              Los reportes detallados estarán disponibles próximamente. 
              Por ahora, puedes usar el dashboard para ver estadísticas básicas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}