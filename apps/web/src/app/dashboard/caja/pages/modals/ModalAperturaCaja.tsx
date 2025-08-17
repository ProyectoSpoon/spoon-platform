'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';

interface ModalAperturaCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (montoInicial: number, notas?: string) => Promise<{ success: boolean; error?: string } | void>;
  loading?: boolean;
}

const ModalAperturaCaja: React.FC<ModalAperturaCajaProps> = ({ isOpen, onClose, onConfirmar, loading = false }) => {
  const [monto, setMonto] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setNotas('');
      setError(null);
      setEnviando(false);
    }
  }, [isOpen]);

  const parseMonto = (val: string) => {
    const n = Number(val.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const handleConfirmar = async () => {
    const montoNum = parseMonto(monto);
    if (!monto || montoNum <= 0) {
      setError('Ingresa un monto inicial válido (> 0).');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const res: any = await onConfirmar(montoNum, notas || undefined);
      if (!res || res.success) {
        onClose();
      } else if (res?.error) {
        setError(res.error);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sp-neutral-900)]/60">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Abrir caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Monto inicial (COP)</label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Notas (opcional)</label>
            <Input
              placeholder="Ej: Apertura de turno mañana"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-[color:var(--sp-error-700)]">{error}</div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={enviando || loading}>Cancelar</Button>
            <Button variant="green" onClick={handleConfirmar} disabled={enviando || loading}>
              {enviando || loading ? 'Abriendo…' : 'Abrir caja'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModalAperturaCaja;
