import { useMemo } from 'react';

// Configuración para diferencias de caja
export const DIFERENCIA_CONFIG = {
  UMBRAL_ADVERTENCIA: 5000, // 5.000 pesos - diferencia que requiere confirmación
  UMBRAL_CRITICO: 20000,    // 20.000 pesos - diferencia crítica que requiere justificación
  MAXIMO_PERMITIDO: 100000  // 100.000 pesos - diferencia máxima absoluta permitida
} as const;

export type NivelDiferencia = 'normal' | 'advertencia' | 'critico' | 'excesivo';

export interface DiferenciaCaja {
  valor: number;
  valorAbsoluto: number;
  nivel: NivelDiferencia;
  mensaje: string;
  color: string;
  requiereConfirmacion: boolean;
  requiereJustificacion: boolean;
}

/**
 * Hook para calcular y categorizar diferencias de caja
 */
export const useDiferenciasCaja = (
  saldoCalculado: number,
  saldoReportado: number | null
): DiferenciaCaja | null => {
  return useMemo(() => {
    if (saldoReportado === null || saldoReportado === undefined) {
      return null;
    }

    const diferencia = saldoReportado - saldoCalculado;
    const diferenciaAbsoluta = Math.abs(diferencia);
    
    let nivel: NivelDiferencia;
    let mensaje: string;
    let color: string;
    let requiereConfirmacion = false;
    let requiereJustificacion = false;

    if (diferenciaAbsoluta >= DIFERENCIA_CONFIG.MAXIMO_PERMITIDO) {
      nivel = 'excesivo';
      mensaje = '⚠️ Diferencia excesiva - Revisar urgentemente';
      color = 'var(--sp-error-600)';
      requiereConfirmacion = true;
      requiereJustificacion = true;
    } else if (diferenciaAbsoluta >= DIFERENCIA_CONFIG.UMBRAL_CRITICO) {
      nivel = 'critico';
      mensaje = '🚨 Diferencia crítica - Requiere justificación';
      color = 'var(--sp-error-500)';
      requiereConfirmacion = true;
      requiereJustificacion = true;
    } else if (diferenciaAbsoluta >= DIFERENCIA_CONFIG.UMBRAL_ADVERTENCIA) {
      nivel = 'advertencia';
      mensaje = '⚠️ Diferencia significativa - Confirmar';
      color = 'var(--sp-warning-500)';
      requiereConfirmacion = true;
    } else {
      nivel = 'normal';
      mensaje = diferencia === 0 
        ? '✅ Caja cuadrada perfectamente' 
        : diferencia > 0 
          ? '📈 Sobrante menor' 
          : '📉 Faltante menor';
      color = diferencia === 0 
        ? 'var(--sp-success-600)' 
        : 'var(--sp-neutral-600)';
    }

    return {
      valor: diferencia,
      valorAbsoluto: diferenciaAbsoluta,
      nivel,
      mensaje,
      color,
      requiereConfirmacion,
      requiereJustificacion
    };
  }, [saldoCalculado, saldoReportado]);
};

/**
 * Formatea una diferencia para mostrar con signo y formato de moneda
 */
export const formatearDiferencia = (diferencia: number): string => {
  const signo = diferencia > 0 ? '+' : '';
  return `${signo}$${Math.abs(diferencia).toLocaleString('es-CO')}`;
};

/**
 * Obtiene el color CSS apropiado para un nivel de diferencia
 */
export const getColorDiferencia = (nivel: NivelDiferencia): string => {
  switch (nivel) {
    case 'normal': return 'var(--sp-success-600)';
    case 'advertencia': return 'var(--sp-warning-500)';
    case 'critico': return 'var(--sp-error-500)';
    case 'excesivo': return 'var(--sp-error-600)';
    default: return 'var(--sp-neutral-600)';
  }
};
