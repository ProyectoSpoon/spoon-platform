// packages/shared/constants/facturacion/facturaConstants.ts

import { Receipt, CreditCard, Smartphone, CheckCircle, XCircle, FileText } from 'lucide-react';
// Local minimal types to avoid cross-package coupling issues during build
export type EstadoFactura = 'emitida' | 'anulada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'digital';

// =====================================
// ESTADOS DE FACTURA
// =====================================

export const ESTADOS_FACTURA = {
  emitida: {
    value: 'emitida' as EstadoFactura,
    label: 'Emitida',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
    description: 'Factura generada y válida'
  },
  anulada: {
    value: 'anulada' as EstadoFactura,
    label: 'Anulada',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
    description: 'Factura anulada con motivo'
  }
} as const;

// =====================================
// MÉTODOS DE PAGO
// =====================================

export const METODOS_PAGO = {
  efectivo: {
    value: 'efectivo' as MetodoPago,
    label: 'Efectivo',
    shortLabel: 'Efectivo',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Receipt,
    description: 'Pago en efectivo con cambio',
    requiresChange: true
  },
  tarjeta: {
    value: 'tarjeta' as MetodoPago,
    label: 'Tarjeta',
    shortLabel: 'Tarjeta',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: CreditCard,
    description: 'Pago con tarjeta débito o crédito',
    requiresChange: false
  },
  digital: {
    value: 'digital' as MetodoPago,
    label: 'Digital',
    shortLabel: 'Digital',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Smartphone,
    description: 'Pago digital (PSE, Nequi, etc.)',
    requiresChange: false
  }
} as const;

// =====================================
// CONFIGURACIÓN DE FACTURACIÓN
// =====================================

export const CONFIGURACION_FACTURACION = {
  // IVA por defecto (19% en Colombia)
  IVA_DEFAULT: 0.19,
  
  // Prefijo por defecto para numeración
  PREFIJO_DEFAULT: 'FACT',
  
  // Límite de días para anular facturas
  DIAS_LIMITE_ANULACION: 30,
  
  // Límite de facturas por página
  FACTURAS_POR_PAGINA: 20,
  
  // Límite máximo para búsquedas
  LIMITE_MAXIMO_BUSQUEDA: 1000,
  
  // Cliente por defecto
  CLIENTE_DEFAULT: 'Cliente General',
  
  // Formatos de fecha
  FORMATO_FECHA: 'YYYY-MM-DD',
  FORMATO_FECHA_HORA: 'YYYY-MM-DD HH:mm:ss',
  FORMATO_FECHA_DISPLAY: 'DD/MM/YYYY',
  FORMATO_FECHA_HORA_DISPLAY: 'DD/MM/YYYY HH:mm',
  
  // Configuración de moneda
  MONEDA: 'COP',
  MONEDA_SYMBOL: '$',
  DECIMALES: 0
} as const;

// =====================================
// MENSAJES DEL SISTEMA
// =====================================

export const MENSAJES_FACTURACION = {
  // Éxito
  FACTURA_GENERADA: 'Factura generada exitosamente',
  FACTURA_ANULADA: 'Factura anulada correctamente',
  DATOS_GUARDADOS: 'Datos guardados correctamente',
  
  // Errores
  ERROR_GENERAR: 'Error al generar la factura',
  ERROR_ANULAR: 'Error al anular la factura',
  ERROR_CARGAR: 'Error al cargar las facturas',
  ERROR_VALIDACION: 'Por favor corrige los errores',
  ERROR_PERMISOS: 'No tienes permisos para esta acción',
  ERROR_FACTURA_NO_ENCONTRADA: 'Factura no encontrada',
  ERROR_FACTURA_YA_ANULADA: 'La factura ya está anulada',
  
  // Confirmaciones
  CONFIRMAR_ANULAR: '¿Estás seguro de anular esta factura?',
  CONFIRMAR_GENERAR: '¿Confirmas generar esta factura?',
  
  // Loading
  GENERANDO_FACTURA: 'Generando factura...',
  ANULANDO_FACTURA: 'Anulando factura...',
  CARGANDO_FACTURAS: 'Cargando facturas...',
  CARGANDO_REPORTES: 'Generando reportes...',
  
  // Placeholders
  PLACEHOLDER_CLIENTE: 'Nombre del cliente',
  PLACEHOLDER_DOCUMENTO: 'Cédula o NIT',
  PLACEHOLDER_EMAIL: 'email@ejemplo.com',
  PLACEHOLDER_TELEFONO: '300 123 4567',
  PLACEHOLDER_MOTIVO_ANULACION: 'Describe el motivo de la anulación...',
  PLACEHOLDER_BUSCAR_NUMERO: 'Número de factura',
  PLACEHOLDER_BUSCAR_CLIENTE: 'Nombre del cliente',
  
  // Validaciones
  CAMPO_REQUERIDO: 'Este campo es requerido',
  EMAIL_INVALIDO: 'Email inválido',
  TELEFONO_INVALIDO: 'Teléfono debe tener 10 dígitos',
  MONTO_INVALIDO: 'Monto debe ser mayor a 0',
  FECHA_INVALIDA: 'Fecha inválida',
  
  // Estados
  SIN_FACTURAS: 'No hay facturas para mostrar',
  SIN_RESULTADOS: 'No se encontraron resultados',
  TODOS_CARGADOS: 'Todas las facturas han sido cargadas'
} as const;

