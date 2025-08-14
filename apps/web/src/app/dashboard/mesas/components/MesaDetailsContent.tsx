/**
 * CONTENIDO PRINCIPAL PARA DETALLES DE MESA
 * Responsabilidad: mostrar items de orden y información específica por estado
 * Refactorizado desde MesaDetallesPanel.tsx
 */

import React from 'react';
import { 
  AlertCircle, 
  Calendar, 
  ChefHat, 
  Receipt, 
  Clock,
  Sparkles 
} from 'lucide-react';
import { Mesa } from '@spoon/shared/types/mesas';
import { formatearMoneda, formatearTiempoOcupacion } from '@spoon/shared/utils/mesas';
import { calcularTiempoOcupacion } from '@spoon/shared/utils/mesas';

interface MesaDetailsContentProps {
  mesa: Mesa;
  loading?: boolean;
}

export const MesaDetailsContent: React.FC<MesaDetailsContentProps> = ({ 
  mesa, 
  loading = false 
}) => {
  
  const tiempoOcupacion = calcularTiempoOcupacion(mesa);
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-neutral-900)] mx-auto mb-2"></div>
          <p className="text-[color:var(--sp-neutral-600)] text-sm">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  // Renderizado según estado
  switch (mesa.estado) {
    case 'libre':
      return (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-[color:var(--sp-success-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-[color:var(--sp-success-600)]" />
          </div>
          <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">Mesa Disponible</h3>
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-6">
            Lista para recibir huéspedes. Puedes crear una nueva orden o reservar la mesa.
          </p>
          
          <div className="bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
            <h4 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">Información de la mesa</h4>
            <div className="space-y-1 text-sm text-[color:var(--sp-neutral-600)]">
              <div>Número: Mesa {mesa.numero}</div>
              {mesa.nombre && <div>Nombre: {mesa.nombre}</div>}
              <div>Zona: {mesa.zona}</div>
              <div>Capacidad: {mesa.capacidad} personas</div>
            </div>
          </div>
        </div>
      );

    case 'ocupada':
      return (
        <div className="p-4 space-y-4">
          {tiempoOcupacion && (
            <div className="bg-[color:var(--sp-primary-50)] border border-[color:var(--sp-primary-200)] rounded-lg p-3">
              <div className="flex items-center gap-2 text-[color:var(--sp-primary-800)]">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Tiempo ocupada: {formatearTiempoOcupacion(tiempoOcupacion)}
                </span>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-[color:var(--sp-neutral-700)] mb-3 flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4" />
              Productos consumidos:
            </h3>
            
            <div className="space-y-2">
              {mesa.ordenActiva?.items && mesa.ordenActiva.items.length > 0 ? (
                mesa.ordenActiva.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-start p-3 bg-[color:var(--sp-neutral-50)] rounded-lg border border-[color:var(--sp-neutral-200)]">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[color:var(--sp-neutral-900)] text-sm">
                        <span className="inline-block bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)] px-2 py-1 rounded text-xs font-bold mr-2">
                          {item.cantidad}x
                        </span>
                        {item.nombre}
                      </div>
                      {item.observaciones && (
                        <div className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                          {item.observaciones}
                        </div>
                      )}
                      <div className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                        Tipo: {item.tipo === 'menu_dia' ? 'Menú del día' : 'Especial'}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-[color:var(--sp-neutral-900)] text-sm">
                        {formatearMoneda(item.precioTotal)}
                      </div>
                      <div className="text-xs text-[color:var(--sp-neutral-500)]">
                        {formatearMoneda(item.precioUnitario)} c/u
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[color:var(--sp-neutral-500)]">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[color:var(--sp-neutral-300)]" />
                  <p className="text-sm">No hay productos registrados</p>
                </div>
              )}
            </div>
          </div>

          {mesa.ordenActiva && (
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[color:var(--sp-primary-50)] p-2 rounded">
                  <div className="value-number text-[color:var(--sp-primary-600)]">
                    {mesa.ordenActiva.items.reduce((sum, item) => sum + item.cantidad, 0)}
                  </div>
                  <div className="text-xs text-[color:var(--sp-primary-700)]">Items</div>
                </div>
                <div className="bg-[color:var(--sp-success-50)] p-2 rounded">
                  <div className="value-number text-[color:var(--sp-success-600)]">
                    {mesa.ordenActiva.items.length}
                  </div>
                  <div className="text-xs text-[color:var(--sp-success-700)]">Productos</div>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'reservada':
      return (
        <div className="p-6 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-[color:var(--sp-warning-500)]" />
          <h3 className="heading-section text-[color:var(--sp-neutral-700)] mb-2">Mesa Reservada</h3>
          <p className="text-sm text-[color:var(--sp-neutral-500)] mb-6">
            Esta mesa tiene una reservación activa
          </p>
          
          {mesa.notas && (
            <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4 mb-4">
              <h4 className="font-medium text-[color:var(--sp-warning-800)] mb-2">Detalles de la reserva:</h4>
              <p className="text-[color:var(--sp-warning-700)] text-sm whitespace-pre-wrap">{mesa.notas}</p>
            </div>
          )}
        </div>
      );

    case 'inactiva':
      return (
        <div className="p-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[color:var(--sp-neutral-400)]" />
          <h3 className="heading-section text-[color:var(--sp-neutral-700)] mb-2">Mesa Inactiva</h3>
          <p className="text-sm text-[color:var(--sp-neutral-500)] mb-6">
            Esta mesa está fuera de servicio temporalmente
          </p>
          
          {mesa.notas && (
            <div className="bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
              <h4 className="font-medium text-[color:var(--sp-neutral-800)] mb-2">Motivo:</h4>
              <p className="text-[color:var(--sp-neutral-700)] text-sm">{mesa.notas}</p>
            </div>
          )}
        </div>
      );

    case 'mantenimiento':
      return (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-[color:var(--sp-warning-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-[color:var(--sp-warning-600)]" />
          </div>
          <h3 className="heading-section text-[color:var(--sp-neutral-700)] mb-2">Mesa en Mantenimiento</h3>
          <p className="text-sm text-[color:var(--sp-neutral-500)] mb-6">
            Esta mesa está temporalmente fuera de servicio por mantenimiento
          </p>
          
          {mesa.notas && (
            <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4">
              <h4 className="font-medium text-[color:var(--sp-warning-800)] mb-2">Motivo del mantenimiento:</h4>
              <p className="text-[color:var(--sp-warning-700)] text-sm">{mesa.notas}</p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[color:var(--sp-neutral-300)]" />
          <h3 className="heading-section text-[color:var(--sp-neutral-700)] mb-2">
            Estado desconocido
          </h3>
          <p className="text-sm text-[color:var(--sp-neutral-500)]">
            No se pudo determinar el estado de esta mesa
          </p>
        </div>
      );
  }
};

export default MesaDetailsContent;
