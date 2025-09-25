/**
 * MENSAJES UNIFICADOS PARA EL MÓDULO DE CAJA
 * Centralizados para consistencia en UI y logs
 */

// Códigos de error de dominio
export enum CAJA_ERROR_CODES {
  // Sesiones
  CAJA_YA_ABIERTA = 'CAJA_YA_ABIERTA',
  SESION_NO_ENCONTRADA = 'SESION_NO_ENCONTRADA',
  SESION_CERRADA = 'SESION_CERRADA',
  SESION_EXPIRADA = 'SESION_EXPIRADA',

  // Permisos
  PERMISO_DENEGADO = 'PERMISO_DENEGADO',
  USUARIO_NO_AUTENTICADO = 'USUARIO_NO_AUTENTICADO',
  ROL_INSUFICIENTE = 'ROL_INSUFICIENTE',

  // Operaciones
  MONTO_INVALIDO = 'MONTO_INVALIDO',
  MONTO_INSUFICIENTE = 'MONTO_INSUFICIENTE',
  MONTO_NEGATIVO = 'MONTO_NEGATIVO',
  MONTO_FUERA_RANGO = 'MONTO_FUERA_RANGO',

  // Pagos
  METODO_PAGO_INVALIDO = 'METODO_PAGO_INVALIDO',
  ORDEN_YA_PAGADA = 'ORDEN_YA_PAGADA',
  ORDEN_NO_ENCONTRADA = 'ORDEN_NO_ENCONTRADA',

  // Gastos
  GASTO_INVALIDO = 'GASTO_INVALIDO',
  CATEGORIA_INVALIDA = 'CATEGORIA_INVALIDA',

  // Conexión
  CONEXION_FALLIDA = 'CONEXION_FALLIDA',
  RPC_NO_DISPONIBLE = 'RPC_NO_DISPONIBLE',
  BASE_DATOS_ERROR = 'BASE_DATOS_ERROR',

  // Validaciones
  REQUIERE_CAJA_ABIERTA = 'REQUIERE_CAJA_ABIERTA',
  REQUIERE_CAJA_CERRADA = 'REQUIERE_CAJA_CERRADA',
  VALIDACION_FALLIDA = 'VALIDACION_FALLIDA'
}

// Mensajes de usuario (UI)
export const CAJA_MESSAGES = {
  // Éxitos
  CAJA_ABIERTA: 'Caja abierta exitosamente',
  CAJA_CERRADA: 'Caja cerrada exitosamente',
  PAGO_PROCESADO: 'Pago procesado correctamente',
  GASTO_REGISTRADO: 'Gasto registrado correctamente',
  VENTA_REGISTRADA: 'Venta registrada correctamente',

  // Errores de sesión
  [CAJA_ERROR_CODES.CAJA_YA_ABIERTA]: 'Ya existe una caja abierta',
  [CAJA_ERROR_CODES.SESION_NO_ENCONTRADA]: 'No se encontró una sesión activa',
  [CAJA_ERROR_CODES.SESION_CERRADA]: 'La sesión de caja ya está cerrada',
  [CAJA_ERROR_CODES.SESION_EXPIRADA]: 'La sesión ha expirado. Vuelva a iniciar sesión',

  // Errores de permisos
  [CAJA_ERROR_CODES.PERMISO_DENEGADO]: 'No tienes permisos para realizar esta acción',
  [CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO]: 'Debe iniciar sesión para continuar',
  [CAJA_ERROR_CODES.ROL_INSUFICIENTE]: 'Tu rol no tiene permisos suficientes',

  // Errores de montos
  [CAJA_ERROR_CODES.MONTO_INVALIDO]: 'El monto ingresado no es válido',
  [CAJA_ERROR_CODES.MONTO_INSUFICIENTE]: 'El monto recibido es insuficiente',
  [CAJA_ERROR_CODES.MONTO_NEGATIVO]: 'El monto no puede ser negativo',
  [CAJA_ERROR_CODES.MONTO_FUERA_RANGO]: 'El monto debe estar entre $0 y $10,000,000',

  // Errores de pagos
  [CAJA_ERROR_CODES.METODO_PAGO_INVALIDO]: 'Método de pago no válido',
  [CAJA_ERROR_CODES.ORDEN_YA_PAGADA]: 'Esta orden ya ha sido pagada',
  [CAJA_ERROR_CODES.ORDEN_NO_ENCONTRADA]: 'Orden no encontrada',

  // Errores de gastos
  [CAJA_ERROR_CODES.GASTO_INVALIDO]: 'Los datos del gasto no son válidos',
  [CAJA_ERROR_CODES.CATEGORIA_INVALIDA]: 'Categoría de gasto no válida',

  // Errores técnicos
  [CAJA_ERROR_CODES.CONEXION_FALLIDA]: 'Error de conexión. Intente nuevamente',
  [CAJA_ERROR_CODES.RPC_NO_DISPONIBLE]: 'Servicio temporalmente no disponible',
  [CAJA_ERROR_CODES.BASE_DATOS_ERROR]: 'Error en la base de datos',

  // Errores de validación
  [CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA]: 'Debe abrir la caja primero',
  [CAJA_ERROR_CODES.REQUIERE_CAJA_CERRADA]: 'La caja debe estar cerrada',
  [CAJA_ERROR_CODES.VALIDACION_FALLIDA]: 'Validación fallida'
};

