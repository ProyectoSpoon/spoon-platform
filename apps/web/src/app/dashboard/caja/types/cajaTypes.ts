// Interfaces para sistema de caja
export interface CajaSesion {
  id: string;
  restaurant_id: string;
  cajero_id: string;
  monto_inicial: number; // En centavos
  estado: 'abierta' | 'cerrada';
  abierta_at: string;
  cerrada_at?: string;
  notas_apertura?: string;
  notas_cierre?: string;
}

export interface TransaccionCaja {
  id: string;
  caja_sesion_id: string;
  orden_id: string;
  tipo_orden: 'mesa' | 'delivery' | 'directa';
  metodo_pago: 'efectivo' | 'tarjeta' | 'digital';
  monto_total: number; // En centavos
  monto_recibido?: number;
  monto_cambio: number;
  procesada_at: string;
  cajero_id: string;
}

export interface OrdenPendiente {
  id: string;
  tipo: 'mesa' | 'delivery';
  identificador: string; // "Mesa 5" o "Juan Pérez"
  monto_total: number;
  fecha_creacion: string;
  detalles?: string;
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'digital';


// Interfaz para gastos de caja
export interface GastoCaja {
  id: string;
  caja_sesion_id: string;
  concepto: string;
  monto: number; // En centavos
  categoria: 'proveedor' | 'servicios' | 'suministros' | 'otro';
  comprobante_url?: string;
  registrado_por: string;
  registrado_at: string;
  notas?: string;
}

// Tipos para categorías de gastos
export type CategoriaGasto = 'proveedor' | 'servicios' | 'suministros' | 'otro';

// Interfaz para crear nuevo gasto
export interface NuevoGasto {
  concepto: string;
  monto: number;
  categoria: CategoriaGasto;
  notas?: string;
  comprobante_url?: string;
}

// Interfaz para resumen de gastos
export interface ResumenGastos {
  totalGastos: number;
  gastosPorCategoria: {
    [key in CategoriaGasto]: number;
  };
  gastosDelDia: GastoCaja[];
}