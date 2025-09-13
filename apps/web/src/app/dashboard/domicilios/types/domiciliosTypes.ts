// ========================================
// TIPOS TYPESCRIPT PARA DOMICILIOS
// File: domicilios/types/domiciliosTypes.ts
// ========================================

import { ESTADOS_PEDIDO, ESTADOS_DOMICILIARIO } from '../constants/domiciliosConstants';

// ✅ TIPOS BÁSICOS
export type EstadoPedido = typeof ESTADOS_PEDIDO[keyof typeof ESTADOS_PEDIDO];
export type EstadoDomiciliario = typeof ESTADOS_DOMICILIARIO[keyof typeof ESTADOS_DOMICILIARIO];

// ✅ INTERFACE PARA DOMICILIARIOS
export interface Domiciliario {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  is_active: boolean;
  status: EstadoDomiciliario;
  created_at: string;
  updated_at: string;
}

// ✅ INTERFACE PARA EXTRAS DEL PEDIDO
export interface ExtraPedido {
  id: string;
  nombre: string;
  precio: number;
  tipo: 'agregar' | 'quitar';
}

// ✅ INTERFACE PARA ITEMS DEL PEDIDO
export interface ItemPedido {
  combination_id: string;
  combination_name: string;
  quantity: number;
  unit_price: number;
  extras: ExtraPedido[];
  subtotal: number;
}

// ✅ INTERFACE PRINCIPAL PARA PEDIDOS
export interface PedidoDomicilio {
  id: string;
  restaurant_id: string;
  daily_menu_id: string;
  
  // Datos del cliente
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  
  // Detalles del pedido
  order_items: ItemPedido[];
  total_amount: number;
  delivery_fee: number;
  
  // Estado y asignación
  status: EstadoPedido;
  assigned_delivery_person_id: string | null;
  assigned_delivery_person?: Domiciliario | null;
  
  // Tiempos
  estimated_delivery_minutes: number;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  paid_at: string | null;
  cooking_started_at?: string | null; // Nuevo: inicio real de cocina
  
  // Notas
  special_notes: string | null;
}

// ✅ INTERFACE PARA CREAR NUEVO PEDIDO
export interface NuevoPedido {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_items: Omit<ItemPedido, 'subtotal'>[];
  special_notes?: string;
}

// ✅ INTERFACE PARA ACTUALIZAR ESTADO
export interface ActualizarEstadoPedido {
  pedido_id: string;
  nuevo_estado: EstadoPedido;
  domiciliario_id?: string;
  notas?: string;
}

// ✅ INTERFACE PARA REGISTRAR PAGO
export interface RegistrarPago {
  pedido_id: string;
  monto_recibido: number;
  tipo_pago: 'efectivo' | 'digital';
  domiciliario_id: string;
  notas?: string;
}

// ✅ INTERFACE PARA STATS/DASHBOARD
export interface EstadisticasDomicilios {
  pedidos_hoy: number;
  pedidos_pendientes: number;
  pedidos_en_ruta: number;
  pedidos_entregados: number;
  valor_total_dia: number;
  valor_pendiente_cobro: number;
  tiempo_promedio_entrega: number;
  domiciliarios_activos: number;
}

// ✅ INTERFACE PARA FILTROS
export interface FiltrosPedidos {
  estado?: EstadoPedido | 'todos';
  domiciliario?: string | 'todos';
  fecha?: 'hoy' | 'ayer' | 'semana' | 'mes';
  buscar?: string;
}

// ✅ INTERFACE PARA MENU DEL DIA (simplificada)
export interface MenuDelDiaSimple {
  id: string;
  menu_date: string;
  menu_price: number;
  combinaciones: CombinacionSimple[];
}

export interface CombinacionSimple {
  id: string;
  combination_name: string;
  combination_description: string;
  combination_price: number;
  is_available: boolean;
}

// ✅ INTERFACE PARA HOOKS/ESTADO
export interface EstadoPedidos {
  pedidos: PedidoDomicilio[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosPedidos;
  estadisticas: EstadisticasDomicilios | null;
}

export interface EstadoDomiciliarios {
  domiciliarios: Domiciliario[];
  loading: boolean;
  error: string | null;
}

export interface EstadoMenuDelDia {
  menu: MenuDelDiaSimple | null;
  loading: boolean;
  error: string | null;
}

// ✅ TYPES UTILITARIOS
export type LoadingStates = {
  creando_pedido: boolean;
  actualizando_estado: boolean;
  asignando_domiciliario: boolean;
  registrando_pago: boolean;
  cargando_datos: boolean;
};

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notificacion {
  id: string;
  tipo: NotificationType;
  mensaje: string;
  duracion?: number;
}

// ✅ PROPS PARA COMPONENTES
export interface PedidoFormProps {
  menu: MenuDelDiaSimple | null;
  onSubmit: (pedido: NuevoPedido) => void;
  loading: boolean;
}

export interface PedidosTableProps {
  pedidos: PedidoDomicilio[];
  domiciliarios: Domiciliario[];
  onUpdateEstado: (data: ActualizarEstadoPedido) => void;
  onRegistrarPago: (data: RegistrarPago) => void;
  loading: LoadingStates;
}

export interface DomiciliariosProps {
  domiciliarios: Domiciliario[];
  onUpdateStatus: (id: string, status: EstadoDomiciliario) => void;
  onAddDomiciliario: (nombre: string, telefono: string) => void;
  loading: boolean;
}

