/**
 * UTILIDADES PARA VERIFICACIÓN DE HORARIOS DE NEGOCIO
 * Implementa lógica para determinar si la caja está operando dentro/fuera de horario
 */

import { supabase } from '@spoon/shared/lib/supabase';

export interface HorarioDia {
  apertura: string;  // Formato "HH:MM"
  cierre: string;    // Formato "HH:MM"
  esHorarioNocturno: boolean;
}

export interface ConfiguracionHorario {
  [diaSemana: string]: HorarioDia | any; // Allow configuracionGlobal
  configuracionGlobal: {
    cierreAutomaticoHabilitado: boolean;
    tiempoAvisoPrevio: number; // horas
    cierreAutomaticoInactividad: number; // horas
    zonaHoraria: string;
  };
}

/**
 * Obtiene la configuración de horarios del restaurante
 */
export const obtenerConfiguracionHorarios = async (restaurantId: string): Promise<ConfiguracionHorario | null> => {
  try {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('business_hours')
      .eq('id', restaurantId)
      .single();

    return restaurant?.business_hours as ConfiguracionHorario || null;
  } catch (error) {
    console.error('Error obteniendo configuración de horarios:', error);
    return null;
  }
};

/**
 * Verifica si el restaurante está operando dentro de su horario de atención
 */
export const verificarDentroHorarioOperativo = (
  configuracion: ConfiguracionHorario,
  fechaActual: Date = new Date()
): boolean => {
  const diaSemana = fechaActual.toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
  const horaActual = fechaActual.getHours() * 100 + fechaActual.getMinutes();

  const horarioDia = configuracion[diaSemana];
  if (!horarioDia) return false; // Día no operativo

  const horaApertura = parseInt(horarioDia.apertura.replace(':', ''));
  let horaCierre = parseInt(horarioDia.cierre.replace(':', ''));

  // Si es horario nocturno y cierra después de medianoche, ajustar
  if (horarioDia.esHorarioNocturno && horaCierre < 1200) {
    horaCierre += 2400; // 02:00 -> 2600
  }

  return horaActual >= horaApertura && horaActual <= horaCierre;
};

/**
 * Verifica si está fuera del horario operativo
 */
export const verificarFueraHorarioOperativo = (
  configuracion: ConfiguracionHorario,
  fechaActual: Date = new Date()
): boolean => {
  return !verificarDentroHorarioOperativo(configuracion, fechaActual);
};

/**
 * Calcula cuánto tiempo ha pasado desde el cierre del horario operativo
 */
export const calcularTiempoFueraHorario = (
  configuracion: ConfiguracionHorario,
  fechaActual: Date = new Date()
): number => {
  const diaSemana = fechaActual.toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
  const horarioDia = configuracion[diaSemana];

  if (!horarioDia) return 0; // Día no operativo, no aplica

  const horaActual = fechaActual.getHours() * 100 + fechaActual.getMinutes();
  let horaCierre = parseInt(horarioDia.cierre.replace(':', ''));

  // Si es horario nocturno y cierra después de medianoche
  if (horarioDia.esHorarioNocturno && horaCierre < 1200) {
    horaCierre += 2400;
  }

  if (horaActual <= horaCierre) return 0; // Aún dentro de horario

  // Calcular diferencia en minutos
  const diffMinutos = horaActual - horaCierre;
  return diffMinutos * 60 * 1000; // Convertir a milisegundos
};

/**
 * Determina si se debe activar el protocolo de cierre automático
 */
export const debeActivarCierreAutomatico = (
  configuracion: ConfiguracionHorario,
  tiempoInactivo: number,
  fechaActual: Date = new Date()
): boolean => {
  if (!configuracion.configuracionGlobal.cierreAutomaticoHabilitado) {
    return false;
  }

  const fueraHorario = verificarFueraHorarioOperativo(configuracion, fechaActual);
  const inactividadMinima = configuracion.configuracionGlobal.cierreAutomaticoInactividad * 60 * 60 * 1000;

  return fueraHorario && tiempoInactivo >= inactividadMinima;
};

/**
 * Obtiene el próximo horario de apertura
 */
export const obtenerProximoHorarioApertura = (
  configuracion: ConfiguracionHorario,
  fechaActual: Date = new Date()
): Date | null => {
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  for (let i = 0; i < 7; i++) {
    const fechaCheck = new Date(fechaActual);
    fechaCheck.setDate(fechaActual.getDate() + i);

    const diaSemana = fechaCheck.toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
    const horarioDia = configuracion[diaSemana];

    if (horarioDia) {
      const [horaApertura, minutoApertura] = horarioDia.apertura.split(':').map(Number);
      fechaCheck.setHours(horaApertura, minutoApertura, 0, 0);

      // Si es hoy y ya pasó la hora de apertura, continuar al siguiente día
      if (i === 0 && fechaCheck <= fechaActual) continue;

      return fechaCheck;
    }
  }

  return null; // No se encontró horario de apertura en los próximos 7 días
};
