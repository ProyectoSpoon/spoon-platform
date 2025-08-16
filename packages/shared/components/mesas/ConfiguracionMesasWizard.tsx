"use client";

import React, { useMemo, useState } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';

export interface WizardDistribucion {
  [zona: string]: number;
}

export interface ConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurar: (totalMesas: number, distribucion: WizardDistribucion) => Promise<boolean>;
  loading?: boolean;
  configuracionActual?: { configuradas?: boolean; totalMesas?: number; zonas?: string[] } | null;
}

const steps = ["Cantidad", "Distribución", "Resumen"] as const;

type Step = typeof steps[number];

const ConfiguracionMesasWizard: React.FC<ConfigWizardProps> = ({ isOpen, onClose, onConfigurar, loading, configuracionActual }) => {
  const [step, setStep] = useState<Step>('Cantidad');
  const [totalMesas, setTotalMesas] = useState<number>(configuracionActual?.totalMesas || 0);
  const zonasOrigen = useMemo<string[]>(() => {
    const z = configuracionActual?.zonas ?? [];
    return z.length > 0 ? z : ['Principal'];
  }, [configuracionActual]);
  const [distribucion, setDistribucion] = useState<WizardDistribucion>({});
  const [error, setError] = useState<string | null>(null);

  const zonasValidas = zonasOrigen;
  const totalDistribuido = useMemo(() => Object.values(distribucion).reduce((s, n) => s + (Number.isFinite(n) ? Number(n) : 0), 0), [distribucion]);

  const next = () => {
    if (step === 'Cantidad') {
      if (!Number.isFinite(totalMesas) || totalMesas <= 0) {
        setError('Ingresa una cantidad válida (> 0).');
        return;
      }
  setError(null);
  setStep('Distribución');
  return;
    }
  if (step === 'Distribución') {
      if (totalDistribuido !== totalMesas) {
        setError('La distribución debe sumar exactamente el total de mesas.');
        return;
      }
      setError(null);
      setStep('Resumen');
      return;
    }
  };

  const back = () => {
    setError(null);
  if (step === 'Distribución') setStep('Cantidad');
  else if (step === 'Resumen') setStep('Distribución');
  };

  const confirmar = async () => {
    setError(null);
    const ok = await onConfigurar(totalMesas, distribucion);
    if (ok) onClose();
    else setError('No se pudo configurar. Intenta de nuevo.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[--sp-overlay]" onClick={onClose} />
      {/* Panel deslizante derecha -> izquierda */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-[--sp-surface] shadow-2xl border-l border-[color:var(--sp-neutral-200)] transform transition-transform duration-300 translate-x-0 overflow-hidden">
        {/* Header estilo página */}
        <div className="px-6 py-4 border-b border-[color:var(--sp-neutral-200)] flex items-center justify-between bg-[--sp-surface]">
          <div>
            <h2 className="text-lg font-medium text-[color:var(--sp-neutral-900)]">Configuración de Mesas</h2>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">Paso {steps.indexOf(step) + 1} de {steps.length} • {step}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[color:var(--sp-neutral-50)] rounded-lg transition-colors">✕</button>
        </div>

        {/* Body por pasos */}
  <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-[color:var(--sp-error-700)] bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded px-3 py-2">{error}</div>
          )}

          {step === 'Cantidad' && (
            <div className="space-y-2">
              <label className="text-sm text-[color:var(--sp-neutral-700)]">¿Cuántas mesas tendrá el restaurante?</label>
              <input
                type="number"
                className="w-40 border border-[color:var(--sp-neutral-300)] rounded-lg px-3 py-2 bg-[--sp-surface]"
                value={totalMesas}
                min={1}
                onChange={(e) => setTotalMesas(Number(e.target.value))}
              />
              <p className="text-xs text-[color:var(--sp-neutral-500)]">Puedes ajustarlo más adelante.</p>
            </div>
          )}

          {step === 'Distribución' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[color:var(--sp-neutral-700)]">Distribución por zona</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {zonasValidas.map(z => (
                    <div key={z} className="flex items-center justify-between gap-2 border border-[color:var(--sp-neutral-300)] rounded-lg px-3 py-2 bg-[--sp-surface]">
                      <span className="text-sm text-[color:var(--sp-neutral-700)]">{z}</span>
                      <input
                        type="number"
                        className="w-24 border border-[color:var(--sp-neutral-300)] rounded-lg px-2 py-1 bg-[--sp-surface]"
                        value={distribucion[z] ?? 0}
                        min={0}
                        onChange={(e) => setDistribucion(prev => ({ ...prev, [z]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">Suma: {totalDistribuido} / {totalMesas}</p>
              </div>
            </div>
          )}

          {step === 'Resumen' && (
            <div className="space-y-3">
              <div className="text-sm text-[color:var(--sp-neutral-700)]">Cantidad total: <strong>{totalMesas}</strong></div>
              <div className="text-sm text-[color:var(--sp-neutral-700)]">Zonas: {zonasValidas.join(', ')}</div>
              <div className="text-sm text-[color:var(--sp-neutral-700)]">Distribución:</div>
              <ul className="list-disc ml-6 text-sm text-[color:var(--sp-neutral-700)]">
                {zonasValidas.map(z => (
                  <li key={z}>{z}: {distribucion[z] ?? 0}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer estilo página */}
        <div className="px-6 py-4 border-t border-[color:var(--sp-neutral-200)] bg-[--sp-surface] flex items-center justify-between">
          <div className="text-xs text-[color:var(--sp-neutral-500)]">Distribuye la cantidad entre las zonas existentes.</div>
          <div className="flex gap-2">
            {step !== 'Cantidad' && (
              <button className="px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] transition-colors" onClick={back}>Atrás</button>
            )}
            {step !== 'Resumen' ? (
              <button className="px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors disabled:opacity-50" onClick={next} disabled={loading}>Siguiente</button>
            ) : (
              <button className="px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors disabled:opacity-50" onClick={confirmar} disabled={loading}>Confirmar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionMesasWizard;
