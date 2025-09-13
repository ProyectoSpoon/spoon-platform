import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========================================
// MONEDA: AHORA TODO EN PESOS (NO CENTAVOS)
// ========================================
// NOTA: Anteriormente el sistema utilizaba "centavos" (multiplicando *100).
// Se unifica a pesos enteros para simplificar.

// Formateo de moneda centralizado (pesos → COP con separador de miles, sin decimales)
export function formatCurrencyCOP(pesos: number, locale: string = 'es-CO', currency: string = 'COP'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(pesos || 0);
  } catch {
    const safe = Math.round(pesos || 0);
    return `$${safe.toLocaleString('es-CO')}`;
  }
}

// Conversión básica de string con símbolos → pesos (ENTEROS)
export function parseCurrencyToCents(input: string): number { // nombre legado conservado para no romper imports
  if (!input) return 0;
  const onlyDigits = input.replace(/[^\d]/g, '');
  const pesos = parseInt(onlyDigits || '0', 10);
  return isNaN(pesos) ? 0 : pesos;
}

// Alias más explícito (nueva convención)
export const parseCurrencyToPesos = parseCurrencyToCents;
