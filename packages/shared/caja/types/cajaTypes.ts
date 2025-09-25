// Shared caja types (minimal) to avoid importing app-level types
export type MetodoPago = 'efectivo' | 'tarjeta' | 'digital';

export interface OrdenMin {
  id: string;
  tipo: 'mesa' | 'delivery';
  monto_total: number; // pesos
}

export interface TransaccionCaja {
  id: string;
  caja_sesion_id: string;
  orden_id: string;
  tipo_orden: 'mesa' | 'delivery' | 'directa';
  metodo_pago: MetodoPago;
  monto_total: number; // pesos
  monto_recibido?: number;
  monto_cambio: number;
  procesada_at: string;
  cajero_id: string;
  restaurant_id: string;
}

// Tipos para gastos
export type CategoriaGasto = 'proveedor' | 'servicios' | 'suministros' | 'otro';

export interface GastoCaja {
  id: string;
  concepto: string;
  monto: number; // pesos
  categoria: CategoriaGasto;
  notas?: string;
  comprobante_url?: string;
  created_at: string;
  cajero_id: string;
  caja_sesion_id: string;
}

export interface NuevoGasto {
  concepto: string;
  monto: number; // pesos
  categoria: CategoriaGasto;
  notas?: string;
  comprobante_url?: string;
}
