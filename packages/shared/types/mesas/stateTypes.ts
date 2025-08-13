/**
 * TIPOS UNIFICADOS PARA ESTADOS DE MESA
 * Elimina duplicación y confusión entre sistemas
 * Generado automáticamente por refactoring
 */

// ESTADO ÚNICO UNIFICADO (eliminar dualidad vacia/libre)
export type MesaEstado = 
  | 'libre'         // Mesa disponible para clientes
  | 'ocupada'       // Mesa con clientes sentados (en atención)
  | 'en_cocina'     // Comanda tomada, platos en preparación
  | 'servida'       // Comida servida a la mesa
  | 'por_cobrar'    // Cuenta solicitada / lista para pago
  | 'reservada'     // Mesa reservada para cliente específico
  | 'inactiva'      // Mesa temporalmente fuera de servicio
  | 'mantenimiento' // Mesa en mantenimiento

// INTERFACE UNIFICADA PARA MESA
export interface Mesa {
  // Identificación
  id: string;
  numero: number;
  
  // Configuración física
  nombre?: string;
  zona: string;
  capacidad: number;
  
  // Estado operacional
  estado: MesaEstado;
  notas?: string;
  
  // Datos de orden (si está ocupada)
  ordenActiva?: {
    id: string;
    total: number;
    items: ItemOrden[];
    mesero?: string;
  fechaCreacion?: string; // ISO string
  created_at?: string;    // compat
  comensales?: number;    // número de huéspedes reales
    observaciones?: string;
  } | null;
  
  // Metadatos
  created_at: string;
  updated_at: string;
}

// INTERFACE PARA ITEMS DE ORDEN UNIFICADA
export interface ItemOrden {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  tipo: 'menu_dia' | 'especial';
  observaciones?: string;
}

// INTERFACE PARA CONFIGURACIÓN
export interface ConfiguracionMesas {
  configuradas: boolean;
  totalMesas: number;
  zonas: string[];
  distribuciones: Record<string, number>;
}

// INTERFACE PARA ESTADÍSTICAS
export interface EstadisticasMesas {
  totalMesas: number;
  mesasLibres: number;
  mesasOcupadas: number;
  mesasReservadas: number;
  mesasInactivas: number;
  totalPendiente: number;
  promedioTicket: number;
}

// COMPATIBILIDAD CON TIPOS ANTERIORES
export type EstadoMesa = 'vacia' | 'ocupada'; // @deprecated Usar MesaEstado
export type EstadoMesaDB = MesaEstado; // @deprecated Usar MesaEstado

/**
 * Convierte estado de BD a estado de lógica de mesa
 * @deprecated Usar MesaEstado directamente
 */
export const convertirEstadoDBaLogica = (estadoDB: MesaEstado): EstadoMesa => {
  switch (estadoDB) {
    case 'ocupada':
      return 'ocupada';
    case 'libre':
    case 'reservada':
    case 'inactiva':
    case 'mantenimiento':
    default:
      return 'vacia';
  }
};

// Tipos adicionales para compatibilidad con código existente
export interface ItemMesa {
  id: string;
  mesaId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  observaciones?: string;
  created_at: string;
}

export interface DetalleMesa {
  mesa: Mesa;
  items: ItemMesa[];
  total: number;
  tiempoOcupacion?: number;
  mesero?: string;
  observaciones?: string;
}

// Tipo para estado de múltiples mesas
export type EstadoMesas = {
  [mesaId: string]: Mesa;
};

// Alias para compatibilidad

