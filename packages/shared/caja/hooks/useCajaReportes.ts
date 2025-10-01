/**
 * Hook para reportes del sistema de caja
 * Proporciona funciones para obtener diversos reportes de conciliaciones y estado de caja
 */

import { useCallback } from 'react';
import { supabase } from '@spoon/shared/lib/supabase';

// Tipos para los reportes
export interface ConciliacionRealizada {
  fecha_conciliacion: string;
  sesion_id: string;
  business_day: string;
  saldo_calculado: number;
  saldo_fisico_real: number;
  diferencia: number;
  tipo_diferencia: string;
  justificacion: string;
  conciliado_por: string;
  requiere_supervisor: boolean;
}

export interface SesionPendienteConciliacion {
  sesion_id: string;
  business_day: string;
  cerrada_at: string;
  horas_desde_cierre: number;
  saldo_calculado: number;
  cajero: string;
  restaurant_name: string;
}

export interface ResumenDiferencias {
  periodo: string;
  total_conciliaciones: number;
  total_sobrantes: number;
  total_faltantes: number;
  monto_total_sobrantes: number;
  monto_total_faltantes: number;
  porcentaje_conciliado: number;
}

export interface EstadoCajaActual {
  restaurant_id: string;
  restaurant_name: string;
  caja_abierta: boolean;
  sesion_actual_id: string | null;
  cajero_actual: string | null;
  monto_inicial: number | null;
  tiempo_abierta_horas: number;
  ultima_actividad: string | null;
  conciliaciones_pendientes: number;
}

export interface TransaccionSesion {
  tipo_movimiento: string;
  descripcion: string;
  monto: number;
  fecha_hora: string;
  metodo_pago: string;
  categoria: string | null;
}

export interface DashboardCaja {
  periodo_dias: number;
  metricas_principales: {
    total_conciliaciones: number;
    sesiones_auto_cerradas: number;
    sesiones_conciliadas: number;
    conciliaciones_pendientes: number;
    cajas_abiertas: number;
  };
  diferencias: {
    total_sobrantes: number;
    total_faltantes: number;
    monto_total_sobrantes: number;
    monto_total_faltantes: number;
    balance_neto: number;
  };
  porcentajes: {
    tasa_conciliacion: number;
    precision_caja: number;
  };
}

export const useCajaReportes = () => {
  // Reporte de conciliaciones realizadas
  const obtenerConciliacionesRealizadas = useCallback(async (
    restaurantId?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<ConciliacionRealizada[]> => {
    try {
      const { data, error } = await supabase.rpc('reporte_conciliaciones_realizadas', {
        p_restaurant_id: restaurantId || null,
        p_fecha_desde: fechaDesde || null,
        p_fecha_hasta: fechaHasta || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo conciliaciones realizadas:', error);
      return [];
    }
  }, []);

  // Reporte de sesiones pendientes de conciliación
  const obtenerSesionesPendientesConciliacion = useCallback(async (
    restaurantId?: string
  ): Promise<SesionPendienteConciliacion[]> => {
    try {
      const { data, error } = await supabase.rpc('reporte_sesiones_pendientes_conciliacion', {
        p_restaurant_id: restaurantId || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo sesiones pendientes:', error);
      return [];
    }
  }, []);

  // Reporte de resumen de diferencias
  const obtenerResumenDiferencias = useCallback(async (
    restaurantId?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<ResumenDiferencias[]> => {
    try {
      const { data, error } = await supabase.rpc('reporte_resumen_diferencias', {
        p_restaurant_id: restaurantId || null,
        p_fecha_desde: fechaDesde || null,
        p_fecha_hasta: fechaHasta || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo resumen de diferencias:', error);
      return [];
    }
  }, []);

  // Reporte de estado actual de caja
  const obtenerEstadoCajaActual = useCallback(async (
    restaurantId?: string
  ): Promise<EstadoCajaActual[]> => {
    try {
      const { data, error } = await supabase.rpc('reporte_estado_caja_actual', {
        p_restaurant_id: restaurantId || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo estado de caja actual:', error);
      return [];
    }
  }, []);

  // Reporte de transacciones por sesión
  const obtenerTransaccionesSesion = useCallback(async (
    sesionId: string
  ): Promise<TransaccionSesion[]> => {
    try {
      const { data, error } = await supabase.rpc('reporte_transacciones_sesion', {
        p_sesion_id: sesionId,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo transacciones de sesión:', error);
      return [];
    }
  }, []);

  // Dashboard de caja con métricas principales
  const obtenerDashboardCaja = useCallback(async (
    restaurantId?: string,
    diasAtras: number = 30
  ): Promise<DashboardCaja | null> => {
    try {
      const { data, error } = await supabase.rpc('reporte_dashboard_caja', {
        p_restaurant_id: restaurantId || null,
        p_dias_atras: diasAtras,
      });

      if (error) throw error;
      return data as DashboardCaja;
    } catch (error) {
      console.error('Error obteniendo dashboard de caja:', error);
      return null;
    }
  }, []);

  // Función utilitaria para exportar reportes a CSV
  const exportarReporteCSV = useCallback((
    datos: any[],
    nombreArchivo: string,
    columnas?: string[]
  ) => {
    if (!datos || datos.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    // Si no se especifican columnas, usar todas las claves del primer objeto
    const columnasExportar = columnas || Object.keys(datos[0]);

    // Crear encabezados
    const encabezados = columnasExportar.join(',');

    // Crear filas de datos
    const filas = datos.map(fila =>
      columnasExportar.map(columna => {
        const valor = fila[columna];
        // Escapar comillas y manejar valores null
        if (valor === null || valor === undefined) return '';
        const valorString = String(valor);
        // Si contiene comillas o comas, envolver en comillas y escapar
        if (valorString.includes(',') || valorString.includes('"') || valorString.includes('\n')) {
          return `"${valorString.replace(/"/g, '""')}"`;
        }
        return valorString;
      }).join(',')
    );

    // Combinar todo
    const csvContent = [encabezados, ...filas].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    // Funciones de reportes
    obtenerConciliacionesRealizadas,
    obtenerSesionesPendientesConciliacion,
    obtenerResumenDiferencias,
    obtenerEstadoCajaActual,
    obtenerTransaccionesSesion,
    obtenerDashboardCaja,

    // Utilidades
    exportarReporteCSV,
  };
};
