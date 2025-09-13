'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { NuevoGasto, CategoriaGasto } from '../../types/cajaTypes';
import {
  CATEGORIAS_GASTOS,
  CONCEPTOS_FRECUENTES,
  VALIDACIONES_GASTOS,
  formatCurrency
} from '../../constants/cajaConstants';
import { X, Check } from 'lucide-react';
import { useSecurityLimits } from '../../hooks/useSecurityLimits';
import { SecurityAlert } from '../../components/SecurityAlert';

// TEMP: Cast shared UI components & icons to any to bypass duplicate React type versions
// This mirrors approach in other updated modals until type consolidation is done.
const AnyButton: any = Button as any;
const AnyInput: any = Input as any;
const IconX: any = X as any;
const IconCheck: any = Check as any;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (gasto: NuevoGasto) => Promise<{ success: boolean; message?: string; error?: string }>; 
  loading?: boolean;
}

// Pasos del wizard para registrar gasto
const PASOS = [
  { id: 'categoria', titulo: 'Categoría del gasto' },
  { id: 'concepto', titulo: 'Concepto del gasto' },
  { id: 'monto', titulo: 'Monto gastado' },
  { id: 'notas', titulo: 'Notas adicionales (opcional)' },
  { id: 'resumen', titulo: 'Confirmar y registrar' }
];

