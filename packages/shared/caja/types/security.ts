// Tipos compartidos para seguridad de caja
// Unidades: todos los límites en PESOS (COP)
export interface SecurityLimits {
  limite_transaccion_normal: number; // pesos
  limite_transaccion_efectivo: number; // pesos
  limite_diario_cajero: number; // pesos
  limite_autorizacion_supervisor: number; // pesos
}
