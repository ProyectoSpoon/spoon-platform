// packages/shared/types/facturacion/facturaTypes.ts

// Tipos básicos de estados y métodos
export type EstadoFactura = 'emitida' | 'anulada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'digital';

// Interfaz principal de Factura
export interface Factura {
  id: string;
  restaurant_id: string;
  numero_factura: string;
  transaccion_id: string | null;
  
  // Datos del cliente
  cliente_nombre: string;
  cliente_documento: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  
  // Datos fiscales (en centavos)
  subtotal: number;
  impuestos: number;
  total: number;
  metodo_pago: MetodoPago;
  
  // Información detallada
  datos_json: any;
  
  // Control de estado
  estado: EstadoFactura;
  motivo_anulacion: string | null;
  
  // Auditoría
  generada_at: string;
  generada_por: string;
  anulada_at: string | null;
  anulada_por: string | null;
  created_at: string;
  updated_at: string;
}

// Interfaz para Numeración de Facturas
export interface NumeracionFactura {
  id: string;
  restaurant_id: string;
  prefijo: string;
  numero_actual: number;
  ultimo_usado_at: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para crear nueva factura
export interface NuevaFactura {
  restaurantId: string;
  transaccionId: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  subtotal: number;
  impuestos?: number;
  detallesOrden: any;
  itemsDetalle: any[];
}

// Interfaz para anular factura
export interface AnularFactura {
  facturaId: string;
  motivo: string;
}

// Interfaz para filtros de búsqueda
export interface FiltrosFactura {
  fechaInicio?: string;
  fechaFin?: string;
  numeroFactura?: string;
  clienteNombre?: string;
  metodoPago?: MetodoPago;
  estado?: EstadoFactura;
  limite?: number;
  offset?: number;
}

// Interfaz para reportes de facturación
export interface ReporteFacturacion {
  totalFacturas: number;
  totalVentas: number;
  facturasPorEstado: Record<EstadoFactura, number>;
  ventasPorMetodo: Record<MetodoPago, number>;
  ventasPorDia: Record<string, {
    ventas: number;
    facturas: number;
  }>;
  promedioFactura: number;
  facturasMasGrandes: Factura[];
}

// Interfaz para estadísticas de período
export interface EstadisticasPeriodo {
  fechaInicio: string;
  fechaFin: string;
}

// Interfaz extendida de factura con joins
export interface FacturaConTransaccion extends Factura {
  transacciones_caja?: {
    monto_total: number;
    procesada_at: string;
    caja_sesiones: {
      cajero: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  };
}

// Tipos para componentes UI
export interface DatosCliente {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
}

// Interfaz para vista previa de factura
export interface VistaPreviewFactura {
  numeroFactura: string;
  cliente: DatosCliente;
  items: ItemFactura[];
  subtotal: number;
  impuestos: number;
  total: number;
  metodoPago: MetodoPago;
}

// Interfaz para items de factura
export interface ItemFactura {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
}

// Tipos para estados de loading
export type EstadoCarga = 'idle' | 'loading' | 'success' | 'error';

// Interfaz para estado de hook useFacturas
export interface EstadoFacturas {
  facturas: Factura[];
  facturaActual: Factura | null;
  estadoCarga: EstadoCarga;
  error: string | null;
  filtros: FiltrosFactura;
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
  };
}

// Tipos para acciones de facturas
export type AccionFactura = 
  | { type: 'SET_LOADING' }
  | { type: 'SET_FACTURAS'; payload: Factura[] }
  | { type: 'SET_FACTURA_ACTUAL'; payload: Factura | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_FILTROS'; payload: Partial<FiltrosFactura> }
  | { type: 'RESET_ERROR' }
  | { type: 'AGREGAR_FACTURA'; payload: Factura }
  | { type: 'ACTUALIZAR_FACTURA'; payload: Factura }
  | { type: 'ANULAR_FACTURA'; payload: { id: string; motivo: string } };

// Interfaz para configuración de impresión
export interface ConfiguracionImpresion {
  formato: 'pdf' | 'termica';
  incluirLogo: boolean;
  copias: number;
  imprimirAutomatico: boolean;
}

// Tipos para validaciones
export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

// Interfaz para respuesta de API
export interface RespuestaAPI<T> {
  data: T | null;
  error: any;
}

// Tipos para props de componentes
export interface GeneradorFacturaProps {
  transaccion: any; // Esto se definirá mejor cuando tengamos los tipos de caja
  onFacturaGenerada: (factura: Factura) => void;
  onCerrar: () => void;
}

export interface BuscadorFacturasProps {
  filtros: FiltrosFactura;
  onFiltrosChange: (filtros: Partial<FiltrosFactura>) => void;
  onBuscar: () => void;
}

export interface ListaFacturasProps {
  facturas: Factura[];
  cargando: boolean;
  onVerDetalle: (factura: Factura) => void;
  onAnular: (factura: Factura) => void;
  onImprimir: (factura: Factura) => void;
}

export interface DetalleFacturaProps {
  factura: FacturaConTransaccion;
  onCerrar: () => void;
  onAnular: (motivo: string) => void;
  onImprimir: () => void;
}

export interface ModalAnularFacturaProps {
  factura: Factura;
  onAnular: (motivo: string) => void;
  onCerrar: () => void;
}

export interface ReportesAvanzadosProps {
  restaurantId: string;
}

// Constantes como tipos
export const ESTADOS_FACTURA: Record<EstadoFactura, string> = {
  emitida: 'Emitida',
  anulada: 'Anulada'
} as const;

export const METODOS_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  digital: 'Digital'
} as const;