// =====================================
// FILTROS PREDEFINIDOS
// =====================================

export const FILTROS_RAPIDOS = [
  {
    id: 'hoy',
    label: 'Hoy',
    fechaInicio: () => new Date().toISOString().split('T')[0],
    fechaFin: () => new Date().toISOString().split('T')[0]
  },
  {
    id: 'ayer',
    label: 'Ayer',
    fechaInicio: () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return ayer.toISOString().split('T')[0];
    },
    fechaFin: () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return ayer.toISOString().split('T')[0];
    }
  },
  {
    id: 'semana',
    label: 'Esta semana',
    fechaInicio: () => {
      const hoy = new Date();
      const lunes = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1));
      return lunes.toISOString().split('T')[0];
    },
    fechaFin: () => new Date().toISOString().split('T')[0]
  },
  {
    id: 'mes',
    label: 'Este mes',
    fechaInicio: () => {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    },
    fechaFin: () => new Date().toISOString().split('T')[0]
  },
  {
    id: 'ultimos30',
    label: 'Últimos 30 días',
    fechaInicio: () => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - 30);
      return fecha.toISOString().split('T')[0];
    },
    fechaFin: () => new Date().toISOString().split('T')[0]
  }
] as const;

// =====================================
// CONFIGURACIÓN DE TABLA
// =====================================

export const COLUMNAS_TABLA_FACTURAS = [
  {
    id: 'numero_factura',
    label: 'Número',
    sortable: true,
    width: '120px'
  },
  {
    id: 'cliente_nombre',
    label: 'Cliente',
    sortable: true,
    width: '200px'
  },
  {
    id: 'total',
    label: 'Total',
    sortable: true,
    width: '120px',
    align: 'right' as const
  },
  {
    id: 'metodo_pago',
    label: 'Método',
    sortable: true,
    width: '100px'
  },
  {
    id: 'estado',
    label: 'Estado',
    sortable: true,
    width: '100px'
  },
  {
    id: 'generada_at',
    label: 'Fecha',
    sortable: true,
    width: '140px'
  },
  {
    id: 'acciones',
    label: 'Acciones',
    sortable: false,
    width: '120px'
  }
] as const;

// =====================================
// CONFIGURACIÓN DE IMPRESIÓN
// =====================================

export const CONFIGURACION_IMPRESION = {
  // Formatos disponibles
  FORMATOS: {
    pdf: {
      id: 'pdf',
      label: 'PDF (A4)',
      description: 'Formato estándar para archivo',
      icon: FileText,
      extension: '.pdf'
    },
    termica: {
      id: 'termica',
      label: 'Térmica (80mm)',
      description: 'Para impresoras de recibos',
      icon: Receipt,
      extension: '.txt'
    }
  },
  
  // Configuración por defecto
  DEFAULT: {
    formato: 'pdf' as const,
    incluirLogo: true,
    copias: 1,
    imprimirAutomatico: false
  },
  
  // Tamaños de papel
  TAMAÑOS: {
    a4: { width: 210, height: 297 },
    carta: { width: 216, height: 279 },
    termica: { width: 80, height: 'auto' }
  }
} as const;

// =====================================
// VALIDACIONES
// =====================================

export const VALIDACIONES = {
  CLIENTE_NOMBRE: {
    minLength: 2,
    maxLength: 255,
    required: false
  },
  CLIENTE_DOCUMENTO: {
    minLength: 6,
    maxLength: 20,
    pattern: /^[0-9\-\.]+$/,
    required: false
  },
  CLIENTE_EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false
  },
  CLIENTE_TELEFONO: {
    pattern: /^\d{10}$/,
    required: false
  },
  MOTIVO_ANULACION: {
    minLength: 10,
    maxLength: 500,
    required: true
  },
  MONTO: {
    min: 1,
    max: 999999999, // 999 millones en centavos
    required: true
  }
} as const;

