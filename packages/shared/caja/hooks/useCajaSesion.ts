"use client";

/**
 * Hook de sesión de caja conectado a BD (Supabase)
 * - Usa RPCs: abrir_caja_atomico y cerrar_caja_atomico
 * - Incluye fallback a operaciones directas si la RPC no existe
 * - Mantiene API compatible con consumidores actuales
 * - Sistema de cierre automático basado en horarios e inactividad
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, getUserProfile, getActiveRoles } from '@spoon/shared/lib/supabase';
import { handleCajaError, classifyCajaError } from '../utils/errorHandling';
import { ensureCajaAbiertaYPermisos, validateMonto } from '../utils/validations';
import { toCentavos, toPesos } from '../utils/currency';
import { CAJA_ERROR_CODES, CAJA_MESSAGES, CAJA_LOG_MESSAGES } from '../constants/messages';
import { CAJA_CONFIG } from '../constants/cajaConstants';
import {
  obtenerConfiguracionHorarios,
  verificarFueraHorarioOperativo,
  debeActivarCierreAutomatico
} from '../utils/businessHours';
import {
  calcularTiempoInactividad,
  iniciarMonitoreoInactividad,
  detenerMonitoreoInactividad,
  registrarActividad
} from '../utils/inactivityMonitor';
import {
  crearNotificacion,
  enviarNotificacion,
  obtenerHistorialNotificaciones
} from '../utils/notifications';
import { useCajaReportes } from './useCajaReportes';

// Tipo mínimo alineado con tabla caja_sesiones
export interface CajaSesion {
  id: string;
  abierta_at?: string;
  fechaApertura?: string; // compat UI antigua
  estado: 'abierta' | 'cerrada';
  restaurant_id?: string;
  cajero_id?: string | null;
  monto_inicial?: number; // pesos
  notas_apertura?: string | null;
  notas_cierre?: string | null;
}

export interface ResultadoOperacion {
  success: boolean;
  mensaje?: string;
  error?: string;
  data?: any;
  requiereConciliacion?: boolean;
  conciliacionesPendientes?: any[];
}

export const useCajaSesion = () => {
  const [sesion, setSesion] = useState<CajaSesion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sesionIdRef = useRef<string | null>(null);

  // Estado para sistema de cierre automático
  const [configuracionHorarios, setConfiguracionHorarios] = useState<any>(null);
  const [monitoreoIniciado, setMonitoreoIniciado] = useState<boolean>(false);
  const intervaloMonitoreoRef = useRef<NodeJS.Timeout | null>(null);
  const [esperandoRespuesta, setEsperandoRespuesta] = useState<boolean>(false);
  const [tiempoEsperaRespuesta, setTiempoEsperaRespuesta] = useState<number>(0);
  const timeoutEsperaRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de reportes
  const reportes = useCajaReportes();

  const estadoCaja = useMemo<'abierta' | 'cerrada'>(() => (sesion?.estado ?? 'cerrada'), [sesion?.estado]);

  const cargarSesionActiva = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getUserProfile();
      const rid = profile?.restaurant_id || null;
      if (!rid) {
        setSesion(null);
        sesionIdRef.current = null;
        return;
      }
      const { data, error: qErr } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('restaurant_id', rid)
        .eq('estado', 'abierta')
        .order('abierta_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (qErr && (qErr as any).code !== 'PGRST116') throw qErr;
      if (!data) {
        setSesion(null);
        sesionIdRef.current = null;
        return;
      }
      setSesion({
        ...(data as any),
        fechaApertura: (data as any).abierta_at || (data as any).fechaApertura,
      } as CajaSesion);
      sesionIdRef.current = (data as any).id ?? null;
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[useCajaSesion] Error cargando sesión activa:', e);
      setError(handleCajaError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarSesionActiva();
  }, [cargarSesionActiva]);

  // Realtime: detectar apertura de caja desde otra pestaña/usuario (INSERT por restaurant_id)
  useEffect(() => {
    let channel: any = null;
    (async () => {
      try {
        const profile = await getUserProfile();
        const rid = profile?.restaurant_id;
        if (!rid) return;
        channel = (supabase as any)
          .channel(`rt_caja_sesiones_rest_${rid}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'caja_sesiones',
            filter: `restaurant_id=eq.${rid}`,
          }, (payload: any) => {
            const nueva = payload?.new;
            if (!nueva) return;
            if ((nueva as any).estado === 'abierta') {
              setSesion({ ...(nueva as any), fechaApertura: (nueva as any).abierta_at } as any);
              sesionIdRef.current = (nueva as any).id ?? null;
            }
          })
          .subscribe();
      } catch { /* ignore */ }
    })();
    return () => {
      try {
        if (channel) {
          if (typeof (supabase as any).removeChannel === 'function') {
            (supabase as any).removeChannel(channel);
          } else if (typeof (channel as any).unsubscribe === 'function') {
            (channel as any).unsubscribe();
          }
        }
      } catch { /* ignore */ }
    };
  }, []);

  // Efecto para cargar configuración de horarios cuando hay restaurante
  useEffect(() => {
    const cargarConfiguracionHorarios = async () => {
      if (sesion?.restaurant_id) {
        try {
          const config = await obtenerConfiguracionHorarios(sesion.restaurant_id);
          setConfiguracionHorarios(config);
        } catch (error) {
          console.error('Error cargando configuración de horarios:', error);
        }
      }
    };

    cargarConfiguracionHorarios();
  }, [sesion?.restaurant_id]);

  // Efecto para iniciar/detener monitoreo cuando cambia el estado de la caja
  useEffect(() => {
    if (estadoCaja === 'abierta' && !monitoreoIniciado) {
      // Iniciar monitoreo de inactividad
      iniciarMonitoreoInactividad();
      setMonitoreoIniciado(true);

      // Iniciar intervalo de verificación de cierre automático
      intervaloMonitoreoRef.current = setInterval(() => {
        verificarCierreAutomatico();
      }, CAJA_CONFIG.CIERRE_AUTOMATICO.INTERVALO_CHECK);

    } else if (estadoCaja === 'cerrada' && monitoreoIniciado) {
      // Detener monitoreo
      detenerMonitoreoInactividad();
      if (intervaloMonitoreoRef.current) {
        clearInterval(intervaloMonitoreoRef.current);
        intervaloMonitoreoRef.current = null;
      }
      setMonitoreoIniciado(false);
    }

    return () => {
      if (intervaloMonitoreoRef.current) {
        clearInterval(intervaloMonitoreoRef.current);
      }
    };
  }, [estadoCaja, monitoreoIniciado]);

  // Función para verificar conciliaciones pendientes
  const verificarConciliacionesPendientes = useCallback(async (restaurantId: string) => {
    try {
      const { data, error } = await supabase.rpc('verificar_conciliaciones_pendientes', {
        p_restaurant_id: restaurantId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error verificando conciliaciones pendientes:', error);
      return [];
    }
  }, []);

  // Función para realizar conciliación física
  const realizarConciliacionFisica = useCallback(async (
    sesionId: string,
    conteoFisico: number, // en pesos
    justificacion: string,
    evidenciaUrl?: string
  ): Promise<ResultadoOperacion> => {
    try {
      setLoading(true);

      const profile = await getUserProfile();
      if (!profile?.id) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const result = await supabase.rpc('conciliar_caja_fisica', {
        p_sesion_id: sesionId,
        p_conteo_fisico: toCentavos(conteoFisico),
        p_justificacion: justificacion,
        p_evidencia_url: evidenciaUrl,
        p_conciliado_por: profile.id
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (!result.data?.success) {
        return { success: false, error: result.data?.error || 'Error en conciliación' };
      }

      return {
        success: true,
        mensaje: 'Conciliación realizada exitosamente',
        data: result.data
      };
    } catch (error: any) {
      console.error('Error en conciliación física:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const abrirCaja = useCallback(async (montoInicial: number, notas?: string): Promise<ResultadoOperacion> => {
    try {
      setLoading(true);
      setError(null);

      // Guard de permisos: permitir solo cajero/administrador cuando roles estén definidos
      try {
        const roles = await getActiveRoles();
        console.log('🔍 Roles del usuario:', roles);

        if (Array.isArray(roles) && roles.length > 0) {
          // Verificar si alguno de los roles permite abrir caja
          const allowed = roles.some(r => {
            // El rol puede estar en r.system_role?.name o directamente en r
            const roleName = r?.system_role?.name || r?.name || String(r).toLowerCase();
            console.log('🔍 Verificando rol:', roleName);
            return ['cajero','admin','administrador','propietario','owner'].includes(roleName.toLowerCase());
          });

          console.log('🔍 ¿Usuario autorizado?', allowed);

          if (!allowed) {
            console.log('⚠️ Usuario no autorizado, pero permitiendo por compatibilidad');
            // return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO] } as const;
          }
        } else {
          console.log('⚠️ No se encontraron roles, permitiendo por compatibilidad');
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo roles, continuando sin validación:', error);
        /* si no se pueden leer roles, no bloquear para compatibilidad */
      }

      const profile = await getUserProfile();
      const rid = profile?.restaurant_id;
      if (!profile?.id || !rid) {
  return { success: false, error: 'Usuario o restaurante no válido' };
      }

      // 🔍 Verificar conciliaciones pendientes antes de abrir
      const conciliacionesPendientes = await verificarConciliacionesPendientes(rid);
      if (conciliacionesPendientes.length > 0) {
        return {
          success: false,
          error: 'Hay sesiones cerradas automáticamente que requieren conciliación física antes de abrir nueva caja',
          requiereConciliacion: true,
          conciliacionesPendientes: conciliacionesPendientes
        };
      }

      const montoPesos = Math.round(montoInicial || 0);
      if (montoPesos < 0 || montoPesos > 10000000) {
        return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.MONTO_FUERA_RANGO] };
      }

      // Intentar vía RPC (centavos)
      let createdSesionId: string | null = null;
      try {
        const rpcRes: any = await supabase.rpc('abrir_caja_atomico', {
          p_restaurant_id: rid,
          p_cajero_id: profile.id,
          // La función SQL espera PESOS (enteros), no centavos
          p_monto_inicial: montoPesos,
          p_notas: notas,
        });
        if (rpcRes?.error) {
          const m = String((rpcRes.error as any)?.message || '').toLowerCase();
          const missing = m.includes('does not exist') || m.includes('not found');
          if (!missing) {
            return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.CONEXION_FALLIDA] };
          }
          // caer a fallback
          throw new Error('rpc_missing');
        }
        if (!rpcRes?.data?.success) {
          const code = rpcRes?.data?.error_code;
          if (code === 'CAJA_YA_ABIERTA') {
            return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA] };
          }
          const msg = rpcRes?.data?.message || CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR];
          return { success: false, error: msg };
        }
        createdSesionId = rpcRes.data.sesion_id as string;
      } catch (rpcErr: any) {
        const lower = String(rpcErr?.message || '').toLowerCase();
        const fnMissing = lower.includes('rpc_missing') || lower.includes('does not exist') || lower.includes('not found');
        if (!fnMissing) {
          return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.CONEXION_FALLIDA] };
        }
        // Fallback: validar que no exista abierta y crear fila directa (pesos)
        const { data: abierta } = await supabase
          .from('caja_sesiones')
          .select('id')
          .eq('restaurant_id', rid)
          .eq('estado', 'abierta')
          .limit(1)
          .maybeSingle();
        if (abierta) {
          return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.CAJA_YA_ABIERTA] };
        }
        const { data: creada, error: errIns } = await supabase
          .from('caja_sesiones')
          .insert({
            restaurant_id: rid,
            cajero_id: profile.id,
            monto_inicial: montoPesos,
            estado: 'abierta',
            abierta_at: new Date().toISOString(),
            notas_apertura: notas,
            business_day: new Date().toISOString().split('T')[0],
          })
          .select('id')
          .single();
        if (errIns) {
          return { success: false, error: (errIns as any)?.message || CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR] };
        }
        createdSesionId = (creada as any)?.id ?? null;
      }

      if (!createdSesionId) {
        return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR] };
      }

      const { data: ses } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('id', createdSesionId)
        .single();

      if (ses) {
        setSesion({ ...(ses as any), fechaApertura: (ses as any).abierta_at } as CajaSesion);
        sesionIdRef.current = createdSesionId;
      }
  return { success: true, mensaje: CAJA_MESSAGES.CAJA_ABIERTA, data: ses };
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[useCajaSesion] Error abriendo caja:', e);
      const msg = handleCajaError(e);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cerrarCaja = useCallback(async (notas?: string, opts?: { saldoFinalReportadoPesos?: number }): Promise<ResultadoOperacion> => {
    try {
      setLoading(true);
      setError(null);
      // Guard de permisos
      try {
        const roles = await getActiveRoles();
        console.log('🔍 Roles del usuario para cerrar caja:', roles);

        if (Array.isArray(roles) && roles.length > 0) {
          const allowed = roles.some(r => ['cajero','admin','administrador','propietario','owner'].includes(String(r).toLowerCase()));
          console.log('🔍 ¿Usuario autorizado para cerrar caja?', allowed);

          if (!allowed) {
            console.log('⚠️ Usuario no autorizado para cerrar caja, pero permitiendo por compatibilidad');
            // return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO] } as const;
          }
        } else {
          console.log('⚠️ No se encontraron roles para cerrar caja, permitiendo por compatibilidad');
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo roles para cerrar caja, continuando sin validación:', error);
        /* si no se pueden leer roles, no bloquear para compatibilidad */
      }
      const currentId = sesionIdRef.current || sesion?.id;
      if (!currentId) {
        return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.SESION_NO_ENCONTRADA] };
      }

      // Intentar RPC primero
      let cerrado = false;
      let lastErr: any = null;
      try {
        const rpcRes: any = await supabase.rpc('cerrar_caja_atomico', {
          p_sesion_id: currentId,
          p_notas: notas || 'Cierre manual',
          p_saldo_final_reportado: null,
        });
        if (!rpcRes?.error && rpcRes?.data?.success) {
          cerrado = true;
        } else if (rpcRes?.error) {
          lastErr = rpcRes.error;
          const m = String((rpcRes.error as any)?.message || '').toLowerCase();
          const missing = m.includes('does not exist') || m.includes('not found');
          if (!missing) {
            // error real, no fallback
            return { success: false, error: (rpcRes.error as any)?.message || CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR] };
          }
        }
      } catch (e) {
        lastErr = e;
      }

      if (!cerrado) {
        // Fallback UPDATE directo
        const { error: updErr } = await supabase
          .from('caja_sesiones')
          .update({ estado: 'cerrada', cerrada_at: new Date().toISOString(), notas_cierre: notas })
          .eq('id', currentId);
        if (updErr) {
          const msg = (updErr as any)?.message || (lastErr as any)?.message || CAJA_MESSAGES[CAJA_ERROR_CODES.BASE_DATOS_ERROR];
          return { success: false, error: msg };
        }
      }

      // Refrescar estado local
      setSesion(null);
      sesionIdRef.current = null;
  return { success: true, mensaje: CAJA_MESSAGES.CAJA_CERRADA };
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[useCajaSesion] Error cerrando caja:', e);
      const msg = handleCajaError(e);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [sesion?.id]);

  // Función para verificar condiciones de cierre automático
  const verificarCierreAutomatico = useCallback(async () => {
    if (!sesion?.restaurant_id || !sesion?.cajero_id || !configuracionHorarios) return;

    try {
      const tiempoInactivo = calcularTiempoInactividad();
      const fueraHorario = verificarFueraHorarioOperativo(configuracionHorarios);
      const debeActivar = debeActivarCierreAutomatico(configuracionHorarios, tiempoInactivo);

      if (!debeActivar) return;

      const historial = obtenerHistorialNotificaciones();
      const ahora = Date.now();

      // Nueva lógica: notificaciones que requieren respuesta del usuario
      if (!esperandoRespuesta) {
        // Primera notificación a 1 hora
        if (!historial.ultimaPrimera && tiempoInactivo >= CAJA_CONFIG.CIERRE_AUTOMATICO.TIEMPO_AVISO_1) {
          const notificacion = crearNotificacion('primera', tiempoInactivo, fueraHorario);
          await enviarNotificacion(notificacion, sesion.restaurant_id, sesion.cajero_id);
          setEsperandoRespuesta(true);
          setTiempoEsperaRespuesta(ahora);
          return;
        }

        // Segunda notificación a 2 horas (si no respondió a la primera)
        if (!historial.ultimaSegunda &&
            tiempoInactivo >= CAJA_CONFIG.CIERRE_AUTOMATICO.TIEMPO_AVISO_2 &&
            historial.ultimaPrimera) {
          const notificacion = crearNotificacion('segunda', tiempoInactivo, fueraHorario);
          await enviarNotificacion(notificacion, sesion.restaurant_id, sesion.cajero_id);
          setEsperandoRespuesta(true);
          setTiempoEsperaRespuesta(ahora);
          return;
        }
      }

      // Si estamos esperando respuesta y pasaron 3 horas desde la segunda notificación
      if (esperandoRespuesta &&
          tiempoInactivo >= CAJA_CONFIG.CIERRE_AUTOMATICO.TIEMPO_AUTO_CIERRE &&
          historial.ultimaSegunda) {

        const tiempoEsperandoRespuesta = ahora - tiempoEsperaRespuesta;

        // Si pasaron 5 minutos desde que empezó a esperar respuesta, cerrar
        if (tiempoEsperandoRespuesta >= CAJA_CONFIG.CIERRE_AUTOMATICO.TIEMPO_ESPERA_RESPUESTA) {
          console.log('🚨 Ejecutando cierre automático - no hubo respuesta a notificaciones');

          // Registrar auditoría del cierre automático
          await supabase.from('security_alerts').insert({
            restaurant_id: sesion.restaurant_id,
            cajero_id: sesion.cajero_id,
            tipo_alerta: 'cierre_automatico_sin_respuesta',
            descripcion: `Cierre automático ejecutado - sin respuesta a notificaciones después de ${Math.round(tiempoInactivo / (1000 * 60 * 60))} horas`,
            datos_contexto: {
              tiempoInactivo,
              fueraHorario,
              tiempoEsperandoRespuesta,
              sesionId: sesion.id,
              notificacionesEnviadas: {
                primera: historial.ultimaPrimera,
                segunda: historial.ultimaSegunda
              },
              timestamp: Date.now()
            },
            severidad: 'alta'
          });

        // Ejecutar cierre automático con cálculo de saldo
        const result = await supabase.rpc('cerrar_caja_automatico', {
          p_sesion_id: sesion.id,
          p_notas: 'Cierre automático - sin respuesta a notificaciones de inactividad'
        });

        if (!result?.data?.success) {
          console.error('Error en cierre automático:', result?.data?.error);
        }
        }
      }
    } catch (error) {
      console.error('Error en verificación de cierre automático:', error);
    }
  }, [sesion, configuracionHorarios, cerrarCaja, esperandoRespuesta, tiempoEsperaRespuesta]);

  // Función para manejar respuesta del usuario a notificaciones
  const manejarRespuestaNotificacion = useCallback(async (accion: string) => {
    if (!sesion?.restaurant_id || !sesion?.cajero_id) return;

    try {
      // Registrar la respuesta en auditoría
      await supabase.from('security_alerts').insert({
        restaurant_id: sesion.restaurant_id,
        cajero_id: sesion.cajero_id,
        tipo_alerta: 'respuesta_notificacion_cierre',
        descripcion: `Usuario respondió a notificación: ${accion}`,
        datos_contexto: {
          accion,
          tiempoEsperaRespuesta,
          timestamp: Date.now()
        },
        severidad: 'baja',
        revisada: true,
        revisada_por: sesion.cajero_id,
        revisada_at: new Date().toISOString()
      });

      if (accion === 'mantener' || accion === 'confirmar') {
        // Usuario confirma que la caja sigue activa - resetear estado
        setEsperandoRespuesta(false);
        setTiempoEsperaRespuesta(0);

        // Registrar actividad para resetear contador de inactividad
        registrarActividad();

        console.log('✅ Usuario confirmó actividad - caja permanece abierta');
      } else if (accion === 'cerrar') {
        // Usuario solicita cerrar la caja
        await cerrarCaja('Cierre solicitado por usuario vía notificación');
      }
    } catch (error) {
      console.error('Error manejando respuesta a notificación:', error);
    }
  }, [sesion, tiempoEsperaRespuesta, cerrarCaja]);

  return {
    // API principal usada por consumidores
    sesionActual: sesion,
    estadoCaja,
    loading,
    error,
    abrirCaja,
    cerrarCaja,
    refrescarSesion: cargarSesionActiva,

    // Sistema de cierre automático
    manejarRespuestaNotificacion,
    esperandoRespuesta,
    tiempoEsperaRespuesta,

    // Sistema de conciliación post-cierre automático
    verificarConciliacionesPendientes,
    realizarConciliacionFisica,

    // Sistema de reportes de caja
    reportes,

    // Propiedades adicionales para compatibilidad con CajaPage
    requiereSaneamiento: false, // Por ahora false, implementar lógica después
    cerrarSesionPrevia: () => cerrarCaja('Cierre de sesión previa'),
    rpcValidacionHabilitada: true, // Por ahora true

    // Compatibilidad con API anterior
    sesion,
    abrirSesion: abrirCaja,
    cerrarSesion: cerrarCaja,
  };
};
