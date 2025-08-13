import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de moneda centralizado (centavos → moneda local)
export function formatCurrencyCOP(centavos: number, locale: string = 'es-CO', currency: string = 'COP'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format((centavos || 0) / 100);
  } catch {
    // Fallback simple si Intl falla
    const pesos = Math.round((centavos || 0) / 100);
    return `$${pesos.toLocaleString('es-CO')}`;
  }
}

// Conversión básica de string con símbolos → centavos
export function parseCurrencyToCents(input: string): number {
  if (!input) return 0;
  const onlyDigits = input.replace(/[^\d]/g, '');
  const pesos = parseInt(onlyDigits || '0', 10);
  return isNaN(pesos) ? 0 : pesos * 100;
}
