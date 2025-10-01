/**
 * UTILIDADES PARA MONITOREO DE INACTIVIDAD
 * Gestiona el seguimiento de actividad del usuario para cierre automático
 */

export interface EstadoInactividad {
  ultimaActividad: number; // Timestamp de última actividad
  tiempoInactivo: number;  // Milisegundos inactivos
  nivelAlerta: 'normal' | 'advertencia' | 'critico' | 'excesivo';
}

// Store global para estado de inactividad
let estadoInactividad: EstadoInactividad = {
  ultimaActividad: Date.now(),
  tiempoInactivo: 0,
  nivelAlerta: 'normal'
};

// Eventos que consideran como actividad del usuario
const EVENTOS_ACTIVIDAD = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus',
  'blur'
];

/**
 * Registra una actividad del usuario
 */
export const registrarActividad = (): void => {
  estadoInactividad.ultimaActividad = Date.now();
  estadoInactividad.tiempoInactivo = 0;
  estadoInactividad.nivelAlerta = 'normal';
};

/**
 * Calcula el tiempo de inactividad actual
 */
export const calcularTiempoInactividad = (): number => {
  return Date.now() - estadoInactividad.ultimaActividad;
};

/**
 * Actualiza el estado de inactividad y determina el nivel de alerta
 */
export const actualizarEstadoInactividad = (): EstadoInactividad => {
  estadoInactividad.tiempoInactivo = calcularTiempoInactividad();

  // Determinar nivel de alerta basado en tiempo
  if (estadoInactividad.tiempoInactivo >= 8 * 60 * 60 * 1000) { // 8 horas
    estadoInactividad.nivelAlerta = 'excesivo';
  } else if (estadoInactividad.tiempoInactivo >= 6 * 60 * 60 * 1000) { // 6 horas
    estadoInactividad.nivelAlerta = 'critico';
  } else if (estadoInactividad.tiempoInactivo >= 2 * 60 * 60 * 1000) { // 2 horas
    estadoInactividad.nivelAlerta = 'advertencia';
  } else {
    estadoInactividad.nivelAlerta = 'normal';
  }

  return { ...estadoInactividad };
};

/**
 * Obtiene el estado actual de inactividad
 */
export const obtenerEstadoInactividad = (): EstadoInactividad => {
  return { ...estadoInactividad };
};

/**
 * Determina si se debe enviar una notificación basada en el tiempo de inactividad
 */
export const debeEnviarNotificacion = (
  tiempoInactivo: number,
  ultimaNotificacion?: number
): { enviar: boolean; tipo: 'primera' | 'segunda' | 'final' | 'ninguna' } => {
  const ahora = Date.now();

  // Si no hay última notificación, verificar primera
  if (!ultimaNotificacion) {
    if (tiempoInactivo >= 2 * 60 * 60 * 1000) { // 2 horas
      return { enviar: true, tipo: 'primera' };
    }
  } else {
    const tiempoDesdeUltimaNotif = ahora - ultimaNotificacion;

    // Segunda notificación después de 4 horas totales (2 horas desde primera)
    if (tiempoInactivo >= 4 * 60 * 60 * 1000 && tiempoDesdeUltimaNotif >= 2 * 60 * 60 * 1000) {
      return { enviar: true, tipo: 'segunda' };
    }

    // Notificación final después de 6 horas totales (2 horas desde segunda)
    if (tiempoInactivo >= 6 * 60 * 60 * 1000 && tiempoDesdeUltimaNotif >= 2 * 60 * 60 * 1000) {
      return { enviar: true, tipo: 'final' };
    }
  }

  return { enviar: false, tipo: 'ninguna' };
};

/**
 * Determina si se debe cerrar automáticamente
 */
export const debeCerrarAutomaticamente = (tiempoInactivo: number): boolean => {
  return tiempoInactivo >= 8 * 60 * 60 * 1000; // 8 horas
};

/**
 * Inicia el monitoreo de inactividad
 */
export const iniciarMonitoreoInactividad = (): (() => void) => {
  // Registrar actividad inicial
  registrarActividad();

  // Agregar event listeners para detectar actividad
  const handleActivity = () => registrarActividad();

  EVENTOS_ACTIVIDAD.forEach(evento => {
    document.addEventListener(evento, handleActivity, true);
  });

  // Función de cleanup
  return () => {
    EVENTOS_ACTIVIDAD.forEach(evento => {
      document.removeEventListener(evento, handleActivity, true);
    });
  };
};

/**
 * Detiene el monitoreo de inactividad
 */
export const detenerMonitoreoInactividad = (): void => {
  // Resetear estado
  estadoInactividad = {
    ultimaActividad: Date.now(),
    tiempoInactivo: 0,
    nivelAlerta: 'normal'
  };
};

/**
 * Formatea el tiempo de inactividad en formato legible
 */
export const formatearTiempoInactividad = (milisegundos: number): string => {
  const horas = Math.floor(milisegundos / (1000 * 60 * 60));
  const minutos = Math.floor((milisegundos % (1000 * 60 * 60)) / (1000 * 60));

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else {
    return `${minutos}m`;
  }
};

/**
 * Hook personalizado para usar el monitoreo de inactividad en React
 */
export const useInactivityMonitor = () => {
  const [estado, setEstado] = React.useState<EstadoInactividad>(obtenerEstadoInactividad());

  React.useEffect(() => {
    const cleanup = iniciarMonitoreoInactividad();

    // Actualizar estado cada minuto
    const interval = setInterval(() => {
      setEstado(actualizarEstadoInactividad());
    }, 60000); // 1 minuto

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  return {
    estado,
    registrarActividad,
    tiempoInactivoFormateado: formatearTiempoInactividad(estado.tiempoInactivo)
  };
};

// Import React for the hook (se agrega al final para evitar import issues)
import React from 'react';
