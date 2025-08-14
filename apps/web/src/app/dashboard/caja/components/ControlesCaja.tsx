'use client';

import React, { useState } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
// Usar el hook real de la app (no el mock compartido)
import { useCajaSesion } from '../hooks/useCajaSesion';
import { formatCurrency, CAJA_CONFIG, CAJA_MESSAGES } from '@spoon/shared/caja/constants/cajaConstants';

interface ControlesCajaProps {
  className?: string;
}

export const ControlesCaja: React.FC<ControlesCajaProps> = ({ className }) => {
  const { sesionActual, estadoCaja, loading, abrirCaja, cerrarCaja } = useCajaSesion();
  const [montoInicial, setMontoInicial] = useState(CAJA_CONFIG.MONTO_INICIAL_DEFAULT);
  const [notasApertura, setNotasApertura] = useState('');
  const [notasCierre, setNotasCierre] = useState('');
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);

  const handleAbrirCaja = async () => {
    const resultado = await abrirCaja(montoInicial, notasApertura);
    if (resultado.success) {
      setShowAbrirModal(false);
      setNotasApertura('');
    }
  };

  const handleCerrarCaja = async () => {
    const resultado = await cerrarCaja(notasCierre);
    if (resultado.success) {
      setShowCerrarModal(false);
      setNotasCierre('');
    }
  };

  const formatearMonto = (centavos: number) => {
    return formatCurrency(centavos);
  };

  if (estadoCaja === 'abierta' && sesionActual) {
    // Compatibilidad de campos entre hook real (DB) y posibles tipos antiguos del mock
    const montoInicialCents = (sesionActual as any).montoInicial ?? (sesionActual as any).monto_inicial ?? 0;
    const fechaAperturaIso = (sesionActual as any).fechaApertura ?? (sesionActual as any).abierta_at;
    return (
      <div className={`flex items-center justify-between ${className || ''}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[color:var(--sp-success-500)] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-[color:var(--sp-success-700)]">Caja Abierta</span>
          </div>
          <div className="text-sm text-[color:var(--sp-neutral-600)]">
            Monto inicial: <span className="font-semibold">{formatearMonto(montoInicialCents)}</span>
          </div>
          <div className="text-sm text-[color:var(--sp-neutral-600)]">
            Desde: {fechaAperturaIso ? new Date(fechaAperturaIso).toLocaleTimeString('es-CO', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '—'}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowCerrarModal(true)}
          disabled={loading}
          className="text-[color:var(--sp-error-600)] border-[color:var(--sp-error-200)] hover:bg-[color:var(--sp-error-50)]"
        >
          Cerrar Caja
        </Button>

        {showCerrarModal && (
          <div className="fixed inset-0 bg-[color:color-mix(in_srgb,black_50%,transparent)] flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Cerrar Caja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas de cierre (opcional)</label>
                  <textarea
                    value={notasCierre}
                    onChange={(e) => setNotasCierre(e.target.value)}
                    placeholder="Observaciones del cierre..."
                    className="w-full p-2 border rounded-md resize-none h-20"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCerrarModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCerrarCaja}
                    disabled={loading}
                    className="flex-1 bg-[color:var(--sp-error-600)] hover:bg-[color:var(--sp-error-700)]"
                  >
                    {loading ? 'Cerrando...' : 'Cerrar Caja'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <div className="flex items-center space-x-2">
  <div className="w-3 h-3 bg-[color:var(--sp-neutral-400)] rounded-full"></div>
  <span className="text-sm font-medium text-[color:var(--sp-neutral-600)]">Caja Cerrada</span>
      </div>

      <Button
        onClick={() => setShowAbrirModal(true)}
        disabled={loading}
  className="bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)]"
      >
        <span className="mr-2">🏪</span>
        Abrir Caja
      </Button>

      {showAbrirModal && (
  <div className="fixed inset-0 bg-[color:color-mix(in_srgb,black_50%,transparent)] flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Abrir Caja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto inicial en efectivo</label>
                <Input
                  type="number"
                  value={montoInicial / 100}
                  onChange={(e) => setMontoInicial(Math.round(parseFloat(e.target.value || '0') * 100))}
                  placeholder="50000"
                  className="text-right"
                />
                <p className="text-xs text-[color:var(--sp-neutral-500)]">
                  Equivale a: {formatearMonto(montoInicial)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas de apertura (opcional)</label>
                <textarea
                  value={notasApertura}
                  onChange={(e) => setNotasApertura(e.target.value)}
                  placeholder="Observaciones de la apertura..."
                  className="w-full p-2 border rounded-md resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Montos sugeridos</label>
                <div className="grid grid-cols-3 gap-2">
                  {[25000, 50000, 100000].map((monto) => (
                    <Button
                      key={monto}
                      variant="outline"
                      size="sm"
                      onClick={() => setMontoInicial(monto * 100)}
                      className="text-xs"
                    >
                      {new Intl.NumberFormat('es-CO').format(monto)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAbrirModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAbrirCaja}
                  disabled={loading || montoInicial <= 0}
                  className="flex-1"
                >
                  {loading ? 'Abriendo...' : 'Abrir Caja'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
