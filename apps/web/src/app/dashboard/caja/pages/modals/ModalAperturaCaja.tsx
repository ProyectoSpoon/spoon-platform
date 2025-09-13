'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
// Selector de cajero eliminado

// Type casting to fix React version conflicts in monorepo
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;
const ButtonComponent = Button as any;
const InputComponent = Input as any;
// Eliminados servicios de usuarios y current user

interface ModalAperturaCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (montoInicial: number, notas?: string) => Promise<{ success: boolean; error?: string } | void>;
  loading?: boolean;
}

const ModalAperturaCaja: React.FC<ModalAperturaCajaProps> = ({ isOpen, onClose, onConfirmar, loading = false }) => {
  const [monto, setMonto] = useState<string>('');
  const [montoMasked, setMontoMasked] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const MAX_MONTO = 10000000; // 10,000,000 COP
  const montoInputRef = useRef<HTMLInputElement | null>(null);
  // Control para cancelar requests en cierre/unmount
  const abortRef = useRef<AbortController | null>(null);

  // Crear/abortar controlador según estado del modal y limpiar en unmount
  useEffect(() => {
    if (isOpen) {
      abortRef.current = new AbortController();
    } else {
      abortRef.current?.abort();
    }
    return () => {
      // cleanup on unmount
      abortRef.current?.abort();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setNotas('');
      setError(null);
      setEnviando(false);
      setMontoMasked('');
      // Auto-focus primer campo
      setTimeout(() => {
        try { montoInputRef.current?.focus(); } catch {}
      }, 0);
    }
  }, [isOpen]);

  // Parsear montos escritos con separadores locales (p.ej. 1´550.000) a pesos enteros
  const parseMonto = (val: string) => {
    const digitsOnly = (val || '').replace(/[^0-9]/g, '');
    const n = parseInt(digitsOnly || '0', 10);
    return Number.isFinite(n) ? n : 0;
  };

  const formatMiles = (val: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val || 0);

  const handleMontoChange = (raw: string) => {
    const parsed = parseMonto(raw);
    const clamped = Math.min(MAX_MONTO, Math.max(0, parsed));
    if (parsed !== clamped) {
      setError('Monto máximo permitido: $10,000,000 COP.');
    } else if (error) {
      setError(null);
    }
    setMonto(String(clamped));
    setMontoMasked(clamped ? formatMiles(clamped) : '');
  };

  const setQuickMonto = (val: number) => {
    const clamped = Math.min(MAX_MONTO, Math.max(0, Math.round(val)));
    setMonto(String(clamped));
    setMontoMasked(clamped ? formatMiles(clamped) : '');
    setError(null);
    // Reenfocar en el input para flujo rápido con teclado
    try { montoInputRef.current?.focus(); } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!(enviando || loading)) {
        try { abortRef.current?.abort(); } catch {}
        onClose();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!(enviando || loading)) void handleConfirmar();
    }
  };

  const handleConfirmar = async () => {
    const montoNum = parseMonto(monto);
    // Validación de rango 0 - 10,000,000 COP
    if (monto === '' || isNaN(montoNum) || montoNum < 0 || montoNum > 10000000) {
      setError('Monto debe estar entre $0 y $10,000,000 COP.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
  const signal = abortRef.current?.signal;
      // Enviar en pesos enteros (unificado, sin conversión a centavos)
      const res: any = await onConfirmar(montoNum, notas || undefined);
  // Si se canceló durante la espera, evitar updates de estado
  if (signal?.aborted) return;
  if (!res || res.success) {
        onClose();
      } else if (res?.error) {
        setError(res.error);
      }
    } finally {
  // Evitar updates de estado si ya se abortó
  if (!abortRef.current?.signal.aborted) setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sp-neutral-900)]/60" onKeyDown={handleKeyDown}>
      <CardComponent className="w-full max-w-md shadow-lg">
        <CardHeaderComponent>
          <CardTitleComponent>Abrir caja</CardTitleComponent>
        </CardHeaderComponent>
        <CardContentComponent className="space-y-4">
          {/* Selector de cajero eliminado: el cajero es el usuario autenticado */}
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Monto inicial (COP)</label>
            <InputComponent
              inputMode="numeric"
              placeholder="0"
              value={montoMasked}
              onChange={(e: any) => handleMontoChange(e.target.value)}
              autoFocus
              ref={montoInputRef}
              // Hints for native inputs; enforcement handled in onChange
              maxLength={12}
            />
            <div className="text-xs text-[color:var(--sp-neutral-600)]">Monto en efectivo que tendrás al inicio del turno.</div>
            <div className="flex flex-wrap gap-2 pt-2">
              <ButtonComponent variant="outline" size="sm" onClick={() => setQuickMonto(500000)}>+$500.000</ButtonComponent>
              <ButtonComponent variant="outline" size="sm" onClick={() => setQuickMonto(1000000)}>+$1.000.000</ButtonComponent>
              <ButtonComponent variant="outline" size="sm" onClick={() => setQuickMonto(2000000)}>+$2.000.000</ButtonComponent>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Notas (opcional)</label>
            <InputComponent
              placeholder="Ej: Apertura de turno mañana"
              value={notas}
              onChange={(e: any) => setNotas(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-[color:var(--sp-error-700)]">{error}</div>
          )}
          {!error && parseMonto(monto) === 0 && (
            <div className="text-xs text-[color:var(--sp-neutral-600)]">Apertura con 0 COP registrada. Puedes agregar efectivo luego mediante transacciones.</div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <ButtonComponent
              variant="red"
              onClick={() => {
                try { abortRef.current?.abort(); } catch {}
                onClose();
              }}
              disabled={enviando || loading}
            >
              Cancelar
            </ButtonComponent>
            <ButtonComponent variant="green" onClick={handleConfirmar} disabled={enviando || loading}>
              {enviando || loading ? 'Abriendo…' : 'Abrir caja'}
            </ButtonComponent>
          </div>
        </CardContentComponent>
      </CardComponent>
    </div>
  );
};

export default ModalAperturaCaja;
