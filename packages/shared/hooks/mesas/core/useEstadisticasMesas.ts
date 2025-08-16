/**
 * Hook de estadísticas para el modelo maestro de Mesas
 */
import { useMemo } from 'react';
import type { MesaCompletaMaestro } from './useMesasMaestro';

export interface EstadisticasMaestro {
  totalMesas: number;
  mesasLibres: number;
  mesasOcupadas: number;
  mesasReservadas: number;
  mesasInactivas: number;
  ordenesEnCocina: number;
  totalPendiente: number;
}

export const useEstadisticasMesas = (mesas: MesaCompletaMaestro[]): EstadisticasMaestro => {
  return useMemo(() => {
    const totalMesas = mesas.length;
    const mesasLibres = mesas.filter(m => m.estado_mesa === 'libre').length;
    const mesasOcupadas = mesas.filter(m => m.estado_mesa === 'ocupada').length;
    const mesasReservadas = mesas.filter(m => m.estado_mesa === 'reservada').length;
    const mesasInactivas = mesas.filter(m => m.estado_mesa === 'inactiva').length;
    const ordenesEnCocina = mesas.filter(m => m.orden_activa?.estado_orden === 'en_cocina').length;
    const totalPendiente = mesas
      .filter(m => m.orden_activa?.estado_orden === 'por_cobrar')
      .reduce((sum, m) => sum + (m.orden_activa?.total || 0), 0);

    return {
      totalMesas,
      mesasLibres,
      mesasOcupadas,
      mesasReservadas,
      mesasInactivas,
      ordenesEnCocina,
      totalPendiente,
    };
  }, [mesas]);
};