// =====================================
// CONFIGURACIÓN DE REPORTES
// =====================================

export const TIPOS_REPORTE = {
  ventas_diarias: {
    id: 'ventas_diarias',
    label: 'Ventas Diarias',
    descripcion: 'Reporte de ventas agrupadas por día',
    icon: '📊'
  },
  facturas_por_metodo: {
    id: 'facturas_por_metodo',
    label: 'Por Método de Pago',
    descripcion: 'Distribución de ventas por método de pago',
    icon: '💳'
  },
  top_clientes: {
    id: 'top_clientes',
    label: 'Top Clientes',
    descripcion: 'Clientes con mayor facturación',
    icon: '👥'
  },
  anulaciones: {
    id: 'anulaciones',
    label: 'Facturas Anuladas',
    descripcion: 'Reporte de facturas anuladas con motivos',
    icon: '❌'
  }
} as const;

// =====================================
// CLASES CSS UTILITARIAS
// =====================================

export const CLASES_CSS = {
  // Estados
  estadoEmitida: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)] border-[color:var(--sp-success-200)]',
  estadoAnulada: 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)] border-[color:var(--sp-error-200)]',
  
  // Métodos de pago
  metodoPagoEfectivo: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]',
  metodoPagoTarjeta: 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]',
  metodoPagoDigital: 'bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]',
  
  // Botones
  botonPrimario: 'bg-[color:var(--sp-info-600)] hover:bg-[color:var(--sp-info-700)] text-[color:var(--sp-on-info)]',
  botonSecundario: 'bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-700)]',
  botonPeligro: 'bg-[color:var(--sp-error-600)] hover:bg-[color:var(--sp-error-700)] text-[color:var(--sp-on-error)]',
  botonExito: 'bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[color:var(--sp-on-success)]',
  
  // Inputs
  inputNormal: 'border-[color:var(--sp-neutral-300)] focus:border-[color:var(--sp-info-500)] focus:ring-[color:var(--sp-info-500)]',
  inputError: 'border-[color:var(--sp-error-300)] focus:border-[color:var(--sp-error-500)] focus:ring-[color:var(--sp-error-500)]',
  
  // Contenedores
  card: 'bg-[color:var(--sp-surface-elevated)] rounded-lg border shadow-sm',
  modal: 'bg-[color:var(--sp-surface-elevated)] rounded-lg shadow-xl',
  
  // Texto
  montoGrande: 'text-2xl font-bold',
  montoMedio: 'text-lg font-semibold',
  montoPequeno: 'text-sm font-medium'
} as const;

// =====================================
// SHORTCUTS DE TECLADO
// =====================================

export const SHORTCUTS = {
  NUEVA_FACTURA: 'Ctrl+N',
  BUSCAR: 'Ctrl+F',
  IMPRIMIR: 'Ctrl+P',
  ANULAR: 'Ctrl+Delete',
  GUARDAR: 'Ctrl+S',
  CANCELAR: 'Escape'
} as const;

// =====================================
// UTILIDADES DE FORMATO
// =====================================

import { formatCurrencyCOP } from '@spoon/shared/lib/utils';
export const formatearMonto = (centavos: number): string => formatCurrencyCOP(centavos);

export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatearFechaHora = (fecha: string): string => {
  return new Date(fecha).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// =====================================
// FUNCIONES DE UTILIDAD
// =====================================

export const obtenerEstadoConfig = (estado: EstadoFactura) => {
  return ESTADOS_FACTURA[estado];
};

export const obtenerMetodoConfig = (metodo: MetodoPago) => {
  return METODOS_PAGO[metodo];
};

export const obtenerFiltroRapido = (id: string) => {
  return FILTROS_RAPIDOS.find(f => f.id === id);
};

// =====================================
// EXPORTACIÓN CONSOLIDADA
// =====================================

export default {
  ESTADOS_FACTURA,
  METODOS_PAGO,
  CONFIGURACION_FACTURACION,
  MENSAJES_FACTURACION,
  FILTROS_RAPIDOS,
  COLUMNAS_TABLA_FACTURAS,
  CONFIGURACION_IMPRESION,
  VALIDACIONES,
  TIPOS_REPORTE,
  CLASES_CSS,
  SHORTCUTS,
  formatearMonto,
  formatearFecha,
  formatearFechaHora,
  obtenerEstadoConfig,
  obtenerMetodoConfig,
  obtenerFiltroRapido
} as const;