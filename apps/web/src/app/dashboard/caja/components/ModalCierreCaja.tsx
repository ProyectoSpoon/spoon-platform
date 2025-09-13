'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { formatCurrency } from '@spoon/shared/caja/constants/cajaConstants';
import { useDiferenciasCaja, formatearDiferencia, DIFERENCIA_CONFIG } from '../hooks/useDiferenciasCaja';

// Type casting para resolver conflictos de versión de React
const ButtonComponent = Button as any;
const InputComponent = Input as any;
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;

interface ModalCierreCajaProps {
  isOpen: boolean;
  onClose: () => void;
  // saldoReportado y saldoCalculado siempre en PESOS (enteros)
  onConfirm: (saldoReportadoPesos: number, notas: string) => Promise<void>;
  saldoCalculado: number; // PESOS
  loading?: boolean;
}

export const ModalCierreCaja: React.FC<ModalCierreCajaProps> = ({
  isOpen,
  onClose,
  onConfirm,
  saldoCalculado,
  loading = false
}) => {
  // Valor ingresado sin formato (solo dígitos) para evitar límites implícitos por formato
  const [saldoReportadoRaw, setSaldoReportadoRaw] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [justificacion, setJustificacion] = useState<string>('');
  const [confirmacionEntendida, setConfirmacionEntendida] = useState(false);
  const [etapa, setEtapa] = useState<'input' | 'confirmacion'>('input');
  const [overrideExcesivo, setOverrideExcesivo] = useState(false);

  // Calcular diferencia en tiempo real
  const saldoNumerico = saldoReportadoRaw === '' ? null : parseInt(saldoReportadoRaw, 10);
  
  // Ahora asumimos que saldoCalculado ya viene en PESOS (normalizado en la página contenedora)
  const diferencia = useDiferenciasCaja(saldoCalculado, saldoNumerico);

  // Reset cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
  setSaldoReportadoRaw('');
      setNotas('');
      setJustificacion('');
      setConfirmacionEntendida(false);
      setEtapa('input');
    }
  }, [isOpen]);

  // Validaciones
  const saldoValido = saldoNumerico !== null && saldoNumerico >= 0;
  const justificacionRequerida = diferencia?.requiereJustificacion && !justificacion.trim();
  const confirmacionRequerida = diferencia?.requiereConfirmacion && !confirmacionEntendida;
  
  const excedeMaximo = (diferencia?.valorAbsoluto || 0) >= DIFERENCIA_CONFIG.MAXIMO_PERMITIDO;
  const puedeConfirmar = saldoValido && 
                        !justificacionRequerida && 
                        !confirmacionRequerida &&
                        (!excedeMaximo || (excedeMaximo && overrideExcesivo));

  const handleSiguiente = () => {
    if (diferencia?.requiereConfirmacion) {
      setEtapa('confirmacion');
    } else {
      handleConfirmar();
    }
  };

  const handleConfirmar = async () => {
    if (!puedeConfirmar || saldoNumerico === null) return;
    
    const notasFinal = [
      notas,
      justificacion && `Justificación de diferencia: ${justificacion}`
    ].filter(Boolean).join('\n\n');
    
    await onConfirm(saldoNumerico, notasFinal);
  };

  const formatearMiles = (n: number) => n.toLocaleString('es-CO');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[color:color-mix(in_srgb,black_50%,transparent)] flex items-center justify-center z-50 p-4">
      <CardComponent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeaderComponent>
          <CardTitleComponent className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            {etapa === 'input' ? 'Cerrar Caja' : 'Confirmar Cierre'}
          </CardTitleComponent>
        </CardHeaderComponent>
        
        <CardContentComponent className="space-y-6">
          {etapa === 'input' && (
            <>
              {/* Información del saldo calculado */}
              <div className="bg-[color:var(--sp-primary-50)] border border-[color:var(--sp-primary-200)] rounded-lg p-4">
                <h3 className="font-semibold text-[color:var(--sp-primary-800)] mb-2">Saldo Calculado del Sistema</h3>
                <p className="text-2xl font-bold text-[color:var(--sp-primary-900)]">
                  ${saldoCalculado.toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-[color:var(--sp-primary-600)] mt-1">
                  Basado en transacciones registradas
                </p>
              </div>

              {/* Input del saldo reportado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--sp-neutral-700)]">
                  Saldo Final en Efectivo Contado *
                </label>
                <InputComponent
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={saldoReportadoRaw}
                  onChange={(e: any) => {
                    // Mantener solo dígitos, permitir hasta 12 (billones) para evitar overflow
                    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setSaldoReportadoRaw(soloDigitos);
                  }}
                  placeholder="Ej: 150000"
                  className="text-lg font-mono tracking-wide"
                  autoFocus
                />
                {saldoNumerico !== null && (
                  <p className="text-xs text-[color:var(--sp-neutral-500)]">
                    Preview: {formatearMiles(saldoNumerico)}
                  </p>
                )}
                <p className="text-xs text-[color:var(--sp-neutral-500)]">
                  Ingresa el dinero físico contado en la caja
                </p>
              </div>

              {/* Mostrar diferencia en tiempo real */}
              {diferencia && (
                <div 
                  className="border rounded-lg p-4"
                  style={{ 
                    borderColor: diferencia.color,
                    backgroundColor: `color-mix(in srgb, ${diferencia.color} 5%, transparent)`
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Diferencia:</span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: diferencia.color }}
                    >
                      {formatearDiferencia(diferencia.valor)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: diferencia.color }}>
                    {diferencia.mensaje}
                  </p>
                  
                  {diferencia.nivel === 'excesivo' && (
                    <div className="mt-3 space-y-3 p-3 bg-[color:var(--sp-error-100)] border border-[color:var(--sp-error-300)] rounded">
                      <p className="text-sm text-[color:var(--sp-error-800)] font-medium leading-relaxed">
                        ⚠️ Diferencia excede el máximo automático. Revisa y continúa solo si estás seguro.
                      </p>
                      <p className="text-xs text-[color:var(--sp-error-700)]">
                        Podrás forzar el cierre en la siguiente pantalla marcando la casilla de confirmación.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Justificación para diferencias críticas */}
              {diferencia?.requiereJustificacion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--sp-error-700)]">
                    Justificación de la Diferencia *
                  </label>
                  <textarea
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    placeholder="Explica la razón de esta diferencia significativa..."
                    className="w-full p-3 border border-[color:var(--sp-error-300)] rounded-md resize-none h-20 text-sm"
                    required
                  />
                </div>
              )}

              {/* Notas generales */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--sp-neutral-700)]">
                  Notas de Cierre (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Observaciones generales del cierre..."
                  className="w-full p-3 border rounded-md resize-none h-20 text-sm"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <ButtonComponent
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </ButtonComponent>
                <ButtonComponent
                  onClick={handleSiguiente}
                  disabled={!saldoValido || justificacionRequerida || loading}
                  className="flex-1 bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {diferencia?.requiereConfirmacion ? 'Siguiente' : 'Cerrar Caja'}
                </ButtonComponent>
              </div>
            </>
          )}

          {etapa === 'confirmacion' && diferencia && (
            <>
              {/* Resumen de la operación */}
              <div className="space-y-4">
                <div className="bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Resumen del Cierre</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Saldo calculado:</span>
                      <span>${saldoCalculado.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saldo reportado:</span>
                      <span>${(saldoNumerico || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Diferencia:</span>
                      <span style={{ color: diferencia.color }}>
                        {formatearDiferencia(diferencia.valor)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Advertencia según el nivel */}
                <div 
                  className="border rounded-lg p-4"
                  style={{ 
                    borderColor: diferencia.color,
                    backgroundColor: `color-mix(in srgb, ${diferencia.color} 10%, transparent)`
                  }}
                >
                  <p className="font-medium" style={{ color: diferencia.color }}>
                    {diferencia.mensaje}
                  </p>
                  {diferencia.nivel === 'critico' && (
                    <p className="text-sm mt-2 text-[color:var(--sp-neutral-700)]">
                      Esta diferencia será registrada en el sistema de auditoría y notificada 
                      a los administradores para su revisión.
                    </p>
                  )}
                  {diferencia.nivel === 'excesivo' && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-[color:var(--sp-error-700)] font-medium">
                        Esta diferencia supera el máximo automático. Solo un responsable autorizado debe forzar el cierre.
                      </p>
                      <div className="flex items-start gap-2 p-3 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded">
                        <input
                          id="override-excesivo"
                          type="checkbox"
                          checked={overrideExcesivo}
                          onChange={(e)=> setOverrideExcesivo(e.target.checked)}
                          className="mt-1"
                        />
                        <label htmlFor="override-excesivo" className="text-xs leading-relaxed text-[color:var(--sp-error-800)]">
                          Forzar cierre de caja reconociendo la diferencia registrada y guardando la justificación.
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkbox de confirmación */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirmacion"
                    checked={confirmacionEntendida}
                    onChange={(e) => setConfirmacionEntendida(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="confirmacion" className="text-sm text-[color:var(--sp-neutral-700)]">
                    Confirmo que he verificado el conteo de efectivo y entiendo 
                    que esta diferencia será registrada en el sistema.
                  </label>
                </div>
              </div>

              {/* Botones de confirmación */}
              <div className="flex gap-3">
                <ButtonComponent
                  variant="outline"
                  onClick={() => setEtapa('input')}
                  className="flex-1"
                  disabled={loading}
                >
                  Revisar
                </ButtonComponent>
                <ButtonComponent
                  onClick={handleConfirmar}
                  disabled={!puedeConfirmar || loading}
                  className="flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: diferencia.color,
                    borderColor: diferencia.color
                  }}
                >
                  {loading ? 'Cerrando...' : (diferencia.nivel === 'excesivo' ? 'Forzar y Cerrar' : 'Confirmar Cierre')}
                </ButtonComponent>
              </div>
            </>
          )}
        </CardContentComponent>
      </CardComponent>
    </div>
  );
};
