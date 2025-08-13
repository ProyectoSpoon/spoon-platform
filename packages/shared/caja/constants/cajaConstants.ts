/**
 * CONSTANTES TEMPORALES PARA CAJA
 * Creadas para resolver imports faltantes durante refactoring
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const CAJA_CONFIG = {
  MONTO_MINIMO_APERTURA: 50000,
  MONTO_MAXIMO_APERTURA: 1000000,
  DENOMINACIONES: [
    1000, 2000, 5000, 10000, 20000, 50000, 100000
  ],
  AUTO_REFRESH_INTERVAL: 30000,
  MONTO_INICIAL_DEFAULT: 100000
};

export const CAJA_MESSAGES = {
  APERTURA_EXITOSA: 'Caja abierta exitosamente',
  CIERRE_EXITOSO: 'Caja cerrada exitosamente',
  ERROR_APERTURA: 'Error al abrir la caja',
  ERROR_CIERRE: 'Error al cerrar la caja',
  SESION_YA_ABIERTA: 'Ya hay una sesión de caja abierta',
  SESION_NO_ENCONTRADA: 'No se encontró una sesión activa',
  MONTO_INVALIDO: 'El monto ingresado no es válido'
};

export const ESTADOS_CAJA = {
  CERRADA: 'cerrada',
  ABIERTA: 'abierta',
  EN_PROCESO: 'en_proceso'
} as const;

export type EstadoCaja = typeof ESTADOS_CAJA[keyof typeof ESTADOS_CAJA];


// Tipos adicionales que pueden necesitar los componentes
export interface ModalState {
  showAbrirModal: boolean;
  showCerrarModal: boolean;
}

export interface CajaState {
  montoInicial: number;
  notasApertura: string;
  notasCierre: string;
}

export const ESTADOS_MODAL = {
  CERRADO: false,
  ABIERTO: true
} as const;