export const GastoWizardSlideOver: React.FC<Props> = ({ isOpen, onClose, onConfirmar, loading = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaGasto>('servicios');
  const [concepto, setConcepto] = useState('');
  // Monto en pesos (no centavos). IMPORTANTE: Antes se dividía por 100 en las validaciones
  // Nota: la UI ahora opera en PESOS; evitar suposiciones de centavos que generen límites artificiales
  // de $10,000 (1,000,000 / 100). Ahora las validaciones usan directamente pesos.
  const [monto, setMonto] = useState<number>(0);
  // Cadena formateada mostrada en el input (con separador de miles)
  const [montoInput, setMontoInput] = useState<string>('0');
  const [notas, setNotas] = useState('');
  const [errores, setErrores] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [showConceptos, setShowConceptos] = useState(false);
  // Seguridad de límites (usamos límite de transacción normal para egresos por ahora)
  const { limits, validarMonto } = useSecurityLimits();
  const [securityState, setSecurityState] = useState<{
    valid: boolean;
    warnings: string[];
    requiresAuth: boolean;
  } | null>(null);

  // Animación de entrada/salida del slide-over
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Reset del formulario al abrir
      setCategoria('servicios');
      setConcepto('');
      setMonto(0);
  setNotas('');
      setErrores([]);
      setShowConceptos(false);
  setMontoInput('0');
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const conceptosSugeridos = useMemo(() => CONCEPTOS_FRECUENTES[categoria] || [], [categoria]);

  const validar = (): boolean => {
    const errs: string[] = [];
    if (concepto.trim().length < VALIDACIONES_GASTOS.CONCEPTO_MIN_LENGTH) {
      errs.push(`El concepto debe tener al menos ${VALIDACIONES_GASTOS.CONCEPTO_MIN_LENGTH} caracteres`);
    }
    if (monto < VALIDACIONES_GASTOS.MONTO_MINIMO) {
      errs.push(`El monto debe ser mayor a $${VALIDACIONES_GASTOS.MONTO_MINIMO.toLocaleString('es-CO')}`);
    }
    if (monto > VALIDACIONES_GASTOS.MONTO_MAXIMO) {
      errs.push(`El monto no puede exceder $${VALIDACIONES_GASTOS.MONTO_MAXIMO.toLocaleString('es-CO')}`);
    }
    if (notas.length > VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH) {
      errs.push('Las notas no pueden exceder 500 caracteres');
    }
    // Validación de límites de seguridad
    const sec = validarMonto ? validarMonto(monto, 'gasto') : { valid: true, warnings: [], requiresAuth: false };
    setSecurityState(sec);
    if (!sec.valid) {
      errs.push(...sec.warnings);
    }
    setErrores(errs);
    return errs.length === 0;
  };

  // No disparar setState durante render: usar una bandera derivada para el botón
  const canSubmit = useMemo(() => {
    if (concepto.trim().length < VALIDACIONES_GASTOS.CONCEPTO_MIN_LENGTH) return false;
  if (monto < VALIDACIONES_GASTOS.MONTO_MINIMO) return false;
  if (monto > VALIDACIONES_GASTOS.MONTO_MAXIMO) return false;
    if (notas.length > VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH) return false;
    return true;
  }, [concepto, monto, notas]);

  const closeIfAllowed = () => {
    if (!procesando) onClose();
  };

  const handleConfirmar = async () => {
  if (!validar()) return;

    if (securityState?.requiresAuth) {
      const proceed = window.confirm('Este gasto requiere autorización de supervisor. ¿Desea continuar?');
      if (!proceed) return;
    }

    try {
      setProcesando(true);
      const payload: NuevoGasto = {
        concepto: concepto.trim(),
  monto: Math.round(monto),
        categoria,
        notas: notas.trim() || undefined
      };
      const res = await onConfirmar(payload);
      if (res.success) onClose();
      else setErrores([res.error || 'Error registrando el gasto']);
    } catch (e: any) {
      setErrores([e?.message || 'Error inesperado']);
    } finally {
      setProcesando(false);
    }
  };

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO').format(value);
  }, []);

  const parseMontoInput = (raw: string) => {
    // Mantener solo dígitos
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10);
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const value = parseMontoInput(raw);
    setMonto(value);
    setMontoInput(value === 0 ? '0' : formatNumber(value));
  };

  const quickSetMonto = (value: number) => {
    setMonto(value);
    setMontoInput(formatNumber(value));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeIfAllowed}
      />

      {/* Slide-over panel (entra de derecha a izquierda) */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-[color:var(--sp-surface-elevated)] shadow-xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
  <div className="flex items-center justify-between p-5 border-b border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
              <span className="text-xl">💸</span> Nuevo Gasto
            </h2>
            <p className="text-xs text-[color:var(--sp-neutral-600)] mt-0.5">Completa la información y registra el gasto</p>
          </div>
          <div className="flex items-center gap-2">
            <AnyButton variant="outline" size="sm" onClick={closeIfAllowed}>
              <IconX className="w-4 h-4" />
            </AnyButton>
          </div>
        </div>

        {/* Content */}
  <div className="h-[calc(100%-120px)] overflow-y-auto p-5 space-y-6">
          {/* Categoría */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Categoría del gasto</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIAS_GASTOS.map((cat) => {
                const selected = categoria === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoria(cat.value)}
                    className={`relative flex items-center gap-2 p-4 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-300)] shadow-sm'
                        : 'bg-[color:var(--sp-surface)] border-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-50)]'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-[color:var(--sp-neutral-900)]">{cat.label}</div>
                      <div className="text-xs text-[color:var(--sp-neutral-500)] capitalize">{cat.value}</div>
                    </div>
                    {selected && (
                      <span className="absolute right-2 top-2 w-5 h-5 rounded-full bg-[color:var(--sp-success-500)] text-[color:var(--sp-on-success)] grid place-items-center">
                        <IconCheck className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Concepto del gasto
                <span className="ml-2 text-[10px] tracking-wide text-[color:var(--sp-neutral-500)]">*campo obligatorio</span>
              </label>
              <AnyButton variant="outline" size="sm" onClick={() => setShowConceptos((v) => !v)} className="text-xs">
                💡 Sugerencias
              </AnyButton>
            </div>
            <textarea
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Compra de verduras, Pago de servicios..."
              className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
              maxLength={VALIDACIONES_GASTOS.CONCEPTO_MAX_LENGTH}
            />
            <p className="text-xs text-[color:var(--sp-neutral-500)]">{concepto.length}/{VALIDACIONES_GASTOS.CONCEPTO_MAX_LENGTH} caracteres</p>
            {showConceptos && conceptosSugeridos.length > 0 && (
              <div className="bg-[color:var(--sp-neutral-50)] rounded-lg p-3 border border-[color:var(--sp-neutral-200)]">
                <p className="text-xs text-[color:var(--sp-neutral-600)] mb-2">Conceptos frecuentes:</p>
                <div className="flex flex-wrap gap-2">
                  {conceptosSugeridos.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setConcepto(s)}
                      className="px-2 py-1 rounded-md border border-[color:var(--sp-neutral-200)] text-xs hover:bg-[color:var(--sp-neutral-100)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Monto gastado</label>
            <div className="relative">
              <AnyInput
                type="text"
                inputMode="numeric"
                value={montoInput}
                onChange={handleMontoChange}
                placeholder="0"
                className="text-center text-3xl font-semibold pr-10"
                aria-label="Monto del gasto en pesos"
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-sm font-medium text-[color:var(--sp-neutral-500)]">$</span>
            </div>
    {limits && (
              <SecurityAlert
                type={securityState && !securityState.valid ? 'error' : securityState?.requiresAuth ? 'warning' : 'info'}
                title={securityState && !securityState.valid ? 'Gasto bloqueado por límite' : securityState?.requiresAuth ? 'Autorización requerida' : 'Límites de seguridad'}
                messages={securityState?.warnings?.length ? securityState.warnings : ['Se aplican límites de control para montos de gastos.']}
                limits={{
      current: (monto || 0),
      limit: (limits.limite_transaccion_normal || 0),
                  label: 'Límite por transacción'
                }}
              />
            )}
            <p className="text-xs text-[color:var(--sp-neutral-500)]">Equivale a: {formatCurrency(Math.round(monto || 0))}</p>
            <div className="space-y-2">
              <label className="text-xs text-[color:var(--sp-neutral-500)]">Montos rápidos</label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {[1000, 5000, 10000, 20000, 50000].map((m) => (
                  <AnyButton key={m} variant="outline" size="sm" onClick={() => quickSetMonto(m)} className="text-xs">
                    {formatNumber(m)}
                  </AnyButton>
                ))}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Notas adicionales (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles adicionales sobre el gasto..."
              className="w-full p-3 border rounded-lg resize-none h-28 text-sm"
              maxLength={VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH}
            />
            <p className="text-xs text-[color:var(--sp-neutral-500)]">{notas.length}/{VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH} caracteres</p>
          </div>

          {errores.length > 0 && (
            <div className="bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg p-3 text-sm text-[color:var(--sp-error-700)]">
              {errores.map((e, i) => (<div key={i}>• {e}</div>))}
            </div>
          )}
        </div>

        {/* Footer */}
  <div className="p-4 border-t bg-[color:var(--sp-surface)] sticky bottom-0 z-10">
          <div className="flex items-center justify-between">
            <AnyButton variant="outline" onClick={closeIfAllowed} disabled={procesando}>
              Cancelar
            </AnyButton>
            <AnyButton onClick={handleConfirmar} disabled={procesando || !canSubmit || (securityState && !securityState.valid)} className="bg-[color:var(--sp-info-600)] hover:bg-[color:var(--sp-info-700)] text-[color:var(--sp-on-info)]">
              {procesando ? 'Registrando...' : 'Registrar Gasto'}
            </AnyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastoWizardSlideOver;

