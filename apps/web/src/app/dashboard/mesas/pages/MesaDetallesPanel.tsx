/**
 * MESA DETALLES PANEL - VERSIÓN CORREGIDA
 * Ahora recibe correctamente el objeto mesa completo
 */

"use client";

import React, { useState, useEffect } from 'react';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';
import ActionBar, { ActionBarProps } from '@spoon/shared/components/ui/ActionBar';

// Interfaces
interface Mesa {
  id: string;
  numero: number;
  nombre?: string;
  zona: string;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'mantenimiento' | 'inactiva' | 'en_cocina' | 'servida' | 'por_cobrar';
  notas?: string;
  detallesOrden?: {
    id: string;
    total: number;
    items: any[];
    created_at?: string;
    fechaCreacion?: string;
    comensales?: number;
  } | null;
  created_at: string;
  updated_at: string;
}

interface MesaDetallesPanelProps {
  mesa: Mesa | null;
  onClose: () => void;
}

const MesaDetallesPanel: React.FC<MesaDetallesPanelProps> = ({
  mesa,
  onClose
}) => {
  // Debug: Log mejorado
  useEffect(() => {
    console.log('=== MESA DETALLES CORREGIDO ===');
    console.log('mesa recibida:', mesa);
    console.log('tipo:', typeof mesa);
    if (mesa) {
      console.log('✅ Mesa válida:', {
        id: mesa.id,
        numero: mesa.numero,
        estado: mesa.estado,
        zona: mesa.zona,
        capacidad: mesa.capacidad
      });
    } else {
      console.log('❌ Mesa es null o undefined');
    }
    console.log('==============================');
  }, [mesa]);

  // Estados locales
  const [wizardAbierto, setWizardAbierto] = useState(false);

  const formatCurrency = (value: number) => formatCurrencyCOP(value || 0);
  const formatTime = (iso?: string) => {
    if (!iso) return null;
    const start = new Date(iso);
    const now = new Date();
    const diffMin = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    if (diffMin < 60) return `${diffMin} min`;
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hrs}h ${mins}m`;
  };

  // Funciones de manejo
  const handleEditarOrden = () => {
    if (!mesa) return;
    console.log('Editando mesa:', mesa.numero);
    alert('🔧 FUNCIONALIDAD EN DESARROLLO\n\nPróximamente: Modal/página de edición completa');
  };

  const handleAccion = (accion: string) => {
    if (!mesa) return;
    console.log(`Acción ${accion} en mesa:`, mesa.numero);
    alert(`✅ ${accion} realizada correctamente en Mesa ${mesa.numero}`);
    onClose();
  };

  // Si no hay mesa, mostrar estado vacío
  if (!mesa) {
    return (
      <div className="h-full flex items-center justify-center bg-[color:var(--sp-neutral-50)]">
        <div className="text-center p-8">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-2">
            Selecciona una mesa
          </h3>
          <p className="text-[color:var(--sp-neutral-500)]">
            Haz clic en una mesa para ver sus detalles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[color:var(--sp-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[color:var(--sp-border)] sticky top-0 bg-[color:var(--sp-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--sp-surface)]/80 z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${
            mesa.estado === 'libre' ? 'bg-[color:var(--sp-success-100)]' :
            mesa.estado === 'ocupada' ? 'bg-[color:var(--sp-error-100)]' :
            mesa.estado === 'reservada' ? 'bg-[color:var(--sp-warning-100)]' :
            mesa.estado === 'en_cocina' ? 'bg-[color:var(--sp-primary-100)]' :
            mesa.estado === 'servida' ? 'bg-[color:var(--sp-info-100)]' :
            mesa.estado === 'por_cobrar' ? 'bg-[color:var(--sp-warning-100)]' :
            'bg-[color:var(--sp-neutral-100)]'
          }`}>
            <span className={`text-2xl ${
              mesa.estado === 'libre' ? 'text-[color:var(--sp-success-600)]' :
              mesa.estado === 'ocupada' ? 'text-[color:var(--sp-error-600)]' :
              mesa.estado === 'reservada' ? 'text-[color:var(--sp-warning-600)]' :
              mesa.estado === 'en_cocina' ? 'text-[color:var(--sp-primary-600)]' :
              mesa.estado === 'servida' ? 'text-[color:var(--sp-info-600)]' :
              mesa.estado === 'por_cobrar' ? 'text-[color:var(--sp-warning-600)]' :
              'text-[color:var(--sp-neutral-600)]'
            }`}>
              👥
            </span>
          </div>
          <div>
            <h2 className="heading-section text-[color:var(--sp-neutral-900)]">
              {mesa.nombre || `Mesa ${mesa.numero}`}
            </h2>
            <p className="text-sm text-[color:var(--sp-neutral-500)]">
              {mesa.zona} • Capacidad {mesa.capacidad} {mesa.capacidad === 1 ? 'persona' : 'personas'}
              {mesa.detallesOrden?.comensales != null && ` • 👥 ${mesa.detallesOrden.comensales} ${mesa.detallesOrden.comensales === 1 ? 'persona' : 'personas'}`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

  {/* Contenido */}
  <div className="flex-1 p-6 overflow-y-auto">
    {/* Orden actual */}
    {mesa.detallesOrden && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading-section text-[color:var(--sp-neutral-900)]">Orden actual</h3>
        {(mesa.detallesOrden.created_at || mesa.detallesOrden.fechaCreacion) && (
                <div className="text-xs text-[color:var(--sp-neutral-500)] bg-[color:var(--sp-neutral-100)] px-2 py-1 rounded-full">
          ⏱️ {formatTime(mesa.detallesOrden.fechaCreacion || mesa.detallesOrden.created_at)}
                </div>
              )}
            </div>
  {Array.isArray(mesa.detallesOrden.items) && mesa.detallesOrden.items.length > 0 ? (
      <div className="divide-y divide-[color:var(--sp-border)] rounded-lg border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)]">
        {mesa.detallesOrden.items.map((it: any, idx: number) => {
                  const nombre = it?.nombre || it?.name || it?.titulo || 'Item';
                  const cantidad = it?.cantidad ?? it?.qty ?? it?.quantity ?? 1;
                  const unit = it?.precio ?? it?.price ?? it?.unit_price ?? 0;
                  const subtotal = it?.subtotal ?? it?.total ?? (unit * cantidad);
                  const obs = it?.observaciones || it?.nota || it?.notes;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[color:var(--sp-neutral-900)] truncate">{nombre}</div>
                        <div className="text-xs text-[color:var(--sp-neutral-500)]">x{cantidad}{obs ? ` • - ${obs}` : ''}</div>
                      </div>
                      <div className="text-sm font-semibold text-[color:var(--sp-neutral-900)]">{formatCurrency(subtotal)}</div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between p-3 bg-[color:var(--sp-neutral-50)]">
                  <div className="text-sm font-medium text-[color:var(--sp-neutral-700)]">Total</div>
                  <div className="text-base font-semibold text-[color:var(--sp-neutral-900)]">
          {formatCurrency(mesa.detallesOrden.total || 0)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[color:var(--sp-neutral-50)] border border-dashed border-[color:var(--sp-neutral-200)] rounded-lg text-sm text-[color:var(--sp-neutral-500)]">
                No hay items en la orden.
              </div>
            )}
          </div>
        )}

        {/* Estado actual */}
        <div className="mb-6">
          <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-3">
            Estado Actual
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            mesa.estado === 'libre' ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]' :
            mesa.estado === 'ocupada' ? 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]' :
            mesa.estado === 'reservada' ? 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]' :
            mesa.estado === 'en_cocina' ? 'bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]' :
            mesa.estado === 'servida' ? 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]' :
            mesa.estado === 'por_cobrar' ? 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]' :
            'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'
          }`}>
            {mesa.estado === 'libre' && '🟢 Libre'}
            {mesa.estado === 'ocupada' && '🔴 Ocupada'}
            {mesa.estado === 'reservada' && '🟡 Reservada'}
            {mesa.estado === 'en_cocina' && '🍳 En cocina'}
            {mesa.estado === 'servida' && '🍽️ Servida'}
            {mesa.estado === 'por_cobrar' && '💳 Por cobrar'}
            {mesa.estado === 'mantenimiento' && '🔧 Mantenimiento'}
          </div>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span className="text-sm text-[color:var(--sp-neutral-600)]">Zona: {mesa.zona}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span className="text-sm text-[color:var(--sp-neutral-600)]">Capacidad: {mesa.capacidad} personas</span>
          </div>
        </div>

        {/* Notas */}
        {mesa.notas && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-2">
              📝 Notas
            </h4>
            <p className="text-sm text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-neutral-50)] p-3 rounded-lg">
              {mesa.notas}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2">
          {/* Botones rápidos legacy removidos: usamos ActionBar al final */}
        </div>
      </div>

      {/* Footer acciones (reutilizable) */}
      {(() => {
        // Mapeo de acciones contextuales y colores
        let primary: ActionBarProps['primary'] = { label: 'Acción', onClick: () => {}, color: 'emerald' };
        let secondary: ActionBarProps['secondary'] = { label: 'Cerrar', onClick: onClose, variant: 'outline' };

        switch (mesa.estado) {
          case 'libre':
            primary = { label: 'Sentar clientes', onClick: () => handleAccion('Ocupar'), color: 'blue' };
            break;
          case 'ocupada':
            primary = { label: 'Tomar comanda', onClick: handleEditarOrden, color: 'emerald' };
            secondary = { ...secondary, className: 'hidden sm:block' };
            break;
          case 'en_cocina':
            primary = { label: 'Marcar servida', onClick: () => handleAccion('Servida'), color: 'emerald' };
            secondary = { label: 'Editar orden', onClick: handleEditarOrden, variant: 'default', className: 'bg-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]' };
            break;
          case 'servida':
            primary = { label: 'Solicitar cuenta', onClick: () => handleAccion('Solicitar Cuenta'), color: 'indigo' };
            secondary = { label: 'Editar orden', onClick: handleEditarOrden, variant: 'default', className: 'bg-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]' };
            break;
          case 'por_cobrar':
            primary = { label: 'Procesar pago', onClick: () => handleAccion('Cobrar'), color: 'emerald' }; // verde oscuro #059669
            secondary = { label: 'Liberar mesa', onClick: () => handleAccion('Liberar'), variant: 'default', className: 'bg-amber-500 hover:bg-amber-600 text-[color:var(--sp-on-warning)]' }; // naranja #f59e0b
            break;
          case 'reservada':
            primary = { label: 'Cancelar reserva', onClick: () => handleAccion('Cancelar Reserva'), color: 'yellow' };
            break;
          case 'mantenimiento':
            primary = { label: 'Habilitar mesa', onClick: () => handleAccion('Habilitar'), color: 'emerald' };
            break;
          case 'inactiva':
            primary = { label: 'Activar mesa', onClick: () => handleAccion('Activar'), color: 'emerald' };
            break;
        }

        return (
          <ActionBar
            primary={primary}
            secondary={secondary}
          >
            {mesa.detallesOrden?.fechaCreacion || mesa.detallesOrden?.created_at ? (
              <div className="flex items-center justify-between text-xs text-[color:var(--sp-neutral-600)]">
                <span>⏱️ Tiempo en mesa: <strong>{formatTime(mesa.detallesOrden?.fechaCreacion || mesa.detallesOrden?.created_at)}</strong></span>
                {typeof mesa.detallesOrden?.comensales === 'number' && (
                  <span>👥 {mesa.detallesOrden?.comensales} {mesa.detallesOrden?.comensales === 1 ? 'persona' : 'personas'}</span>
                )}
              </div>
            ) : null}
          </ActionBar>
        );
      })()}
    </div>
  );
};

export default MesaDetallesPanel;
