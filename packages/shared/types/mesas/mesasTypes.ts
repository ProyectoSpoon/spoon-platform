/**
 * ARCHIVO DE COMPATIBILIDAD - mesasTypes.ts
 * Re-exporta todos los tipos para compatibilidad con imports existentes
 * @deprecated - Usar imports específicos desde stateTypes.ts y actionTypes.ts
 */

// Re-exportar todo desde los archivos principales
export * from './stateTypes';
export * from './actionTypes';

// Exports específicos para compatibilidad
export type { Mesa, MesaEstado, OrdenActiva } from './stateTypes';
export type { CrearOrdenData, ItemOrdenInput, ReservarMesaParams, MantenimientoMesaParams, ActionResult } from './actionTypes';
