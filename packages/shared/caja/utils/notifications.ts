/**
 * UTILIDADES PARA SISTEMA DE NOTIFICACIONES
 * Gestiona notificaciones push y auditoría para cierre automático
 */

import { supabase } from '@spoon/shared/lib/supabase';

export interface NotificacionCaja {
  id: string;
  tipo: 'primera' | 'segunda';
  titulo: string;
  mensaje: string;
  severidad: 'info' | 'warning' | 'error';
  acciones?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  tiempoInactivo: number;
  fueraHorario: boolean;
  timestamp: number;
  requiereRespuesta: boolean;
}

export interface HistorialNotificaciones {
  ultimaPrimera?: number;
  ultimaSegunda?: number;
  ultimaFinal?: number;
  totalEnviadas: number;
}

// Store para historial de notificaciones
let historialNotificaciones: HistorialNotificaciones = {
  totalEnviadas: 0
};

/**
 * Obtiene el historial de notificaciones
 */
export const obtenerHistorialNotificaciones = (): HistorialNotificaciones => {
  return { ...historialNotificaciones };
};

/**
 * Registra una notificación enviada
 */
export const registrarNotificacionEnviada = (tipo: 'primera' | 'segunda' | 'final'): void => {
  const ahora = Date.now();

  switch (tipo) {
    case 'primera':
      historialNotificaciones.ultimaPrimera = ahora;
      break;
    case 'segunda':
      historialNotificaciones.ultimaSegunda = ahora;
      break;
    case 'final':
      historialNotificaciones.ultimaFinal = ahora;
      break;
  }

  historialNotificaciones.totalEnviadas++;
};

/**
 * Crea una notificación basada en el tipo y contexto
 */
export const crearNotificacion = (
  tipo: 'primera' | 'segunda',
  tiempoInactivo: number,
  fueraHorario: boolean
): NotificacionCaja => {
  const tiempoFormateado = formatearTiempoInactividad(tiempoInactivo);

  switch (tipo) {
    case 'primera':
      return {
        id: `notif-${Date.now()}`,
        tipo: 'primera',
        titulo: 'Sesión de caja abierta fuera de horario',
        mensaje: `Se detectó inactividad de ${tiempoFormateado}. ¿Desea mantener la caja abierta?`,
        severidad: 'warning',
        acciones: [
          { label: 'Mantener abierta', action: 'mantener', primary: true },
          { label: 'Cerrar ahora', action: 'cerrar' }
        ],
        tiempoInactivo,
        fueraHorario,
        timestamp: Date.now(),
        requiereRespuesta: true
      };

    case 'segunda':
      return {
        id: `notif-${Date.now()}`,
        tipo: 'segunda',
        titulo: 'Segunda advertencia: Caja requiere confirmación',
        mensaje: `La sesión lleva ${tiempoFormateado} abierta fuera de horario. Confirme que sigue activa o se cerrará automáticamente.`,
        severidad: 'error',
        acciones: [
          { label: 'Confirmar actividad', action: 'confirmar', primary: true },
          { label: 'Cerrar ahora', action: 'cerrar' }
        ],
        tiempoInactivo,
        fueraHorario,
        timestamp: Date.now(),
        requiereRespuesta: true
      };

    default:
      throw new Error(`Tipo de notificación desconocido: ${tipo}`);
  }
};

/**
 * Envía una notificación al sistema
 */
export const enviarNotificacion = async (
  notificacion: NotificacionCaja,
  restaurantId: string,
  cajeroId: string
): Promise<void> => {
  try {
    // Registrar en historial
    registrarNotificacionEnviada(notificacion.tipo);

    // Log en base de datos para auditoría
    await supabase.from('security_alerts').insert({
      restaurant_id: restaurantId,
      cajero_id: cajeroId,
      tipo_alerta: `cierre_automatico_${notificacion.tipo}`,
      descripcion: notificacion.mensaje,
      datos_contexto: {
        tiempoInactivo: notificacion.tiempoInactivo,
        fueraHorario: notificacion.fueraHorario,
        severidad: notificacion.severidad,
        timestamp: notificacion.timestamp
      },
      severidad: notificacion.severidad === 'error' ? 'alta' : 'media'
    });

    // Aquí se integraría con el sistema de notificaciones push del frontend
    // Por ahora, usamos console.log como placeholder
    console.log('🔔 NOTIFICACIÓN DE CAJA:', {
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      severidad: notificacion.severidad,
      acciones: notificacion.acciones?.map(a => a.label).join(', ')
    });

    // TODO: Integrar con sistema de notificaciones push real
    // await enviarNotificacionPush(notificacion);

  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
};

/**
 * Registra respuesta del usuario a una notificación
 */
export const registrarRespuestaNotificacion = async (
  notificacionId: string,
  accion: string,
  restaurantId: string,
  cajeroId: string
): Promise<void> => {
  try {
    await supabase.from('security_alerts').insert({
      restaurant_id: restaurantId,
      cajero_id: cajeroId,
      tipo_alerta: 'respuesta_notificacion_cierre',
      descripcion: `Usuario respondió a notificación de cierre automático: ${accion}`,
      datos_contexto: {
        notificacionId,
        accion,
        timestamp: Date.now()
      },
      severidad: 'baja',
      revisada: true,
      revisada_por: cajeroId,
      revisada_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error registrando respuesta a notificación:', error);
  }
};

/**
 * Sistema de notificaciones para React
 */
export const useNotificacionesCaja = () => {
  const [notificacionActiva, setNotificacionActiva] = React.useState<NotificacionCaja | null>(null);
  const [historial, setHistorial] = React.useState<HistorialNotificaciones>(obtenerHistorialNotificaciones());

  const mostrarNotificacion = React.useCallback((notificacion: NotificacionCaja) => {
    setNotificacionActiva(notificacion);
  }, []);

  const ocultarNotificacion = React.useCallback(() => {
    setNotificacionActiva(null);
  }, []);

  const responderNotificacion = React.useCallback(async (
    accion: string,
    restaurantId: string,
    cajeroId: string
  ) => {
    if (notificacionActiva) {
      await registrarRespuestaNotificacion(notificacionActiva.id, accion, restaurantId, cajeroId);
      ocultarNotificacion();
    }
  }, [notificacionActiva, ocultarNotificacion]);

  React.useEffect(() => {
    // Actualizar historial cada minuto
    const interval = setInterval(() => {
      setHistorial(obtenerHistorialNotificaciones());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    notificacionActiva,
    historial,
    mostrarNotificacion,
    ocultarNotificacion,
    responderNotificacion
  };
};

// Utilidad auxiliar
const formatearTiempoInactividad = (milisegundos: number): string => {
  const horas = Math.floor(milisegundos / (1000 * 60 * 60));
  const minutos = Math.floor((milisegundos % (1000 * 60 * 60)) / (1000 * 60));

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else {
    return `${minutos}m`;
  }
};

// Import React for the hook
import React from 'react';
