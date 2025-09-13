import { useState, useEffect } from 'react';
import { obtenerSaldoCalculado, calcularSaldoCaja, type SaldoCalculado } from '../utils/saldoCalculado';

/**
 * Hook para calcular el saldo de caja en tiempo real
 */
export const useSaldoCalculado = (sesionId: string | null, montoInicial: number = 0) => {
  const [saldoCalculado, setSaldoCalculado] = useState<number>(montoInicial);
  const [detallesSaldo, setDetallesSaldo] = useState<SaldoCalculado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularSaldo = async () => {
    if (!sesionId) {
      setSaldoCalculado(montoInicial);
      setDetallesSaldo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detalles = await calcularSaldoCaja(sesionId, montoInicial);
      setSaldoCalculado(detalles.saldoCalculado);
      setDetallesSaldo(detalles);
    } catch (err: any) {
      setError(err.message || 'Error calculando saldo');
      setSaldoCalculado(montoInicial); // Fallback al monto inicial
    } finally {
      setLoading(false);
    }
  };

  // Recalcular cuando cambie la sesión o monto inicial
  useEffect(() => {
    calcularSaldo();
  }, [sesionId, montoInicial]);

  return {
    saldoCalculado,
    detallesSaldo,
    loading,
    error,
    recalcular: calcularSaldo
  };
};