// Mensajes técnicos (logs)
export const CAJA_LOG_MESSAGES = {
  SESION_ABIERTA: 'Sesión de caja abierta',
  SESION_CERRADA: 'Sesión de caja cerrada',
  PAGO_PROCESADO: 'Pago procesado exitosamente',
  GASTO_CREADO: 'Gasto creado exitosamente',
  ERROR_RPC_FALLBACK: 'RPC no disponible, usando fallback directo',
  ERROR_CONEXION_RETRY: 'Error de conexión, reintentando...',
  VALIDACION_PERMISOS: 'Validando permisos de usuario',
  VALIDACION_ESTADO: 'Validando estado de caja'
};

// Severidades para UI
export enum ERROR_SEVERITY {
  LOW = 'low',       // Información (toast verde)
  MEDIUM = 'medium', // Advertencia (toast amarillo)
  HIGH = 'high',     // Error (toast rojo)
  CRITICAL = 'critical' // Error crítico (modal)
}

// Mapeo de códigos a severidades
export const ERROR_SEVERITIES: Record<CAJA_ERROR_CODES, ERROR_SEVERITY> = {
  [CAJA_ERROR_CODES.CAJA_YA_ABIERTA]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.SESION_NO_ENCONTRADA]: ERROR_SEVERITY.HIGH,
  [CAJA_ERROR_CODES.SESION_CERRADA]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.SESION_EXPIRADA]: ERROR_SEVERITY.CRITICAL,

  [CAJA_ERROR_CODES.PERMISO_DENEGADO]: ERROR_SEVERITY.HIGH,
  [CAJA_ERROR_CODES.USUARIO_NO_AUTENTICADO]: ERROR_SEVERITY.CRITICAL,
  [CAJA_ERROR_CODES.ROL_INSUFICIENTE]: ERROR_SEVERITY.HIGH,

  [CAJA_ERROR_CODES.MONTO_INVALIDO]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.MONTO_INSUFICIENTE]: ERROR_SEVERITY.HIGH,
  [CAJA_ERROR_CODES.MONTO_NEGATIVO]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.MONTO_FUERA_RANGO]: ERROR_SEVERITY.MEDIUM,

  [CAJA_ERROR_CODES.METODO_PAGO_INVALIDO]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.ORDEN_YA_PAGADA]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.ORDEN_NO_ENCONTRADA]: ERROR_SEVERITY.HIGH,

  [CAJA_ERROR_CODES.GASTO_INVALIDO]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.CATEGORIA_INVALIDA]: ERROR_SEVERITY.MEDIUM,

  [CAJA_ERROR_CODES.CONEXION_FALLIDA]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.RPC_NO_DISPONIBLE]: ERROR_SEVERITY.LOW,
  [CAJA_ERROR_CODES.BASE_DATOS_ERROR]: ERROR_SEVERITY.HIGH,

  [CAJA_ERROR_CODES.REQUIERE_CAJA_ABIERTA]: ERROR_SEVERITY.HIGH,
  [CAJA_ERROR_CODES.REQUIERE_CAJA_CERRADA]: ERROR_SEVERITY.MEDIUM,
  [CAJA_ERROR_CODES.VALIDACION_FALLIDA]: ERROR_SEVERITY.HIGH
};

// Exportaciones de atajos con mensajes de uso frecuente en hooks/UI
// Nota: Estas constantes están alineadas con textos ya usados/esperados en tests
export const MSG_SESION_EXPIRADA = 'Sesión expirada. Vuelva a iniciar sesión.';

// Sesión
export const MSG_CAJA_YA_ABIERTA = 'Ya existe una caja abierta';
export const MSG_SIN_SESION = 'No hay sesión de caja abierta';
export const MSG_SIN_SESION_ACTIVA = 'No hay sesión activa';

// Permisos
export const MSG_PERMISOS_ABRIR = 'No tienes permisos para abrir la caja';
export const MSG_PERMISOS_CERRAR = 'No tienes permisos para cerrar la caja';
export const MSG_PERMISOS_PAGOS = 'No tienes permisos para procesar pagos';
export const MSG_PERMISOS_VENTAS = 'No tienes permisos para registrar ventas';

// Montos
export const MSG_MONTO_RANGO = 'Monto fuera de rango permitido';
export const MSG_MONTO_INSUFICIENTE = 'Monto recibido insuficiente';

// Genéricos
export const MSG_ERROR_CONEXION_DB = 'Error de conexión con la base de datos';
export const MSG_ERROR_DESCONOCIDO = 'Error desconocido';

// Operaciones
export const MSG_ABRIR_OK = 'Caja abierta exitosamente';
export const MSG_CERRAR_OK = 'Caja cerrada exitosamente';
export const MSG_ABRIR_FALLO = 'No se pudo abrir la caja';
export const MSG_CERRAR_FALLO = 'No se pudo cerrar la caja';
