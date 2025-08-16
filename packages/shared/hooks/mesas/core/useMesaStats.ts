/**
 * HOOK ESPECIALIZADO PARA ESTADÍSTICAS DE MESAS
 * Responsabilidad única: calcular y formatear estadísticas
 * Generado automáticamente por refactoring
 */

import { useMemo } from 'react';
import { Mesa, EstadisticasMesas } from '../../../types/mesas';
import { formatearMoneda } from '../../../utils/mesas';

export interface EstadisticasFormateadas extends EstadisticasMesas {
  // Versiones formateadas para UI
  totalPendienteFormateado: string;
  promedioTicketFormateado: string;
  porcentajeOcupacion: number;
  porcentajeDisponibilidad: number;
  
  // Estadísticas por zona
  estadisticasPorZona: {
    [zona: string]: {
      total: number;
      libres: number;
      ocupadas: number;
      porcentajeOcupacion: number;
    };
  };
  
  // Tendencias
  mesasMasOcupadas: Mesa[];
  zonasMasActivas: string[];
}

export interface MesaStatsHook {
  estadisticas: EstadisticasFormateadas;
  obtenerEstadisticasPorPeriodo: (fechaInicio: Date, fechaFin: Date) => Promise<any>;
  obtenerTendenciasOcupacion: () => any;
}

export const useMesaStats = (mesas: Mesa[]): MesaStatsHook => {
  
  // Calcular estadísticas principales
  const estadisticas = useMemo((): EstadisticasFormateadas => {
    const totalMesas = mesas.length;
    const mesasLibres = mesas.filter(m => m.estado === 'libre').length;
    const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const mesasReservadas = mesas.filter(m => m.estado === 'reservada').length;
    const mesasInactivas = mesas.filter(m => m.estado === 'inactiva').length;
    
    const totalPendiente = mesas
      .filter(m => m.ordenActiva)
      .reduce((sum, m) => sum + (m.ordenActiva?.total || 0), 0);
    
    const promedioTicket = mesasOcupadas > 0 ? totalPendiente / mesasOcupadas : 0;
    
    const mesasDisponibles = totalMesas - mesasInactivas;
    const porcentajeOcupacion = mesasDisponibles > 0 ? (mesasOcupadas / mesasDisponibles) * 100 : 0;
    const porcentajeDisponibilidad = mesasDisponibles > 0 ? (mesasLibres / mesasDisponibles) * 100 : 0;
    
    // Estadísticas por zona
  const zonas = Array.from(new Set(mesas.map(m => m.zona).filter(Boolean))) as string[];
    const estadisticasPorZona: { [zona: string]: any } = {};
    
    zonas.forEach(zona => {
  const mesasZona = mesas.filter(m => m.zona === zona && m.estado !== 'inactiva');
      const total = mesasZona.length;
      const libres = mesasZona.filter(m => m.estado === 'libre').length;
      const ocupadas = mesasZona.filter(m => m.estado === 'ocupada').length;
      const porcentajeOcupacion = total > 0 ? (ocupadas / total) * 100 : 0;
      
      estadisticasPorZona[zona] = {
        total,
        libres,
        ocupadas,
        porcentajeOcupacion
      };
    });
    
    // Mesas más ocupadas (con más tiempo de ocupación)
    const mesasMasOcupadas = mesas
      .filter(m => m.estado === 'ocupada' && m.ordenActiva)
      .sort((a, b) => {
        const fechaA = a.ordenActiva?.fechaCreacion || a.ordenActiva?.created_at || a.created_at;
        const fechaB = b.ordenActiva?.fechaCreacion || b.ordenActiva?.created_at || b.created_at;
        const tiempoA = fechaA ? (new Date().getTime() - new Date(fechaA).getTime()) : 0;
        const tiempoB = fechaB ? (new Date().getTime() - new Date(fechaB).getTime()) : 0;
        return tiempoB - tiempoA;
      })
      .slice(0, 5);
    
    // Zonas más activas (más mesas ocupadas)
    const zonasMasActivas = Object.entries(estadisticasPorZona)
      .sort(([,a], [,b]) => b.ocupadas - a.ocupadas)
      .map(([zona]) => zona)
      .slice(0, 3);
    
    return {
      totalMesas,
      mesasLibres,
      mesasOcupadas,
      mesasReservadas,
      mesasInactivas,
      totalPendiente,
      promedioTicket,
      
      // Formateados
      totalPendienteFormateado: formatearMoneda(totalPendiente),
      promedioTicketFormateado: formatearMoneda(promedioTicket),
      porcentajeOcupacion,
      porcentajeDisponibilidad,
      
      // Por zona
      estadisticasPorZona,
      
      // Tendencias
      mesasMasOcupadas,
      zonasMasActivas
    };
  }, [mesas]);

  // Obtener estadísticas por período (mock para futura implementación)
  const obtenerEstadisticasPorPeriodo = async (_fechaInicio: Date, _fechaFin: Date) => {
    
    return {
      ventasTotal: 0,
      mesasAtendidas: 0,
      tiempoPromedioOcupacion: 0,
      horasPico: []
    };
  };

  // Obtener tendencias de ocupación (mock para futura implementación)
  const obtenerTendenciasOcupacion = () => {
    return {
      porHora: [],
      porDiaSemana: [],
      promedio: estadisticas.porcentajeOcupacion
    };
  };

  return {
    estadisticas,
    obtenerEstadisticasPorPeriodo,
    obtenerTendenciasOcupacion
  };
};

