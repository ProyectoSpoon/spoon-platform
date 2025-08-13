// Removed circular import
export * from './stateTypes';
export type { Mesa } from './stateTypes';
export * from './actionTypes';
// Re-export compatibility types from mesasTypes
export type { 
  Mesa as MesaCompleta,
  EstadoMesa,
  EstadoMesaDB,
  ItemMesa,
  DetalleMesa,
  EstadoMesas
} from './stateTypes'; 


export type { CrearOrdenData, ItemOrdenInput, ReservarMesaParams, MantenimientoMesaParams, ActionResult } from './actionTypes';


