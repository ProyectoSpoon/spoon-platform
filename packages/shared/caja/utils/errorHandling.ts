import {
  CAJA_ERROR_CODES,
  CAJA_MESSAGES,
  CAJA_LOG_MESSAGES,
  ERROR_SEVERITY,
  ERROR_SEVERITIES
} from '../constants/messages';

/**
 * Sistema de manejo de errores centralizado para el módulo de caja
 * Expande mapeos para errores frecuentes: PGRST116 (no rows), 42501 (RLS), 23505 (duplicate key), timeouts/red (FetchError/TypeError)
 */

// Tipos para respuestas de error
export interface CajaErrorInfo {
  code: CAJA_ERROR_CODES;
  message: string;
  severity: ERROR_SEVERITY;
  originalError?: any;
  suggestedAction?: string;
}

/**
 * Clasifica un error y devuelve información estructurada
 */
export const classifyCajaError = (error: any): CajaErrorInfo => {
  const message = String(error?.message || '');
  const lower = message.toLowerCase();
  const code = error?.code as string;

  // Errores específicos de Supabase/PostgreSQL
  if (code === 'PGRST301' || lower.includes('jwt') || lower.includes('token')) {
    return {
      code: CAJA_ERROR_CODES.SESION_EXPIRADA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.SESION_EXPIRADA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.SESION_EXPIRADA],
      originalError: error,
      suggestedAction: 'Vuelva a iniciar sesión'
    };
  }

  if (code === 'PGRST116' || lower.includes('no rows') || lower.includes('not found')) {
    return {
      code: CAJA_ERROR_CODES.SESION_NO_ENCONTRADA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.SESION_NO_ENCONTRADA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.SESION_NO_ENCONTRADA],
      originalError: error
    };
  }

  if (code === '42501' || lower.includes('permission denied') || lower.includes('insufficient privilege')) {
    return {
      code: CAJA_ERROR_CODES.PERMISO_DENEGADO,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.PERMISO_DENEGADO],
      originalError: error,
      suggestedAction: 'Contacte al administrador'
    };
  }

  if (code === '23505' || lower.includes('duplicate key') || lower.includes('unique constraint')) {
    return {
      code: CAJA_ERROR_CODES.CAJA_YA_ABIERTA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA],
      originalError: error
    };
  }

  // Errores de red/conexión
  if (error instanceof TypeError && lower.includes('fetch')) {
    return {
      code: CAJA_ERROR_CODES.CONEXION_FALLIDA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.CONEXION_FALLIDA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.CONEXION_FALLIDA],
      originalError: error,
      suggestedAction: 'Verifique su conexión a internet'
    };
  }

  if (lower.includes('timeout') || lower.includes('network') || lower.includes('failed to fetch')) {
    return {
      code: CAJA_ERROR_CODES.CONEXION_FALLIDA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.CONEXION_FALLIDA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.CONEXION_FALLIDA],
      originalError: error,
      suggestedAction: 'Intente nuevamente'
    };
  }

  // Errores de negocio específicos
  if (lower.includes('ya existe una caja abierta') || lower.includes('ya existe una sesión')) {
    return {
      code: CAJA_ERROR_CODES.CAJA_YA_ABIERTA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA],
      originalError: error
    };
  }

  if (lower.includes('no hay sesión de caja abierta') || lower.includes('no hay sesión') || lower.includes('no hay caja abierta')) {
    return {
      code: CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA],
      originalError: error,
      suggestedAction: 'Abra la caja primero'
    };
  }

  if (lower.includes('monto insuficiente') || lower.includes('insufficient funds')) {
    return {
      code: CAJA_ERROR_CODES.MONTO_INSUFICIENTE,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_INSUFICIENTE],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.MONTO_INSUFICIENTE],
      originalError: error
    };
  }

  if (lower.includes('monto fuera de rango') || lower.includes('amount out of range')) {
    return {
      code: CAJA_ERROR_CODES.MONTO_FUERA_RANGO,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_FUERA_RANGO],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.MONTO_FUERA_RANGO],
      originalError: error
    };
  }

  if (lower.includes('orden ya pagada') || lower.includes('order already paid')) {
    return {
      code: CAJA_ERROR_CODES.ORDEN_YA_PAGADA,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.ORDEN_YA_PAGADA],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.ORDEN_YA_PAGADA],
      originalError: error
    };
  }

  if (lower.includes('no tienes permisos') || lower.includes('permission denied')) {
    return {
      code: CAJA_ERROR_CODES.PERMISO_DENEGADO,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.PERMISO_DENEGADO],
      originalError: error,
      suggestedAction: 'Contacte al administrador'
    };
  }

  if (lower.includes('usuario no autenticado') || lower.includes('not authenticated')) {
    return {
      code: CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO,
      message: CAJA_MESSAGES[CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO],
      severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO],
      originalError: error,
      suggestedAction: 'Inicie sesión'
    };
  }

  // Error genérico
  return {
    code: CAJA_ERROR_CODES.BASE_DATOS_ERROR,
    message: message || CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR],
    severity: ERROR_SEVERITIES[CAJA_ERROR_CODES.BASE_DATOS_ERROR],
    originalError: error,
    suggestedAction: 'Contacte al soporte técnico'
  };
};

/**
 * Función legacy para compatibilidad - devuelve solo el mensaje
 */
export const handleCajaError = (error: any): string => {
  return classifyCajaError(error).message;
};

/**
 * Helper para crear errores de caja estructurados
 */
export const createCajaError = (
  code: CAJA_ERROR_CODES,
  originalError?: any,
  customMessage?: string
): CajaErrorInfo => {
  return {
    code,
    message: customMessage || CAJA_MESSAGES[code],
    severity: ERROR_SEVERITIES[code],
    originalError,
    suggestedAction: getSuggestedAction(code)
  };
};

/**
 * Obtiene acción sugerida basada en código de error
 */
const getSuggestedAction = (code: CAJA_ERROR_CODES): string | undefined => {
  switch (code) {
    case CAJA_ERROR_CODES.SESION_EXPIRADA:
      return 'Vuelva a iniciar sesión';
    case CAJA_ERROR_CODES.PERMISO_DENEGADO:
    case CAJA_ERROR_CODES.ROL_INSUFICIENTE:
      return 'Contacte al administrador';
    case CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA:
      return 'Abra la caja primero';
    case CAJA_ERROR_CODES.CONEXION_FALLIDA:
      return 'Verifique su conexión a internet';
    case CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO:
      return 'Inicie sesión';
    default:
      return 'Contacte al soporte técnico';
  }
};
