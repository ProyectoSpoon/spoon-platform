/**
 * MANEJO UNIFICADO DE MONEDAS PARA EL MÓDULO DE CAJA
 * Unificar el manejo de unidades (pesos vs centavos) con una capa de conversión central
 * Considerar decimal.js o Dinero.js para evitar errores de redondeo si empiezan a crearse descuentos/impuestos
 */

// Tipos para claridad
export type Pesos = number;  // Montos en pesos (unidades completas)
export type Centavos = number; // Montos en centavos (unidades mínimas)

// Constantes de conversión
export const CENTAVOS_POR_PESO = 100;

/**
 * Convierte pesos a centavos
 * @param pesos Monto en pesos
 * @returns Monto en centavos
 */
export const toCentavos = (pesos: Pesos): Centavos => {
  if (typeof pesos !== 'number' || isNaN(pesos)) {
    throw new Error('Monto en pesos debe ser un número válido');
  }

  // Redondear a 2 decimales para evitar errores de punto flotante
  const redondeado = Math.round(pesos * CENTAVOS_POR_PESO);
  return redondeado;
};

/**
 * Convierte centavos a pesos
 * @param centavos Monto en centavos
 * @returns Monto en pesos
 */
export const toPesos = (centavos: Centavos): Pesos => {
  if (typeof centavos !== 'number' || isNaN(centavos)) {
    throw new Error('Monto en centavos debe ser un número válido');
  }

  return centavos / CENTAVOS_POR_PESO;
};

/**
 * Formatea un monto en centavos a string de pesos colombiano
 * @param centavos Monto en centavos
 * @returns String formateado (ej: "$1.250.000")
 */
export const formatCentavosToCOP = (centavos: Centavos): string => {
  const pesos = toPesos(centavos);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(pesos);
  // Normalizar: algunos navegadores insertan espacio/no-break-space entre '$' y el número.
  // Aseguramos el formato "$1.000" sin espacios para uso consistente en UI/tests.
  return formatted.replace(/\$[\s\u00A0]+/u, '$');
};

/**
 * Parsea un string de pesos colombiano a centavos
 * @param copString String formateado (ej: "$1.250.000" o "1250000")
 * @returns Monto en centavos
 */
export const parseCOPToCentavos = (copString: string): Centavos => {
  if (typeof copString !== 'string') {
    throw new Error('Input debe ser un string');
  }

  // Remover símbolos de moneda y separadores de miles
  const cleaned = copString
    .replace(/[$\s]/g, '') // Remover $ y espacios
    .replace(/\./g, '') // Remover puntos (separadores de miles)
    .replace(',', '.'); // Convertir coma decimal a punto

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error('Formato de moneda inválido');
  }

  return toCentavos(parsed);
};

/**
 * Calcula el cambio en una transacción
 * @param total Total a pagar en centavos
 * @param recibido Monto recibido en centavos
 * @returns Cambio en centavos (nunca negativo)
 */
export const calcularCambio = (total: Centavos, recibido: Centavos): Centavos => {
  if (recibido < total) {
    throw new Error('Monto recibido insuficiente');
  }

  return Math.max(0, recibido - total);
};

/**
 * Suma montos en centavos de forma segura
 * @param montos Array de montos en centavos
 * @returns Suma total en centavos
 */
export const sumarCentavos = (...montos: Centavos[]): Centavos => {
  return montos.reduce((sum, monto) => sum + Math.round(monto), 0);
};

/**
 * Resta montos en centavos de forma segura
 * @param minuendo Monto del que restar
 * @param sustraendo Monto a restar
 * @returns Resultado en centavos
 */
export const restarCentavos = (minuendo: Centavos, sustraendo: Centavos): Centavos => {
  return Math.round(minuendo) - Math.round(sustraendo);
};

/**
 * Multiplica un monto por una cantidad de forma segura
 * @param monto Monto base en centavos
 * @param cantidad Cantidad (puede ser decimal)
 * @returns Resultado en centavos
 */
export const multiplicarCentavos = (monto: Centavos, cantidad: number): Centavos => {
  return Math.round(monto * cantidad);
};

/**
 * Divide un monto de forma segura
 * @param dividendo Monto a dividir en centavos
 * @param divisor Cantidad por la que dividir
 * @returns Resultado en centavos
 */
export const dividirCentavos = (dividendo: Centavos, divisor: number): Centavos => {
  if (divisor === 0) {
    throw new Error('No se puede dividir por cero');
  }

  return Math.round(dividendo / divisor);
};

/**
 * Valida que un monto en centavos sea válido
 * @param centavos Monto en centavos
 * @returns true si es válido
 */
export const esMontoValido = (centavos: Centavos): boolean => {
  return typeof centavos === 'number' &&
         !isNaN(centavos) &&
         isFinite(centavos) &&
         centavos >= 0;
};

/**
 * Redondea un monto en centavos al peso más cercano
 * @param centavos Monto en centavos
 * @returns Monto redondeado en centavos
 */
export const redondearAPesos = (centavos: Centavos): Centavos => {
  const pesos = toPesos(centavos);
  const redondeado = Math.round(pesos);
  return toCentavos(redondeado);
};

/**
 * Calcula porcentaje de un monto
 * @param monto Monto base en centavos
 * @param porcentaje Porcentaje (ej: 10 para 10%)
 * @returns Monto del porcentaje en centavos
 */
export const calcularPorcentaje = (monto: Centavos, porcentaje: number): Centavos => {
  if (porcentaje < 0) {
    throw new Error('Porcentaje no puede ser negativo');
  }

  return Math.round(monto * porcentaje / 100);
};

/**
 * Compara dos montos en centavos con tolerancia para errores de punto flotante
 * @param a Monto A en centavos
 * @param b Monto B en centavos
 * @param tolerancia Tolerancia en centavos (default: 1)
 * @returns true si son iguales dentro de la tolerancia
 */
export const compararCentavos = (a: Centavos, b: Centavos, tolerancia: Centavos = 1): boolean => {
  return Math.abs(a - b) <= tolerancia;
};

/**
 * Utilidades para cálculos de caja
 */
export const cajaUtils = {
  /**
   * Calcula el efectivo teórico en caja
   * @param montoInicial Monto inicial en centavos
   * @param ingresosEfectivo Total ingresos en efectivo en centavos
   * @param egresos Total egresos en centavos
   * @returns Efectivo teórico en centavos
   */
  calcularEfectivoTeorico: (montoInicial: Centavos, ingresosEfectivo: Centavos, egresos: Centavos): Centavos => {
    return sumarCentavos(montoInicial, ingresosEfectivo, -egresos);
  },

  /**
   * Calcula la diferencia entre efectivo contado y teórico
   * @param contado Efectivo contado en centavos
   * @param teorico Efectivo teórico en centavos
   * @returns Diferencia en centavos (positivo = sobrante, negativo = faltante)
   */
  calcularDiferenciaEfectivo: (contado: Centavos, teorico: Centavos): Centavos => {
    return restarCentavos(contado, teorico);
  },

  /**
   * Genera sugerencias de montos para cambio
   * @param total Total a pagar en centavos
   * @returns Array de sugerencias en centavos
   */
  generarSugerenciasCambio: (total: Centavos): Centavos[] => {
    const totalPesos = toPesos(total);
    const sugerencias: Pesos[] = [];

    // Sugerencias comunes en pesos
    const comunes = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

    for (const sugerencia of comunes) {
      if (sugerencia >= totalPesos) {
        sugerencias.push(sugerencia);
        if (sugerencias.length >= 5) break; // Máximo 5 sugerencias
      }
    }

    return sugerencias.map(toCentavos);
  }
};
