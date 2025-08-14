// ========================================
// CONSTANTES PARA SISTEMA DE DOMICILIOS
// File: domicilios/constants/domiciliosConstants.ts
// ========================================

// ✅ ESTADOS DE PEDIDOS
export const ESTADOS_PEDIDO = {
  RECIBIDO: 'received',
  COCINANDO: 'cooking', 
  LISTO: 'ready',
  ENVIADO: 'sent',
  ENTREGADO: 'delivered',
  PAGADO: 'paid'
} as const;

export const ESTADOS_LABELS = {
  [ESTADOS_PEDIDO.RECIBIDO]: 'Recibido',
  [ESTADOS_PEDIDO.COCINANDO]: 'Cocinando',
  [ESTADOS_PEDIDO.LISTO]: 'Listo',
  [ESTADOS_PEDIDO.ENVIADO]: 'En camino',
  [ESTADOS_PEDIDO.ENTREGADO]: 'Entregado',
  [ESTADOS_PEDIDO.PAGADO]: 'Pagado'
} as const;

export const ESTADOS_COLORS = {
  [ESTADOS_PEDIDO.RECIBIDO]: 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]',
  [ESTADOS_PEDIDO.COCINANDO]: 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]',
  [ESTADOS_PEDIDO.LISTO]: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]',
  [ESTADOS_PEDIDO.ENVIADO]: 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]',
  [ESTADOS_PEDIDO.ENTREGADO]: 'bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]',
  [ESTADOS_PEDIDO.PAGADO]: 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'
} as const;

// ✅ ESTADOS DE DOMICILIARIOS
export const ESTADOS_DOMICILIARIO = {
  DISPONIBLE: 'available',
  OCUPADO: 'busy',
  DESCONECTADO: 'offline'
} as const;

export const DOMICILIARIO_LABELS = {
  [ESTADOS_DOMICILIARIO.DISPONIBLE]: 'Disponible',
  [ESTADOS_DOMICILIARIO.OCUPADO]: 'Ocupado',
  [ESTADOS_DOMICILIARIO.DESCONECTADO]: 'Desconectado'
} as const;

export const DOMICILIARIO_COLORS = {
  [ESTADOS_DOMICILIARIO.DISPONIBLE]: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]',
  [ESTADOS_DOMICILIARIO.OCUPADO]: 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]',
  [ESTADOS_DOMICILIARIO.DESCONECTADO]: 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'
} as const;

// ✅ ICONOS POR ESTADO
export const ESTADO_ICONS = {
  [ESTADOS_PEDIDO.RECIBIDO]: '📞',
  [ESTADOS_PEDIDO.COCINANDO]: '🍳',
  [ESTADOS_PEDIDO.LISTO]: '📦',
  [ESTADOS_PEDIDO.ENVIADO]: '🚴‍♂️',
  [ESTADOS_PEDIDO.ENTREGADO]: '✅',
  [ESTADOS_PEDIDO.PAGADO]: '💰'
} as const;

export const DOMICILIARIO_ICONS = {
  [ESTADOS_DOMICILIARIO.DISPONIBLE]: '🟢',
  [ESTADOS_DOMICILIARIO.OCUPADO]: '🔴',
  [ESTADOS_DOMICILIARIO.DESCONECTADO]: '⚫'
} as const;

// ✅ CONFIGURACIONES DE NEGOCIO
export const DEFAULT_DELIVERY_FEE = 3000; // .000 COP
export const DEFAULT_ESTIMATED_TIME = 30; // 30 minutos
export const MAX_DELIVERY_DISTANCE = 10; // 10 cuadras

// ✅ EXTRAS PERMITIDOS
export const EXTRAS_DISPONIBLES = [
  {
    id: 'sin_sopa',
    nombre: 'Sin sopa',
    precio: 0,
    tipo: 'quitar'
  },
  {
    id: 'doble_proteina', 
    nombre: 'Doble porción de proteína',
    precio: 2000,
    tipo: 'agregar'
  }
] as const;

// ✅ CONFIGURACIONES DE UI
export const REFRESH_INTERVAL = 30000; // 30 segundos
export const MAX_ORDERS_PER_PAGE = 50;
export const DEFAULT_FILTERS = {
  estado: 'todos',
  domiciliario: 'todos',
  fecha: 'hoy'
} as const;

// ✅ MENSAJES Y TEXTOS
export const MESSAGES = {
  PEDIDO_CREADO: 'Pedido creado exitosamente',
  PEDIDO_ACTUALIZADO: 'Estado del pedido actualizado', 
  DOMICILIARIO_ASIGNADO: 'Domiciliario asignado al pedido',
  PAGO_REGISTRADO: 'Pago registrado correctamente',
  ERROR_CREAR_PEDIDO: 'Error al crear el pedido',
  ERROR_ACTUALIZAR_ESTADO: 'Error al actualizar el estado',
  ERROR_CARGAR_DATOS: 'Error al cargar los datos'
} as const;
