import { CAJA_ERROR_CODES, CAJA_MESSAGES } from '../constants/messages';

/**
 * UTILIDADES DE VALIDACIÓN CENTRALIZADAS PARA EL MÓDULO DE CAJA
 * Extrae a un helper shared ensureCajaAbiertaYPermisos(action: 'abrir'|'cerrar'|'procesar'|'venta')
 * que haga: Verificación de roles, Validación de sesión abierta (o cerrada para abrir), Estándar de mensajes/códigos
 */

// Tipos de acciones que requieren validación
export type CajaAction = 'abrir' | 'cerrar' | 'procesar_pago' | 'registrar_gasto' | 'venta_directa';

// Estados de caja requeridos por acción
const REQUIRED_CAJA_STATES: Record<CajaAction, 'abierta' | 'cerrada' | 'cualquiera'> = {
  abrir: 'cerrada',
  cerrar: 'abierta',
  procesar_pago: 'abierta',
  registrar_gasto: 'abierta',
  venta_directa: 'abierta'
};

// Roles permitidos por acción
const ALLOWED_ROLES: Record<CajaAction, string[]> = {
  abrir: ['cajero', 'admin', 'administrador', 'propietario', 'restaurant_owner'],
  cerrar: ['cajero', 'admin', 'administrador', 'propietario', 'restaurant_owner'],
  procesar_pago: ['cajero', 'admin', 'administrador', 'propietario', 'restaurant_owner'],
  registrar_gasto: ['cajero', 'admin', 'administrador', 'propietario', 'restaurant_owner'],
  venta_directa: ['cajero', 'admin', 'administrador', 'propietario', 'restaurant_owner']
};

// Interface para resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errorCode?: CAJA_ERROR_CODES;
  errorMessage?: string;
  details?: {
    hasRequiredRole: boolean;
    hasCorrectCajaState: boolean;
    userRoles: string[];
    currentCajaState: string;
  };
}

/**
 * Valida permisos y estado de caja antes de ejecutar una acción
 */
export const ensureCajaAbiertaYPermisos = async (
  action: CajaAction,
  cajaState: 'abierta' | 'cerrada' | null,
  options?: {
    skipRoleCheck?: boolean; // Para testing o modos permisivos
    customRoles?: string[]; // Override de roles permitidos
  }
): Promise<ValidationResult> => {
  const requiredState = REQUIRED_CAJA_STATES[action];
  const allowedRoles = options?.customRoles || ALLOWED_ROLES[action];

  // 1. Validar estado de caja
  const hasCorrectCajaState = requiredState === 'cualquiera' ||
    (requiredState === 'abierta' && cajaState === 'abierta') ||
    (requiredState === 'cerrada' && cajaState === 'cerrada');

  // 2. Validar permisos (si no se salta)
  let hasRequiredRole = true;
  let userRoles: string[] = [];

  if (!options?.skipRoleCheck) {
    try {
      // Import dinámico para permitir mocks en tests (jest.doMock)
      const { getActiveRoles } = await import('@spoon/shared/lib/supabase');
      const roles = await getActiveRoles();
      userRoles = Array.isArray(roles) ? roles.map(r => String(r).toLowerCase()) : [];
      hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
    } catch (error) {
      // En caso de error obteniendo roles, ser permisivo para no bloquear
      console.warn('[ensureCajaAbiertaYPermisos] Error obteniendo roles:', error);
      hasRequiredRole = true; // Permisivo por defecto
      userRoles = ['unknown'];
    }
  }

  // 3. Determinar resultado
  const isValid = hasCorrectCajaState && hasRequiredRole;

  if (!isValid) {
    let errorCode: CAJA_ERROR_CODES;
    let errorMessage: string;

    if (!hasCorrectCajaState) {
      if (requiredState === 'abierta') {
        errorCode = CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA;
        errorMessage = CAJA_MESSAGES[CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA];
      } else if (requiredState === 'cerrada') {
        errorCode = CAJA_ERROR_CODES.REQUIERE_CAJA_CERRADA;
        errorMessage = CAJA_MESSAGES[CAJA_ERROR_CODES.REQUIERE_CAJA_CERRADA];
      } else {
        errorCode = CAJA_ERROR_CODES.VALIDACION_FALLIDA;
        errorMessage = CAJA_MESSAGES[CAJA_ERROR_CODES.VALIDACION_FALLIDA];
      }
    } else if (!hasRequiredRole) {
      errorCode = CAJA_ERROR_CODES.PERMISO_DENEGADO;
      errorMessage = CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO];
    } else {
      errorCode = CAJA_ERROR_CODES.VALIDACION_FALLIDA;
      errorMessage = CAJA_MESSAGES[CAJA_ERROR_CODES.VALIDACION_FALLIDA];
    }

    return {
      isValid: false,
      errorCode,
      errorMessage,
      details: {
        hasRequiredRole,
        hasCorrectCajaState,
        userRoles,
        currentCajaState: cajaState || 'desconocido'
      }
    };
  }

  return {
    isValid: true,
    details: {
      hasRequiredRole,
      hasCorrectCajaState,
      userRoles,
      currentCajaState: cajaState || 'desconocido'
    }
  };
};

/**
 * Valida montos monetarios
 */
export const validateMonto = (monto: number, options?: {
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
}): ValidationResult => {
  const { min = 0, max = 10000000, allowZero = false, allowNegative = false } = options || {};

  if (typeof monto !== 'number' || isNaN(monto)) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.MONTO_INVALIDO,
      errorMessage: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_INVALIDO]
    };
  }

  if (!allowNegative && monto < 0) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.MONTO_NEGATIVO,
      errorMessage: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_NEGATIVO]
    };
  }

  if (!allowZero && monto === 0) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.MONTO_INVALIDO,
      errorMessage: 'El monto debe ser mayor a cero'
    };
  }

  if (monto < min || monto > max) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.MONTO_FUERA_RANGO,
      errorMessage: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_FUERA_RANGO]
    };
  }

  return { isValid: true };
};

/**
 * Valida método de pago
 */
export const validateMetodoPago = (metodo: string): ValidationResult => {
  const metodosValidos = ['efectivo', 'tarjeta', 'digital'];

  if (!metodo || !metodosValidos.includes(metodo.toLowerCase())) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.METODO_PAGO_INVALIDO,
      errorMessage: CAJA_MESSAGES[CAJA_ERROR_CODES.METODO_PAGO_INVALIDO]
    };
  }

  return { isValid: true };
};

/**
 * Valida datos de gasto
 */
export const validateGasto = (gasto: {
  concepto: string;
  monto: number;
  categoria: string;
}): ValidationResult => {
  // Validar concepto
  if (!gasto.concepto || gasto.concepto.trim().length < 3) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.GASTO_INVALIDO,
      errorMessage: 'El concepto debe tener al menos 3 caracteres'
    };
  }

  // Validar monto
  const montoValidation = validateMonto(gasto.monto);
  if (!montoValidation.isValid) {
    return montoValidation;
  }

  // Validar categoría
  const categoriasValidas = ['proveedor', 'servicios', 'suministros', 'otro'];
  if (!gasto.categoria || !categoriasValidas.includes(gasto.categoria)) {
    return {
      isValid: false,
      errorCode: CAJA_ERROR_CODES.CATEGORIA_INVALIDA,
      errorMessage: CAJA_MESSAGES[CAJA_ERROR_CODES.CATEGORIA_INVALIDA]
    };
  }

  return { isValid: true };
};
