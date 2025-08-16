import React, { useState } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { TransaccionCaja } from '../types/cajaTypes';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

interface OrdenPendiente {
  id: string;
  identificador: string;
  tipo: 'mesa' | 'delivery';
  monto_total: number;
  fecha_creacion: string;
  detalles?: string;
}

interface Transaccion {
  id: string;
  tipo_orden: 'mesa' | 'delivery';
  orden_id: string;
  monto_total: number;
  metodo_pago: string;
  procesada_at: string;
  monto_cambio: number;
}

interface Gasto {
  id: string;
  concepto: string;
  monto: number;
  categoria: 'proveedor' | 'servicios' | 'suministros' | 'otro';
  notas?: string;
  registrado_at: string;
}

interface MovimientosPanelProps {
  ordenesPendientes: OrdenPendiente[];
  transacciones: TransaccionCaja[]; // ✅ USA EL TIPO REAL
  gastos: any[];
  onProcesarPago: (orden: OrdenPendiente) => void;
  loading?: boolean;
}

type SubTab = 'ingresos' | 'egresos' | 'por_cobrar' | 'por_pagar';

const formatCurrency = (centavos: number) => formatCurrencyCOP(centavos);

const EmptyState: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon, title, subtitle, action }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">{title}</h3>
    <p className="text-[color:var(--sp-neutral-600)] mb-4">{subtitle}</p>
    {action && (
      <Button onClick={action.onClick} variant="outline">
        {action.label}
      </Button>
    )}
  </div>
);

export const MovimientosPanel: React.FC<MovimientosPanelProps> = ({
  ordenesPendientes,
  transacciones,
  gastos,
  onProcesarPago,
  loading = false
}) => {
  const [subTab, setSubTab] = useState<SubTab>('por_cobrar');

  // Navegación de sub-tabs
  const subTabs = [
    { key: 'ingresos' as SubTab, label: 'Ingresos', count: transacciones.length },
    { key: 'egresos' as SubTab, label: 'Egresos', count: gastos.length },
    { key: 'por_cobrar' as SubTab, label: 'Por cobrar', count: ordenesPendientes.length },
    { key: 'por_pagar' as SubTab, label: 'Por pagar', count: 0 }
  ];

  const renderSubTabContent = () => {
    switch (subTab) {
      case 'por_cobrar':
        if (ordenesPendientes.length === 0) {
          return (
            <EmptyState
              icon="💰"
              title="No hay órdenes pendientes"
              subtitle="Todas las órdenes han sido procesadas"
            />
          );
        }
        
        return (
          <div className="space-y-3">
            {ordenesPendientes.map((orden) => (
              <Card key={orden.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {orden.tipo === 'mesa' ? '🍽️' : '🚚'}
                        </span>
                        <h5 className="font-medium">{orden.identificador}</h5>
                        <span className="text-xs bg-[color:var(--sp-neutral-100)] px-2 py-1 rounded-full">
                          {orden.tipo}
                        </span>
                      </div>
                      
                      {orden.detalles && (
                        <p className="text-sm text-[color:var(--sp-neutral-600)] mb-2">{orden.detalles}</p>
                      )}
                      
                      <div className="text-xs text-[color:var(--sp-neutral-500)]">
                        ⏰ {new Date(orden.fecha_creacion).toLocaleTimeString('es-CO', { 
                          hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' 
                        })}
                      </div>
                    </div>
                    
                      <div className="text-right space-y-2">
                      <div className="value-number">
                        {formatCurrency(orden.monto_total)}
                      </div>
                      <Button
                        onClick={() => onProcesarPago(orden)}
                        disabled={loading}
                        size="sm"
                        className="bg-[color:var(--sp-info-600)] hover:bg-[color:var(--sp-info-700)]"
                      >
                        💳 Cobrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'ingresos':
        if (transacciones.length === 0) {
          return (
            <EmptyState
              icon="💵"
              title="No hay ingresos registrados"
              subtitle="Los pagos procesados aparecerán aquí"
            />
          );
        }
        
        return (
          <div className="space-y-3">
            {transacciones.map((transaccion) => (
              <Card key={transaccion.id} className="border-l-4 border-l-[color:var(--sp-success-500)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {transaccion.tipo_orden === 'mesa' ? '🍽️' : '🚚'}
                        </span>
                        <h5 className="font-medium">
                          {transaccion.tipo_orden} - {transaccion.orden_id.slice(-8)}
                        </h5>
                        <span className="text-xs bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)] px-2 py-1 rounded-full">
                          {transaccion.metodo_pago}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[color:var(--sp-neutral-500)] space-x-4">
                        <span>
                          ⏰ {new Date(transaccion.procesada_at).toLocaleTimeString('es-CO', { 
                            hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' 
                          })}
                        </span>
                        {transaccion.monto_cambio > 0 && (
                          <span>💰 Cambio: {formatCurrency(transaccion.monto_cambio)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="value-number text-[color:var(--sp-success-600)]">
                        +{formatCurrency(transaccion.monto_total)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'egresos':
        if (gastos.length === 0) {
          return (
            <EmptyState
              icon="💸"
              title="No hay gastos registrados"
              subtitle="Los gastos que registres aparecerán aquí"
            />
          );
        }
        
        return (
          <div className="space-y-3">
            {gastos.map((gasto) => (
              <Card key={gasto.id} className="border-l-4 border-l-[color:var(--sp-error-500)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">📊</span>
                        <h5 className="font-medium">{gasto.concepto}</h5>
                        <span className="text-xs bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)] px-2 py-1 rounded-full capitalize">
                          {gasto.categoria}
                        </span>
                      </div>
                      
                      {gasto.notas && (
                        <p className="text-sm text-[color:var(--sp-neutral-600)] mb-2">{gasto.notas}</p>
                      )}
                      
                      <div className="text-xs text-[color:var(--sp-neutral-500)]">
                        ⏰ {new Date(gasto.registrado_at).toLocaleTimeString('es-CO', { 
                          hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' 
                        })}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="value-number text-[color:var(--sp-error-600)]">
                        -{formatCurrency(gasto.monto)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'por_pagar':
        return (
          <EmptyState
            icon="📋"
            title="Sin implementar"
            subtitle="Funcionalidad próximamente disponible"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-navegación */}
  <div className="flex space-x-1 bg-[color:var(--sp-neutral-50)] rounded-lg p-1 w-fit">
        {subTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={subTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSubTab(tab.key)}
            className={`${subTab === tab.key ? 'bg-[color:var(--sp-surface)] shadow-sm' : ''} relative`}
          >
            {tab.label}
            {tab.count > 0 && (
  <span className="ml-2 bg-[color:var(--sp-info-500)] text-[color:var(--sp-on-info)] text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Contenido */}
      <div className="max-h-96 overflow-y-auto">
        {renderSubTabContent()}
      </div>
    </div>
  );
};