'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';

// Type casting to fix React version conflicts in monorepo
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;
const ButtonComponent = Button as any;
const InputComponent = Input as any;
import { OrdenPendiente, MetodoPago } from '../../types/cajaTypes';
import { formatCurrency, METODOS_PAGO, CAJA_CONFIG } from '../../constants/cajaConstants';
// Seguridad
import { useSecurityLimits } from '../../hooks/useSecurityLimits';
import { SecurityAlert } from '../../components/SecurityAlert';

interface ModalProcesarPagoProps {
  orden: OrdenPendiente | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (orden: OrdenPendiente, metodoPago: MetodoPago, montoRecibido?: number) => Promise<{
    success: boolean;
    cambio?: number;
    error?: string;
  }>;
  loading?: boolean;
}

export const ModalProcesarPago: React.FC<ModalProcesarPagoProps> = ({
  orden,
  isOpen,
  onClose,
  onConfirmar,
  loading = false
}) => {
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [cambioCalculado, setCambioCalculado] = useState<number>(0);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagoExitoso, setPagoExitoso] = useState<{ cambio: number } | null>(null);
  // Seguridad
  const { limits, validarMonto } = useSecurityLimits();
  const [securityState, setSecurityState] = useState<{
    valid: boolean;
    warnings: string[];
    requiresAuth: boolean;
  } | null>(null);

  // Reset modal al abrir/cerrar
  useEffect(() => {
    if (isOpen && orden) {
      setMetodoPago('efectivo');
      setMontoRecibido(orden.monto_total);
      setCambioCalculado(0);
      setError(null);
      setPagoExitoso(null);
    }
  }, [isOpen, orden]);

  // Calcular cambio automáticamente
  useEffect(() => {
    if (metodoPago === 'efectivo' && orden) {
      const cambio = Math.max(0, montoRecibido - orden.monto_total);
      setCambioCalculado(cambio);
    } else {
      setCambioCalculado(0);
    }
  }, [montoRecibido, metodoPago, orden]);

  // Validación de seguridad contextual según límite por método de pago
  useEffect(() => {
    if (!orden) {
      setSecurityState(null);
      return;
    }
    try {
      const validation = validarMonto ? validarMonto(orden.monto_total, metodoPago) : { valid: true, warnings: [], requiresAuth: false };
      setSecurityState(validation);
    } catch {
      setSecurityState({ valid: true, warnings: [], requiresAuth: false });
    }
  }, [orden, metodoPago, validarMonto]);

  const handleConfirmarPago = async () => {
    if (!orden) return;

    // Validaciones
    if (metodoPago === 'efectivo' && montoRecibido < orden.monto_total) {
      setError('El monto recibido no puede ser menor al total');
      return;
    }

    // Seguridad: bloquear si inválido, confirmar si requiere autorización
    if (securityState && !securityState.valid) {
      setError(securityState.warnings.join(', ') || 'Transacción bloqueada por seguridad');
      return;
    }
    if (securityState?.requiresAuth) {
      const proceed = window.confirm('Esta transacción requiere autorización de supervisor. ¿Desea continuar?');
      if (!proceed) return;
    }

    try {
      setProcesando(true);
      setError(null);

      const resultado = await onConfirmar(
        orden,
        metodoPago,
        metodoPago === 'efectivo' ? montoRecibido : undefined
      );

      if (resultado.success) {
        setPagoExitoso({
          cambio: resultado.cambio || 0
        });
        
        // Auto-cerrar después de 3 segundos si no hay cambio
        if (metodoPago !== 'efectivo' || cambioCalculado === 0) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setError(resultado.error || 'Error procesando el pago');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => {
    if (!procesando) {
      onClose();
    }
  };

  const getMontosSugeridos = () => {
  if (!orden || metodoPago !== 'efectivo') return [];
  
  const total = orden.monto_total;
  const sugeridos: number[] = [];
  
  // Monto exacto
  sugeridos.push(total);
  
  // Redondeos convenientes
  const denominaciones = [1000000, 500000, 200000, 100000, 50000, 20000, 10000]; // $10k, $5k, etc.
  
  for (const denom of denominaciones) {
    const redondeado = Math.ceil(total / denom) * denom;
    if (redondeado > total && redondeado <= total * 1.5) {
      // Verificar si ya existe antes de agregar
      if (!sugeridos.includes(redondeado)) {
        sugeridos.push(redondeado);
      }
    }
  }
  
  // Ordenar y tomar solo los primeros 4
  return sugeridos.sort((a, b) => a - b).slice(0, 4);
};
  if (!isOpen || !orden) return null;

  // Pantalla de éxito
  if (pagoExitoso) {
    return (
      <div className="fixed inset-0 bg-[color:var(--sp-neutral-950)]/50 flex items-center justify-center z-50">
        <CardComponent className="w-full max-w-md">
          <CardContentComponent className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-[color:var(--sp-success-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">
                ¡Pago Procesado!
              </h3>
              <p className="text-[color:var(--sp-neutral-600)]">
                {orden.identificador} - {formatCurrency(orden.monto_total)}
              </p>
            </div>

            {pagoExitoso.cambio > 0 && (
              <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4 mb-4">
                <div className="font-semibold text-[color:var(--sp-warning-800)]">
                  Cambio a entregar:
                </div>
                <div className="value-number text-[color:var(--sp-warning-900)]">
                  {formatCurrency(pagoExitoso.cambio)}
                </div>
              </div>
            )}

            <ButtonComponent onClick={handleClose} className="w-full">
              Continuar
            </ButtonComponent>
          </CardContentComponent>
        </CardComponent>
      </div>
    );
  }

  return (
  <div className="fixed inset-0 bg-[color:var(--sp-neutral-950)]/50 flex items-center justify-center z-50">
      <CardComponent className="w-full max-w-lg">
        <CardHeaderComponent>
          <CardTitleComponent className="flex items-center justify-between">
            <span>Procesar Pago</span>
            <ButtonComponent
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={procesando}
            >
              ✕
            </ButtonComponent>
          </CardTitleComponent>
        </CardHeaderComponent>
        
        <CardContentComponent className="space-y-6">
          {/* Información de la orden */}
      <div className="bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span>
                  {orden.tipo === 'mesa' ? '🍽️' : '🚚'}
                </span>
                <h3 className="font-semibold">{orden.identificador}</h3>
              </div>
              <div className="text-right">
                <div className="value-number">
                  {formatCurrency(orden.monto_total)}
                </div>
              </div>
            </div>
            {orden.detalles && (
        <p className="text-sm text-[color:var(--sp-neutral-600)]">{orden.detalles}</p>
            )}
          </div>

          {/* Alerta de seguridad contextual */}
      {securityState && limits && (
            <SecurityAlert
              type={!securityState.valid ? 'error' : securityState.requiresAuth ? 'warning' : securityState.warnings.length ? 'info' : 'info'}
              title={!securityState.valid ? 'Transacción bloqueada' : securityState.requiresAuth ? 'Autorización requerida' : 'Verificación de seguridad'}
              messages={securityState.warnings.length ? securityState.warnings : [
                metodoPago === 'efectivo'
                  ? 'Aplican límites especiales para efectivo.'
                  : 'Validación de límites aplicada.'
              ]}
              limits={{
        current: (orden.monto_total || 0),
        limit: (metodoPago === 'efectivo' ? limits.limite_transaccion_efectivo : limits.limite_transaccion_normal),
                label: metodoPago === 'efectivo' ? 'Límite por transacción (efectivo)' : 'Límite por transacción'
              }}
            />
          )}

          {/* Selección de método de pago */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {METODOS_PAGO.map((metodo) => (
                <ButtonComponent
                  key={metodo.value}
                  variant={metodoPago === metodo.value ? "default" : "outline"}
                  onClick={() => setMetodoPago(metodo.value)}
                  disabled={procesando}
                  className="flex flex-col items-center py-3 h-auto"
                >
                  <span className="text-lg mb-1">{metodo.icon}</span>
                  <span className="text-xs">{metodo.label}</span>
                </ButtonComponent>
              ))}
            </div>
          </div>

          {/* Monto recibido (solo para efectivo) */}
          {metodoPago === 'efectivo' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Monto recibido</label>
              <InputComponent
                type="number"
                value={montoRecibido}
                onChange={(e: any) => setMontoRecibido(Math.round(parseFloat(e.target.value || '0')))}
                className="text-right"
                disabled={procesando}
                min={orden.monto_total}
              />

              {/* Montos sugeridos */}
              <div className="space-y-2">
                <label className="text-xs text-[color:var(--sp-neutral-500)]">Montos sugeridos</label>
                <div className="grid grid-cols-2 gap-2">
                  {getMontosSugeridos().map((monto) => (
                    <ButtonComponent
                      key={monto}
                      variant="outline"
                      size="sm"
                      onClick={() => setMontoRecibido(monto)}
                      disabled={procesando}
                      className="text-sm"
                    >
                      {formatCurrency(monto)}
                    </ButtonComponent>
                  ))}
                </div>
              </div>

              {/* Cambio calculado */}
              {cambioCalculado > 0 && (
                <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[color:var(--sp-warning-800)]">
                      Cambio a entregar:
                    </span>
                    <span className="font-bold text-[color:var(--sp-warning-900)]">
                      {formatCurrency(cambioCalculado)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error si monto insuficiente */}
              {montoRecibido < orden.monto_total && (
                <div className="text-sm text-[color:var(--sp-error-600)]">
                  Monto insuficiente. Faltan {formatCurrency(orden.monto_total - montoRecibido)}
                </div>
              )}
            </div>
          )}

          {/* Error general */}
          {error && (
            <div className="bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg p-3">
              <div className="text-sm text-[color:var(--sp-error-700)]">{error}</div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <ButtonComponent
              variant="outline"
              onClick={handleClose}
              disabled={procesando}
              className="flex-1"
            >
              Cancelar
            </ButtonComponent>
            <ButtonComponent
              onClick={handleConfirmarPago}
              disabled={
                procesando || 
                (metodoPago === 'efectivo' && montoRecibido < orden.monto_total) ||
                (securityState && !securityState.valid)
              }
              className="flex-1 bg-[color:var(--sp-info-600)] hover:bg-[color:var(--sp-info-700)]"
            >
              {procesando ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[color:var(--sp-on-info)] border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                `Confirmar Pago`
              )}
            </ButtonComponent>
          </div>
        </CardContentComponent>
      </CardComponent>
    </div>
  );
};