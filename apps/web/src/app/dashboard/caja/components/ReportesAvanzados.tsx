"use client";

// packages/shared/caja/components/ReportesAvanzados.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';

// Importar funciones de supabase
import { getReportesVentas, getUserProfile } from '@spoon/shared/lib/supabase';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

// Usar helper compartido de moneda
const formatearMonto = (centavos: number): string => formatCurrencyCOP(centavos);

interface EstadisticasReporte {
  totalVentas: number;
  totalTransacciones: number;
  ventasPorMetodo: Record<string, number>;
  ventasPorDia: Record<string, number>;
  ventasPorHora: Record<number, number>;
}

export function ReportesAvanzados() {
  const [periodo, setPeriodo] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  });
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Obtener restaurant ID del usuario actual
  useEffect(() => {
    const obtenerRestaurantId = async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.restaurant_id) {
          setRestaurantId(profile.restaurant_id);
        } else {
          setError('No se encontró información del restaurante');
        }
      } catch (err) {
        console.error('Error obteniendo perfil:', err);
        setError('Error cargando información del usuario');
      }
    };

    obtenerRestaurantId();
  }, []);
  
  const cargarReportes = async () => {
    if (!restaurantId) {
      setError('ID de restaurante no disponible');
      return;
    }

    setCargando(true);
    setError(null);
    
    try {
      if (process.env.NODE_ENV !== 'production') {
        // Debug no-ops en producción
        console.log('🔍 Cargando reportes para:', { restaurantId, periodo });
      }
      
      const { data, error: reporteError } = await getReportesVentas(restaurantId, periodo);
      
      if (reporteError) {
        throw reporteError;
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📊 Datos de reporte recibidos:', data);
      }
      setEstadisticas(data);
      
    } catch (err) {
      console.error('❌ Error cargando reportes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido cargando reportes');
    } finally {
      setCargando(false);
    }
  };
  
  // Cargar reportes cuando cambie el período o se obtenga el restaurant ID
  useEffect(() => {
    if (restaurantId) {
      cargarReportes();
    }
  }, [periodo, restaurantId]);
  
  const handleFechaChange = (campo: 'fechaInicio' | 'fechaFin', valor: string) => {
    setPeriodo(prev => ({ 
      ...prev, 
      [campo]: valor 
    }));
  };
  
  if (!restaurantId && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-medium mb-2">Error cargando reportes</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
  
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filtros de período */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Período de Análisis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={periodo.fechaInicio}
              onChange={(e) => handleFechaChange('fechaInicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={periodo.fechaFin}
              onChange={(e) => handleFechaChange('fechaFin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {estadisticas ? (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Ventas Totales</h4>
              </div>
              <p className="value-number text-green-600">
                {formatearMonto(estadisticas.totalVentas)}
              </p>
              <p className="text-sm text-gray-500">
                {estadisticas.totalTransacciones} transacciones
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Promedio por Venta</h4>
              </div>
              <p className="value-number text-blue-600">
                {estadisticas.totalTransacciones > 0 
                  ? formatearMonto(Math.round(estadisticas.totalVentas / estadisticas.totalTransacciones))
                  : formatearMonto(0)
                }
              </p>
              <p className="text-sm text-gray-500">Por transacción</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Hora Pico</h4>
              </div>
              <p className="value-number text-purple-600">
                {Object.entries(estadisticas.ventasPorHora || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
                {Object.keys(estadisticas.ventasPorHora || {}).length > 0 ? ':00' : ''}
              </p>
              <p className="text-sm text-gray-500">Mayor volumen de ventas</p>
            </div>
          </div>
          
          {/* Gráficos de ventas por método */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-4">Ventas por Método de Pago</h4>
            {Object.keys(estadisticas.ventasPorMetodo || {}).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(estadisticas.ventasPorMetodo).map(([metodo, monto]) => {
                  const porcentaje = estadisticas.totalVentas > 0 
                    ? ((monto as number) / estadisticas.totalVentas) * 100 
                    : 0;
                    
                  return (
                    <div key={metodo} className="flex justify-between items-center">
                      <span className="capitalize font-medium">{metodo}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm w-20 text-right">
                          {formatearMonto(monto as number)}
                        </span>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {porcentaje.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay datos de métodos de pago para este período</p>
              </div>
            )}
          </div>

          {/* Ventas por día */}
          {Object.keys(estadisticas.ventasPorDia || {}).length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-4">Ventas por Día</h4>
              <div className="space-y-2">
                {Object.entries(estadisticas.ventasPorDia)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([fecha, monto]) => (
                    <div key={fecha} className="flex justify-between items-center">
                      <span className="text-sm">
                        {new Date(fecha).toLocaleDateString('es-CO', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                      <span className="font-medium">
                        {formatearMonto(monto as number)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay datos para el período seleccionado</p>
          <p className="text-sm text-gray-500">
            Selecciona un rango de fechas con transacciones registradas
          </p>
        </div>
      )}
    </div>
  );
}