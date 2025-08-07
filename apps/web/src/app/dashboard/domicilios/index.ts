// ========================================
// EXPORTS PRINCIPALES - SISTEMA DOMICILIOS
// File: domicilios/index.ts
// ========================================

// ✅ HOOKS
export { usePedidos } from './hooks/usePedidos';
export { useDomiciliarios } from './hooks/useDomiciliarios';
export { useMenuDelDia } from './hooks/useMenuDelDia';

// ✅ TIPOS
export type {
  // Interfaces principales
  PedidoDomicilio,
  NuevoPedido,
  Domiciliario,
  MenuDelDiaSimple,
  CombinacionSimple,
  ItemPedido,
  ExtraPedido,
  
  // Tipos de estado
  EstadoPedido,
  EstadoDomiciliario,
  
  // Interfaces para acciones
  ActualizarEstadoPedido,
  RegistrarPago,
  
  // Estados de hooks
  EstadoPedidos,
  EstadoDomiciliarios,
  EstadoMenuDelDia,
  
  // Props para componentes
  PedidoFormProps,
  PedidosTableProps,
  DomiciliariosProps,
  
  // Utilidades
  LoadingStates,
  FiltrosPedidos,
  EstadisticasDomicilios,
  NotificationType,
  Notificacion
} from './types/domiciliosTypes';

// ✅ CONSTANTES
export {
  // Estados
  ESTADOS_PEDIDO,
  ESTADOS_DOMICILIARIO,
  
  // Labels y colores
  ESTADOS_LABELS,
  ESTADOS_COLORS,
  DOMICILIARIO_LABELS,
  DOMICILIARIO_COLORS,
  
  // Iconos
  ESTADO_ICONS,
  DOMICILIARIO_ICONS,
  
  // Configuraciones
  DEFAULT_DELIVERY_FEE,
  DEFAULT_ESTIMATED_TIME,
  MAX_DELIVERY_DISTANCE,
  
  // Extras
  EXTRAS_DISPONIBLES,
  
  // UI
  REFRESH_INTERVAL,
  MAX_ORDERS_PER_PAGE,
  DEFAULT_FILTERS,
  
  // Mensajes
  MESSAGES
} from './constants/domiciliosConstants';

// ✅ COMPONENTES (se exportarán cuando los creemos)
export { default as DomiciliosPage } from './pages/DomiciliosPage';
export { default as PedidoForm } from './pages/PedidoForm';
export { default as PedidosTable } from './pages/PedidosTable';
export { default as DomiciliariosPanel } from './pages/DomiciliariosPanel';
export { default as PagoModal } from './pages/PagoModal';
