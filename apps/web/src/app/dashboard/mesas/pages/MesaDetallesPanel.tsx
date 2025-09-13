/**
 * MESA DETALLES PANEL - VERSIÓN CORREGIDA
 * Ahora recibe correctamente el objeto mesa completo
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';
import ActionBarRaw, { ActionBarProps } from '@spoon/shared/components/ui/ActionBar';
const ActionBar = ActionBarRaw as any;
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';
import CrearOrdenWizardRaw from '@spoon/shared/components/mesas/CrearOrdenWizard';
const CrearOrdenWizard = CrearOrdenWizardRaw as any;

// Interfaces
interface Mesa {
  id?: string; // opcional: algunas ramas no proveen id interno
  numero: number;
  nombre?: string;
  zona?: string;
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
  restaurantId: string;
  onCobrar?: (numeroMesa: number) => Promise<boolean> | boolean;
  cajaAbierta?: boolean;
}

const MesaDetallesPanel: React.FC<MesaDetallesPanelProps> = ({
  mesa,
  onClose,
  restaurantId,
  onCobrar,
  cajaAbierta = true
}) => {
  // Debug: Log mejorado
  const lastMesaRef = useRef<Mesa | null>(null);
  useEffect(() => {
    // Evitar spam por StrictMode (doble render) y re-renders donde la mesa no cambió
    if (lastMesaRef.current === mesa) return;
    lastMesaRef.current = mesa;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MesaDetallesPanel] cambio de mesa =>', mesa ? {
        id: mesa.id,
        numero: mesa.numero,
        estado: mesa.estado,
        items: mesa.detallesOrden?.items?.length || 0,
        total: mesa.detallesOrden?.total || 0
      } : 'null');
    }
  }, [mesa]);

  // Estados locales
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [errorItems, setErrorItems] = useState<string | null>(null);
  const [procesandoItem, setProcesandoItem] = useState<string | null>(null);
  const [agregandoItems, setAgregandoItems] = useState(false);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [cobrando, setCobrando] = useState(false);
  const [mensajeCobro, setMensajeCobro] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Sincronizar items locales cuando cambia la mesa o la orden
  useEffect(() => {
    if (mesa?.detallesOrden?.items) {
      // Clonar para edición local
      setLocalItems(JSON.parse(JSON.stringify(mesa.detallesOrden.items)));
    } else {
      setLocalItems([]);
    }
  }, [mesa?.detallesOrden?.id, mesa?.detallesOrden?.items]);

  const actualizarItemLocal = (itemId: string, nuevaCantidad: number) => {
    setLocalItems(prev => prev.map(it => it.id === itemId ? { ...it, cantidad: nuevaCantidad, precio_total: (it.precio_unitario || it.precioUnitario || 0) * nuevaCantidad } : it));
  };
  const eliminarItemLocal = (itemId: string) => {
    setLocalItems(prev => prev.filter(it => it.id !== itemId));
  };
  const calcularTotalLocal = () => {
    if (localItems.length === 0) return 0;
    return localItems.reduce((sum, it) => {
      const unit = it.precio_unitario ?? it.precioUnitario ?? 0;
      const cant = it.cantidad ?? 1;
      return sum + unit * cant;
    }, 0);
  };
  // Edición básica movida al ConfiguracionMesasPanel

  const formatCurrency = (value: number) => formatCurrencyCOP(value || 0);
  // getEstadoDisplay espera un objeto con id obligatorio; casteamos porque en algunas ramas no lo tenemos
  const estadoDisplay = mesa ? getEstadoDisplay(mesa as any) : null;
  
  // Mapear color lógico a tokens del sistema de diseño
  const colorToClasses = (tone: 'green'|'red'|'yellow'|'gray'|'orange') => {
    switch (tone) {
      case 'green':
        return {
          bg100: 'bg-[color:var(--sp-success-100)]',
          text600: 'text-[color:var(--sp-success-600)]',
          text800: 'text-[color:var(--sp-success-800)]'
        };
      case 'red':
        return {
          bg100: 'bg-[color:var(--sp-error-100)]',
          text600: 'text-[color:var(--sp-error-600)]',
          text800: 'text-[color:var(--sp-error-800)]'
        };
      case 'yellow':
      case 'orange':
        return {
          bg100: 'bg-[color:var(--sp-warning-100)]',
          text600: 'text-[color:var(--sp-warning-600)]',
          text800: 'text-[color:var(--sp-warning-800)]'
        };
      case 'gray':
      default:
        return {
          bg100: 'bg-[color:var(--sp-neutral-100)]',
          text600: 'text-[color:var(--sp-neutral-600)]',
          text800: 'text-[color:var(--sp-neutral-800)]'
        };
    }
  };
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
  const handleCobrar = async () => {
    if (!mesa || !onCobrar || cobrando) return;
    setMensajeCobro(null);
    if (!cajaAbierta) {
      setMensajeCobro({ tipo: 'error', texto: 'La caja está cerrada' });
      return;
    }
    const total = mesa.detallesOrden?.total || calcularTotalLocal();
    const confirmar = typeof window !== 'undefined' ? window.confirm(`Confirmar cobro de Mesa ${mesa.numero} por ${formatCurrency(total)}?`) : true;
    if (!confirmar) return;
    try {
      setCobrando(true);
      const ok = await onCobrar(mesa.numero);
      if (ok) {
        setMensajeCobro({ tipo: 'ok', texto: 'Cobro procesado ✔️' });
      } else {
        setMensajeCobro({ tipo: 'error', texto: 'No se pudo procesar el cobro' });
      }
    } catch (e) {
      console.error(e);
      setMensajeCobro({ tipo: 'error', texto: 'Error inesperado' });
    } finally {
      setCobrando(false);
    }
  };

  const handleAccion = (accion: string) => {
    if (!mesa) return;
    console.log(`Acción ${accion} en mesa:`, mesa.numero);
    alert(`✅ ${accion} realizada correctamente en Mesa ${mesa.numero}`);
    onClose();
  };

  // Edición básica removida de este panel

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
  <div className="flex items-center justify-between p-6 border-b border-[color:var(--sp-border)] sticky top-0 bg-[color:var(--sp-surface)] z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${estadoDisplay ? colorToClasses(estadoDisplay.color).bg100 : 'bg-[color:var(--sp-neutral-100)]'}`}>
            <span className={`text-2xl ${estadoDisplay ? colorToClasses(estadoDisplay.color).text600 : 'text-[color:var(--sp-neutral-600)]'}`}>
              👥
            </span>
          </div>
          <div>
            <h2 className="heading-section text-[color:var(--sp-neutral-900)]">
              {mesa.nombre || `Mesa ${mesa.numero}`}
            </h2>
            <p className="text-sm text-[color:var(--sp-neutral-500)]">
              {mesa.zona ? `${mesa.zona} • ` : ''}Capacidad {mesa.capacidad} {mesa.capacidad === 1 ? 'persona' : 'personas'}
              {mesa.detallesOrden?.comensales != null && ` • 👥 ${mesa.detallesOrden.comensales} ${mesa.detallesOrden.comensales === 1 ? 'persona' : 'personas'}`}
            </p>
          </div>
        </div>
  {/* Botón cerrar eliminado según solicitud */}
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
  {Array.isArray(localItems) && localItems.length > 0 ? (
      <div className="divide-y divide-[color:var(--sp-border)] rounded-lg border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)]">
        {localItems.map((it: any, idx: number) => {
                  const nombre = it?.nombre || it?.name || it?.titulo || 'Item';
                  const cantidad = it?.cantidad ?? it?.qty ?? it?.quantity ?? 1;
                  const unit = it?.precio_unitario ?? it?.precioUnitario ?? it?.precio ?? it?.price ?? it?.unit_price ?? 0;
                  const subtotal = it?.precio_total ?? it?.precioTotal ?? it?.subtotal ?? it?.total ?? (unit * cantidad);
                  const obs = it?.observaciones || it?.nota || it?.notes;
                  const itemId = it?.id;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[color:var(--sp-neutral-900)] truncate">{nombre}</div>
                        <div className="text-xs text-[color:var(--sp-neutral-500)]">x{cantidad}{obs ? ` • - ${obs}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[color:var(--sp-neutral-900)]">{formatCurrency(subtotal)}</div>
                        {/* Controles edición */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={procesandoItem === itemId || cantidad <= 1}
                            onClick={async () => {
                              if (!itemId) return; setProcesandoItem(itemId); setErrorItems(null);
                              const nueva = cantidad - 1;
                              actualizarItemLocal(itemId, nueva);
                              try { const { actualizarCantidadItemOrden } = await import('@spoon/shared/lib/supabase'); await actualizarCantidadItemOrden(itemId, nueva); } catch(e){ setErrorItems('No se pudo actualizar'); actualizarItemLocal(itemId, cantidad); } finally { setProcesandoItem(null); }
                            }}
                            className="px-2 py-1 text-xs rounded bg-[color:var(--sp-neutral-100)] disabled:opacity-40"
                          >-</button>
                          <span className="text-xs w-6 text-center">{cantidad}</span>
                          <button
                            disabled={procesandoItem === itemId}
                            onClick={async () => { if (!itemId) return; setProcesandoItem(itemId); setErrorItems(null); const nueva = cantidad + 1; actualizarItemLocal(itemId, nueva); try { const { actualizarCantidadItemOrden } = await import('@spoon/shared/lib/supabase'); await actualizarCantidadItemOrden(itemId, nueva); } catch(e){ setErrorItems('No se pudo actualizar'); actualizarItemLocal(itemId, cantidad); } finally { setProcesandoItem(null);} }}
                            className="px-2 py-1 text-xs rounded bg-[color:var(--sp-neutral-100)] disabled:opacity-40"
                          >+</button>
                          <button
                            disabled={procesandoItem === itemId}
                            onClick={async () => { if (!itemId) return; if(!confirm('Eliminar item?')) return; setProcesandoItem(itemId); setErrorItems(null); const backup = [...localItems]; eliminarItemLocal(itemId); try { const { eliminarItemOrden } = await import('@spoon/shared/lib/supabase'); await eliminarItemOrden(itemId); } catch(e){ setErrorItems('No se pudo eliminar'); setLocalItems(backup); } finally { setProcesandoItem(null);} }}
                            className="px-2 py-1 text-xs rounded bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-600)] disabled:opacity-40"
                          >×</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between p-3 bg-[color:var(--sp-neutral-50)]">
                  <div className="text-sm font-medium text-[color:var(--sp-neutral-700)]">Total</div>
                  <div className="text-base font-semibold text-[color:var(--sp-neutral-900)]">
          {formatCurrency(calcularTotalLocal())}
                  </div>
                </div>
                <div className="p-3 flex gap-2 justify-between">
                  <button
                      onClick={() => setWizardAbierto(true)}
                    className="flex-1 px-3 py-2 text-xs rounded bg-[color:var(--sp-success-600)] text-[color:var(--sp-on-success)]"
                  >Agregar productos</button>
                  {errorItems && <span className="text-[10px] text-[color:var(--sp-error-600)]">{errorItems}</span>}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[color:var(--sp-neutral-50)] border border-dashed border-[color:var(--sp-neutral-200)] rounded-lg text-sm text-[color:var(--sp-neutral-500)]">
                No hay items en la orden.
              </div>
            )}
          </div>
        )}

  {/* Información básica editable movida al panel de configuración */}

        {/* Estado actual */}
        <div className="mb-6">
          <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-3">
            Estado Actual
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoDisplay ? colorToClasses(estadoDisplay.color).bg100 + ' ' + colorToClasses(estadoDisplay.color).text800 : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'}`}>
            {estadoDisplay?.estado === 'libre' && '🟢 '}
            {estadoDisplay?.estado === 'ocupada' && '🔴 '}
            {estadoDisplay?.estado === 'reservada' && '🟡 '}
            {estadoDisplay?.estado === 'en_cocina' && '🍳 '}
            {estadoDisplay?.estado === 'servida' && '🍽️ '}
            {estadoDisplay?.estado === 'por_cobrar' && '💳 '}
            {estadoDisplay?.estado === 'mantenimiento' && '🔧 '}
            {estadoDisplay?.texto || mesa.estado}
          </div>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {mesa.zona && (
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span className="text-sm text-[color:var(--sp-neutral-600)]">Zona: {mesa.zona}</span>
            </div>
          )}
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
      primary = { label: cobrando ? 'Cobrando...' : 'Cobrar', onClick: handleCobrar, color: 'emerald', disabled: !cajaAbierta || cobrando || !(mesa.detallesOrden?.items?.length) } as any;
            secondary = { ...secondary, className: 'hidden sm:block' };
            break;
          case 'en_cocina':
      primary = { label: 'Marcar servida', onClick: () => handleAccion('Servida'), color: 'emerald' };
      secondary = { label: cobrando ? 'Cobrando...' : 'Cobrar', onClick: handleCobrar, variant: 'default', className: 'bg-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]', disabled: !cajaAbierta || cobrando || !(mesa.detallesOrden?.items?.length) } as any;
            break;
          case 'servida':
      primary = { label: 'Solicitar cuenta', onClick: () => handleAccion('Solicitar Cuenta'), color: 'indigo' };
      secondary = { label: cobrando ? 'Cobrando...' : 'Cobrar', onClick: handleCobrar, variant: 'default', className: 'bg-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]', disabled: !cajaAbierta || cobrando || !(mesa.detallesOrden?.items?.length) } as any;
            break;
          case 'por_cobrar':
      primary = { label: cobrando ? 'Cobrando...' : 'Procesar pago', onClick: handleCobrar, color: 'emerald', disabled: !cajaAbierta || cobrando || !(mesa.detallesOrden?.items?.length) } as any; // verde oscuro #059669
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
            {mensajeCobro && (
              <div className={`mt-2 text-xs px-2 py-1 rounded ${mensajeCobro.tipo === 'ok' ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-700)]' : 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-700)]'}`}>
                {mensajeCobro.texto}
                {!cajaAbierta && ' (Caja cerrada)'}
              </div>
            )}
            {!mensajeCobro && !cajaAbierta && (
              <div className="mt-2 text-xs px-2 py-1 rounded bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]">
                Abre la caja para poder cobrar
              </div>
            )}
          </ActionBar>
        );
      })()}
      {/* Wizard para agregar productos a orden existente */}
      {wizardAbierto && mesa?.detallesOrden?.id && (
        <CrearOrdenWizard
          isOpen={wizardAbierto}
          onClose={() => setWizardAbierto(false)}
          onCrearOrden={async (items: { combinacionId: string; nombre: string; precio: number; cantidad: number; tipo: 'menu_dia' | 'especial'; }[]) => {
            if (!mesa?.detallesOrden?.id) return false;
            try {
              setAgregandoItems(true);
              const { agregarItemsAOrden } = await import('@spoon/shared/lib/supabase');
              await agregarItemsAOrden(mesa.detallesOrden.id, items.map(i => ({
                combinacionId: i.combinacionId,
                tipoItem: i.tipo,
                cantidad: i.cantidad,
                precioUnitario: i.precio,
                observacionesItem: undefined
              })));
              // Optimista: añadir a localItems (sin IDs reales nuevos)
              setLocalItems(prev => ([
                ...prev,
                ...items.map(it => ({
                  id: `tmp-${Date.now()}-${Math.random()}`,
                  nombre: it.nombre,
                  cantidad: it.cantidad,
                  precio_unitario: it.precio,
                  precio_total: it.precio * it.cantidad
                }))
              ]));
              return true;
            } catch (e) {
              console.error('Error agregando items', e);
              setErrorItems('No se pudieron agregar items');
              return false;
            } finally {
              setAgregandoItems(false);
              setWizardAbierto(false);
            }
          }}
          restaurantId={restaurantId}
          mesaNumero={mesa.numero}
          loading={agregandoItems}
        />
      )}
    </div>
  );
};

export default MesaDetallesPanel;

