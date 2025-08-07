import { MetodoPago, CategoriaGasto } from '../../caja/types/cajaTypes';

// Métodos de pago disponibles
export const METODOS_PAGO: { value: MetodoPago; label: string; icon: string }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'digital', label: 'Digital', icon: '📱' }
];

// Estados de caja
export const ESTADOS_CAJA = {
  ABIERTA: 'abierta' as const,
  CERRADA: 'cerrada' as const
};

// Configuración de caja
export const CAJA_CONFIG = {
  MONTO_INICIAL_DEFAULT: 5000000, // $50,000 en centavos
  REFRESH_INTERVAL: 30000, // 30 segundos
  DENOMINACIONES_EFECTIVO: [
    { valor: 10000000, label: '$100,000' },
    { valor: 5000000, label: '$50,000' },
    { valor: 2000000, label: '$20,000' },
    { valor: 1000000, label: '$10,000' },
    { valor: 500000, label: '$5,000' },
    { valor: 200000, label: '$2,000' },
    { valor: 100000, label: '$1,000' },
    { valor: 50000, label: '$500' }
  ]
};

// Mensajes del sistema
export const CAJA_MESSAGES = {
  CAJA_ABIERTA: 'Caja abierta exitosamente',
  CAJA_CERRADA: 'Caja cerrada exitosamente',
  PAGO_PROCESADO: 'Pago procesado correctamente',
  ERROR_ABRIR_CAJA: 'Error al abrir caja',
  ERROR_CERRAR_CAJA: 'Error al cerrar caja',
  ERROR_PROCESAR_PAGO: 'Error al procesar pago',
  SIN_ORDENES_PENDIENTES: 'No hay órdenes pendientes para cobrar',
  CAJA_YA_ABIERTA: 'Ya hay una caja abierta'
};

// Utilidades de formato
export const formatCurrency = (centavos: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(centavos / 100);
};

export const parseCurrency = (currency: string): number => {
  // Convertir "$25,000" a 2500000 centavos
  const number = currency.replace(/[^\d]/g, '');
  return parseInt(number) * 100;
};

// Categorías de gastos disponibles
export const CATEGORIAS_GASTOS: { value: CategoriaGasto; label: string; icon: string; color: string }[] = [
  { value: 'proveedor', label: 'Proveedor', icon: '🏪', color: 'blue' },
  { value: 'servicios', label: 'Servicios', icon: '⚡', color: 'green' },
  { value: 'suministros', label: 'Suministros', icon: '📦', color: 'orange' },
  { value: 'otro', label: 'Otro', icon: '💼', color: 'gray' }
];

// Conceptos de gastos frecuentes (sugerencias)
export const CONCEPTOS_FRECUENTES = {
  proveedor: [
    'Compra de ingredientes',
    'Carnes y proteínas',
    'Verduras y hortalizas', 
    'Bebidas y licores',
    'Panadería y postres'
  ],
  servicios: [
    'Servicios públicos',
    'Internet y telefonía',
    'Mantenimiento equipos',
    'Limpieza y aseo',
    'Transporte'
  ],
  suministros: [
    'Material de empaque',
    'Productos de limpieza',
    'Utensilios de cocina',
    'Papelería y oficina',
    'Uniformes personal'
  ],
  otro: [
    'Gastos administrativos',
    'Capacitación personal',
    'Publicidad y marketing',
    'Reparaciones menores',
    'Imprevistos'
  ]
};

// Validaciones para gastos
export const VALIDACIONES_GASTOS = {
  MONTO_MINIMO: 100, // $1 en centavos
  MONTO_MAXIMO: 100000000, // $1,000,000 en centavos
  CONCEPTO_MIN_LENGTH: 3,
  CONCEPTO_MAX_LENGTH: 255,
  NOTAS_MAX_LENGTH: 500
};

// Mensajes para gastos
export const GASTOS_MESSAGES = {
  GASTO_CREADO: 'Gasto registrado exitosamente',
  ERROR_CREAR_GASTO: 'Error al registrar el gasto',
  ERROR_ELIMINAR_GASTO: 'Error al eliminar el gasto',
  CONFIRMAR_ELIMINAR: '¿Estás seguro de eliminar este gasto?',
  SIN_GASTOS: 'No hay gastos registrados hoy',
  MONTO_INVALIDO: 'El monto debe ser mayor a $1',
  CONCEPTO_REQUERIDO: 'El concepto es requerido',
  CATEGORIA_REQUERIDA: 'Selecciona una categoría'
};

// Función para obtener color de categoría
export const getColorCategoria = (categoria: CategoriaGasto): string => {
  const categoriaInfo = CATEGORIAS_GASTOS.find(c => c.value === categoria);
  return categoriaInfo?.color || 'gray';
};

// Función para obtener icono de categoría
export const getIconoCategoria = (categoria: CategoriaGasto): string => {
  const categoriaInfo = CATEGORIAS_GASTOS.find(c => c.value === categoria);
  return categoriaInfo?.icon || '💼';
};