'use client';

import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { OrdenPendiente as OrdenPendienteType } from '../../caja/types/cajaTypes';
import { formatCurrency } from '../../caja/constants/cajaConstants';

interface OrdenPendienteProps {
  orden: OrdenPendienteType;
  onProcesarPago: (orden: OrdenPendienteType) => void;
  loading?: boolean;
  className?: string;
}

export const OrdenPendiente: React.FC<OrdenPendienteProps> = ({
  orden,
  onProcesarPago,
  loading = false,
  className
}) => {
  const formatearTiempo = (fechaCreacion: string) => {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / 60000);
    
    if (minutos < 1) return 'Recién creada';
    if (minutos < 60) return `${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h ${minutos % 60}m`;
    
    return fecha.toLocaleDateString('es-CO');
  };

  const getIconoTipo = (tipo: 'mesa' | 'delivery') => {
    return tipo === 'mesa' ? '🍽️' : '🚚';
  };

  const getColorBorde = (tipo: 'mesa' | 'delivery') => {
    return tipo === 'mesa' 
      ? 'border-l-blue-500 hover:border-l-blue-600' 
      : 'border-l-green-500 hover:border-l-green-600';
  };

  return (
    <Card className={`
      transition-all duration-200 hover:shadow-md cursor-pointer
      border-l-4 ${getColorBorde(orden.tipo)}
      ${className}
    `}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Información de la orden */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getIconoTipo(orden.tipo)}</span>
              <h3 className="font-semibold text-gray-900">
                {orden.identificador}
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {orden.tipo === 'mesa' ? 'Mesa' : 'Delivery'}
              </span>
            </div>
            
            {/* Detalles adicionales */}
            {orden.detalles && (
              <p className="text-sm text-gray-600 mb-2">
                {orden.detalles}
              </p>
            )}
            
            {/* Tiempo transcurrido */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>⏰ {formatearTiempo(orden.fecha_creacion)}</span>
              <span>ID: {orden.id.slice(-8)}</span>
            </div>
          </div>

          {/* Monto y botón */}
          <div className="flex flex-col items-end space-y-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(orden.monto_total)}
              </div>
            </div>
            
            <Button
              onClick={() => onProcesarPago(orden)}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>💳</span>
                  <span>Cobrar</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para lista vacía
export const OrdenesVacias: React.FC<{
  tipo: 'mesas' | 'delivery' | 'ambos';
}> = ({ tipo }) => {
  const getTexto = () => {
    switch (tipo) {
      case 'mesas':
        return {
          icono: '🍽️',
          titulo: 'No hay mesas por cobrar',
          descripcion: 'Todas las mesas están libres o ya fueron pagadas'
        };
      case 'delivery':
        return {
          icono: '🚚',
          titulo: 'No hay deliveries por cobrar',
          descripcion: 'Todos los pedidos están pendientes o ya fueron pagados'
        };
      default:
        return {
          icono: '💰',
          titulo: 'No hay órdenes pendientes',
          descripcion: 'Todas las órdenes han sido procesadas'
        };
    }
  };

  const { icono, titulo, descripcion } = getTexto();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4 opacity-50">
        {icono}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {titulo}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        {descripcion}
      </p>
    </div>
  );
};

// Componente de estadísticas rápidas
export const EstadisticasOrdenes: React.FC<{
  totalOrdenes: number;
  montoTotal: number;
  tipo: 'mesas' | 'delivery';
}> = ({ totalOrdenes, montoTotal, tipo }) => {
  const icono = tipo === 'mesas' ? '🍽️' : '🚚';
  const label = tipo === 'mesas' ? 'Mesas' : 'Deliveries';

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span>{icono}</span>
          <span className="font-medium text-gray-700">
            {totalOrdenes} {label} pendientes
          </span>
        </div>
        <div className="font-semibold text-gray-900">
          {formatCurrency(montoTotal)}
        </div>
      </div>
    </div>
  );
};