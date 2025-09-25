/**
 * Hook especializado para estadísticas de mesas
 * Responsabilidad: Solo cálculos y métricas
 */

import { useMemo } from 'react';
import { Mesa } from './useMesasState';

export interface EstadisticasMesas {
  totalMesas: number;
  mesasLibres: number;
  mesasOcupadas: number;
  mesasReservadas: number;
  mesasInactivas: number;
  totalPendiente: number;
  ordenesEnCocina: number;
  ordenesServidas: number;
  ordenesPorCobrar: number;
  promedioOcupacion: number;
  tiempoPromedioAtencion: number;
}

export const useMesasStats = (mesas: Mesa[]) => {
  const estadisticas = useMemo((): EstadisticasMesas => {
    const totalMesas = mesas.length;

    // Conteo por estado
    const mesasLibres = mesas.filter(m => m.estado === 'libre').length;
    const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const mesasReservadas = mesas.filter(m => m.estado === 'reservada').length;
    const mesasInactivas = mesas.filter(m => m.estado === 'inactiva').length;

    // Estadísticas de órdenes
    const ordenesActivas = mesas.filter(m => m.ordenActiva);
    const totalPendiente = ordenesActivas.reduce(
      (sum, mesa) => sum + (mesa.ordenActiva?.total || 0),
      0
    );

    // Estados de órdenes
    const ordenesEnCocina = ordenesActivas.filter(mesa => {
      // Lógica para determinar si está en cocina
      // Por ahora, asumimos que todas las órdenes activas están en cocina
      return mesa.ordenActiva !== undefined;
    }).length;

    const ordenesServidas = 0; // TODO: Implementar lógica de estados de orden
    const ordenesPorCobrar = ordenesActivas.length; // Simplificación

    // Cálculos adicionales
    const promedioOcupacion = totalMesas > 0
      ? ((mesasOcupadas + mesasReservadas) / totalMesas) * 100
      : 0;

    const tiempoPromedioAtencion = 0; // TODO: Implementar cálculo de tiempo

    return {
      totalMesas,
      mesasLibres,
      mesasOcupadas,
      mesasReservadas,
      mesasInactivas,
      totalPendiente,
      ordenesEnCocina,
      ordenesServidas,
      ordenesPorCobrar,
      promedioOcupacion,
      tiempoPromedioAtencion
    };
  }, [mesas]);

  return {
    estadisticas
  };
};
