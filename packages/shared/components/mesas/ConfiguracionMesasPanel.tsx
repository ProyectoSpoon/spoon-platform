import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Settings, Plus, Minus } from 'lucide-react';
import { getMesasRestaurante, actualizarMesaBasica, RestaurantMesa } from '../../lib/supabase';

export interface ConfiguracionMesasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurar: (total: number) => Promise<boolean>;
  loading?: boolean;
  configuracionActual?: { configuradas?: boolean; totalMesas?: number } | null;
  restaurantId?: string;
}

const ConfiguracionMesasPanel: React.FC<ConfiguracionMesasPanelProps> = ({
  isOpen,
  onClose,
  onConfigurar,
  loading = false,
  configuracionActual,
  restaurantId,
}) => {
  const totalActual = useMemo(() => configuracionActual?.totalMesas ?? 0, [configuracionActual]);
  const [totalMesas, setTotalMesas] = useState<number>(totalActual || 0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mesas, setMesas] = useState<RestaurantMesa[] | null>(null);
  const [render, setRender] = useState<boolean>(isOpen);
  const [open, setOpen] = useState<boolean>(isOpen);

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'libre':
        return 'text-[color:var(--sp-success-700)]';
      case 'ocupada':
        return 'text-[color:var(--sp-error-700)]';
      case 'reservada':
        return 'text-[color:var(--sp-warning-700)]';
      case 'inactiva':
      default:
        return 'text-[color:var(--sp-neutral-600)]';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const t = setTimeout(() => setOpen(true), 10);
      return () => clearTimeout(t);
    } else {
      setOpen(false);
      const t = setTimeout(() => setRender(false), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setTotalMesas(totalActual || 0);
    setError(null);
    if (restaurantId) {
      getMesasRestaurante(restaurantId)
        .then((data) => setMesas(data))
        .catch(() => setMesas([]));
    } else {
      setMesas(null);
    }
  }, [isOpen, totalActual, restaurantId]);

  // Bloquear scroll del body mientras el panel está visible
  useEffect(() => {
    if (!render) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [render]);

  const disabled = loading || enviando;

  const validarTotal = (n: number) => {
    if (!Number.isFinite(n) || Number.isNaN(n)) return 'Ingresa un número válido';
    if (!Number.isInteger(n)) return 'Debe ser un número entero';
    if (n < 1) return 'Debe ser mayor a cero';
    if (n > 500) return 'El máximo recomendado es 500';
    return null;
  };

  const handleConfirmar = async () => {
    const msg = validarTotal(totalMesas);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const ok = await onConfigurar(totalMesas);
      if (ok) onClose();
    } catch (e) {
      setError('No se pudo guardar la configuración');
    } finally {
      setEnviando(false);
    }
  };

  const onChangeMesa = (idx: number, patch: Partial<RestaurantMesa> & { capacidad?: number }) => {
    setMesas((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const actual = next[idx];
      const capacidad_personas =
        typeof patch.capacidad === 'number' ? patch.capacidad : (patch as any).capacidad_personas;
      next[idx] = {
        ...actual,
        ...patch,
        capacidad_personas:
          typeof capacidad_personas === 'number' ? capacidad_personas : actual.capacidad_personas,
      } as RestaurantMesa;
      return next;
    });
  };

  const guardarMesa = async (
    idx: number,
    overrides?: { capacidad?: number; estado?: 'libre' | 'ocupada' | 'reservada' | 'inactiva' | 'mantenimiento'; nombre?: string }
  ) => {
    if (!mesas || !restaurantId) return;
    const m = mesas[idx];
    const nombre = typeof overrides?.nombre === 'string' ? overrides.nombre : m.nombre || '';
    const capacidad = typeof overrides?.capacidad === 'number' ? overrides.capacidad : m.capacidad_personas;
    const estado = (overrides?.estado ?? (m.estado as any)) as any;

    if (nombre && nombre.length > 100) {
      setError('El nombre supera 100 caracteres');
      return;
    }
    if (!Number.isInteger(capacidad) || capacidad < 1) {
      setError('Capacidad inválida');
      return;
    }
    setError(null);
    try {
      await actualizarMesaBasica(restaurantId, m.numero, {
        numero: m.numero,
        nombre: nombre.trim() || undefined,
        capacidad,
        estado,
      });
      const data = await getMesasRestaurante(restaurantId);
      setMesas(data);
    } catch (e) {
      setError('No se pudo guardar la mesa');
    }
  };

  if (!render) return null;

  const overlayPanel = (
    <div className="fixed inset-0 z-[2147483647]" role="dialog" aria-modal="true" aria-label="Configurar Mesas">

      {/* Área clickeable (70%) para cerrar al hacer clic fuera del panel */}
      <div
        className="absolute inset-y-0 left-0 right-[30vw] z-10 bg-[color:var(--sp-overlay)] backdrop-blur-sm"
        onClick={disabled ? undefined : onClose}
        aria-hidden
      />

      <div
        className={`absolute right-0 top-0 z-20 h-screen w-[30vw] bg-[color:var(--sp-surface)] border-l border-[color:var(--sp-border)] shadow-xl flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header gradiente */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] text-[color:var(--sp-on-surface)] sticky top-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-[color:var(--sp-surface)]/20 text-[color:var(--sp-on-surface)] grid place-items-center">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-[color:var(--sp-on-surface)]">Configuración de Mesas</div>
              <div className="text-xs text-[color:var(--sp-on-surface)]/70">Personaliza cantidad y datos básicos</div>
            </div>
          </div>
          <button onClick={onClose} className="h-6 w-6 grid place-items-center rounded hover:bg-[color:var(--sp-surface)]/20 text-[color:var(--sp-on-surface)]" aria-label="Cerrar" disabled={disabled}>
            <X className="h-4 w-4" />
          </button>
        </div>

          {/* Contenido */}
          <div className="p-6 space-y-6 overflow-y-auto bg-[color:var(--sp-surface)] font-sans max-w-[900px] mx-auto">
            {/* Hero */}
            <div className="rounded-xl bg-[color:var(--sp-surface-elevated)] p-6 text-center shadow-sm">
              <div className="text-[80px] leading-none mb-2">🍽️</div>
              <div className="text-xl font-bold text-[color:var(--sp-on-surface)]">Configuración de Mesas</div>
              <p className="text-sm text-[color:var(--sp-on-surface)]/70 mt-2">Personaliza cantidad y datos básicos</p>
            </div>

            {/* Cantidad Total */}
            <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-6 shadow-sm">
              <div className="flex items-center gap-3 text-[15px] font-semibold text-[color:var(--sp-on-surface)] mb-4">
                <span>📊</span> Cantidad Total de Mesas
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setTotalMesas((n) => (Number.isFinite(n) ? Math.max(1, (n as number) - 1) : 1))}
                  disabled={disabled}
                  className="h-12 w-12 rounded-full border-2 border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] hover:border-[color:var(--sp-focus)] shadow-sm grid place-items-center transition"
                >
                  <Minus className="h-5 w-5 text-[color:var(--sp-on-surface)]" />
                </button>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-bold text-[color:var(--sp-on-surface)]">{Number.isFinite(totalMesas) ? totalMesas : 0}</div>
                  <div className="text-sm text-[color:var(--sp-on-surface)]/70 font-medium">mesas</div>
                </div>
                <button
                  onClick={() => setTotalMesas((n) => (Number.isFinite(n) ? Math.min(500, (n as number) + 1) : 1))}
                  disabled={disabled}
                  className="h-12 w-12 rounded-full border-2 border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] hover:border-[color:var(--sp-focus)] shadow-sm grid place-items-center transition"
                >
                  <Plus className="h-5 w-5 text-[color:var(--sp-on-surface)]" />
                </button>
              </div>
              <div className="mt-4 rounded-lg bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)] text-sm text-center p-3">
                Se crearán automáticamente {Number.isFinite(totalMesas) ? totalMesas : 0} mesas numeradas del 1 al {Number.isFinite(totalMesas) ? totalMesas : 0}
              </div>
              {error && <div className="mt-2 text-[13px] text-[color:var(--sp-error-700)] text-center">{error}</div>}
            </div>

            {restaurantId && configuracionActual?.configuradas && (
              <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] shadow-sm">
                <div className="px-6 py-4 border-b border-[color:var(--sp-border)] text-[15px] font-semibold text-[color:var(--sp-on-surface)] flex items-center gap-2">
                  <span>⚙️</span> Configuración Individual
                </div>
                {/* Encabezados columnas */}
                <div className="px-6 py-3 bg-[color:var(--sp-surface)] border-b border-[color:var(--sp-border)] grid grid-cols-4 gap-4 text-xs font-semibold text-[color:var(--sp-on-surface)]/70 uppercase tracking-wide">
                  <div># Mesa</div>
                  <div>Capacidad</div>
                  <div>Nombre</div>
                  <div>Estado inicial</div>
                </div>
                {/* Filas */}
                <div className="max-h-64 overflow-y-auto divide-y divide-[color:var(--sp-border)]/50">
                  {Array.isArray(mesas) && mesas.length > 0 ? (
                    mesas.map((m, idx) => (
                      <div key={m.id} className="px-6 py-4 grid grid-cols-4 gap-4 transition hover:bg-[color:var(--sp-surface)]">
                        {/* Col 1: Número */}
                        <div className="grid place-items-center">
                          <div className="h-8 w-8 rounded-full bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)] grid place-items-center text-sm font-bold">
                            {m.numero}
                          </div>
                        </div>
                        {/* Col 2: Capacidad */}
                        <div className="flex items-center">
                          <input
                            type="number"
                            min={1}
                            value={m.capacidad_personas}
                            onChange={(e) => {
                              onChangeMesa(idx, { capacidad: parseInt(e.target.value || '0', 10) });
                            }}
                            onBlur={() => guardarMesa(idx)}
                            className="w-10 h-7 text-center text-sm rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:outline-none transition"
                          />
                        </div>
                        {/* Col 3: Nombre */}
                        <div>
                          <input
                            type="text"
                            placeholder="Nombre mesa..."
                            value={m.nombre || ''}
                            onChange={(e) => onChangeMesa(idx, { nombre: e.target.value })}
                            onBlur={() => guardarMesa(idx)}
                            className="h-8 w-full rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] px-2 text-sm focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:outline-none transition"
                          />
                        </div>
                        {/* Col 4: Estado */}
                        <div>
                          <select
                            value={m.estado}
                            onChange={(e) => {
                              const nuevo = e.target.value as any;
                              onChangeMesa(idx, { estado: nuevo });
                              // Guardar inmediatamente usando override para evitar condición de carrera
                              guardarMesa(idx, { estado: nuevo });
                            }}
                            className={`h-8 w-full rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] px-2 text-xs cursor-pointer focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:outline-none transition ${getEstadoColor(m.estado)}`}
                          >
                            <option value="libre">● Libre</option>
                            <option value="ocupada">● Ocupada</option>
                            <option value="reservada">● Reservada</option>
                            <option value="inactiva">○ Inactiva</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-[color:var(--sp-on-surface)]/70">{mesas === null ? 'Cargando mesas…' : 'Sin mesas'}</div>
                  )}
                </div>
                {/* Sugerencias */}
                <div className="mx-4 my-4 rounded-md border border-[color:var(--sp-warning-200)] bg-[color:var(--sp-warning-50)] p-4 text-[color:var(--sp-warning-800)]">
                  <div className="text-sm font-medium mb-2">💡 Sugerencias para una mejor organización</div>
                  <ul className="list-disc pl-5 text-xs space-y-1 marker:text-[color:var(--sp-warning-500)] text-[color:var(--sp-warning-700)]">
                    <li>Usa nombres descriptivos: "Terraza 1", "VIP Entrada", "Ventana Sur"</li>
                    <li>Ajusta la capacidad según el tamaño real de cada mesa</li>
                    <li>Puedes cambiar estos datos después desde la gestión de mesas</li>
                    <li>Las mesas inactivas no aparecerán en el sistema de pedidos</li>
                  </ul>
                </div>
                {error && <div className="px-6 pb-4 text-[13px] text-[color:var(--sp-error-700)]">{error}</div>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto px-6 py-4 border-t border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] sticky bottom-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[color:var(--sp-on-surface)]/70">
                <span className="h-2 w-2 rounded-full bg-[color:var(--sp-success-500)] inline-block" />
                Cambios se guardan al confirmar.
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={onClose} disabled={disabled} className="h-9 px-4 rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] text-sm text-[color:var(--sp-on-surface)] hover:bg-[color:var(--sp-surface)]/80 transition">Cancelar</button>
                <button onClick={handleConfirmar} disabled={disabled} className="h-9 px-4 rounded-md bg-[color:var(--sp-warning-600)] hover:bg-[color:var(--sp-warning-700)] text-[color:var(--sp-on-primary)] inline-flex items-center gap-2 text-sm transition">
                  <Check className="h-4 w-4" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  return portalTarget ? createPortal(overlayPanel, portalTarget) : overlayPanel;
};

export default ConfiguracionMesasPanel;