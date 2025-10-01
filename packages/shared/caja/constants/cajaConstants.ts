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
  MONTO_INICIAL_DEFAULT: 5000000,  // $50,000 pesos en centavos
  REFRESH_INTERVAL: 30000,         // 30 segundos
  DENOMINACIONES_EFECTIVO: [       // Billetes para cálculos
    { valor: 10000000, label: '$100,000' },
    { valor: 5000000, label: '$50,000' },
    // ... más denominaciones
  ],
  // Configuración de cierre automático
  CIERRE_AUTOMATICO: {
    TIEMPO_AVISO_1: 1 * 60 * 60 * 1000,    // 1 hora - primera notificación
    TIEMPO_AVISO_2: 2 * 60 * 60 * 1000,    // 2 horas - segunda notificación
    TIEMPO_ESPERA_RESPUESTA: 5 * 60 * 1000, // 5 minutos - espera respuesta después de 3ra hora
    TIEMPO_AUTO_CIERRE: 3 * 60 * 60 * 1000, // 3 horas - cierre automático si no hay respuesta
    INTERVALO_CHECK: 15 * 60 * 1000,       // Revisar cada 15 minutos
  }
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
