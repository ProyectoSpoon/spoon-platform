import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, getUserProfile, safeFrom } from '@spoon/shared/lib/supabase';
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';
import { useMesas } from '@spoon/shared/hooks/mesas';

// Tipos locales mínimos para esta implementación
export interface CajaSesion {
  id: string;
  abierta_at?: string; // ISO
  fechaApertura?: string; // compat
  estado: 'abierta' | 'cerrada';
  notas_apertura?: string;
  notas_cierre?: string;
  restaurant_id?: string;
  // Monto inicial en PESOS (unificación de convención)
  monto_inicial?: number;
  // Nuevos campos de la migración
  saldo_final_calculado?: number; // En pesos - calculado automáticamente
  saldo_final_reportado?: number; // En pesos - reportado por cajero
  diferencia_caja?: number; // En pesos - diferencia automática (reportado - calculado)
}

// Cache global (módulo) para evitar repetir llamadas a una RPC inexistente tras remounts
let VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL: boolean = true;
let VALIDAR_CIERRE_RPC_IN_FLIGHT: Promise<any> | null = null;
// Garantiza que el warning por ausencia de la RPC solo se emita una vez globalmente (evita spam en remounts / StrictMode)
let VALIDAR_CIERRE_RPC_WARN_LOGGED = false;

function logRpcDisabledOnce() {
  if (!VALIDAR_CIERRE_RPC_WARN_LOGGED) {
    // eslint-disable-next-line no-console
    console.warn('[caja] Deshabilitando validar_cierre_caja (no existe en el backend)');
    VALIDAR_CIERRE_RPC_WARN_LOGGED = true;
  }
}

async function intentarValidarCierre(params: { restaurantId: string; sesionId: string }) {
  if (!VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL) {
    return { usable: false, bloqueado: false } as const;
  }
  // Si ya hay una promesa en curso, reusar
  if (VALIDAR_CIERRE_RPC_IN_FLIGHT) {
    try {
      const r = await VALIDAR_CIERRE_RPC_IN_FLIGHT;
      return r;
    } catch (e) {
      // En caso de error previo ya se habrá actualizado disponibilidad
      return { usable: VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL, bloqueado: false } as const;
    }
  }
  VALIDAR_CIERRE_RPC_IN_FLIGHT = (async () => {
    try {
      const { data, error, status } = await supabase.rpc('validar_cierre_caja', {
        // Nuevo backend: sólo requiere restaurant; dejamos sesion_id por compatibilidad si existe
        p_restaurant_id: params.restaurantId,
        p_sesion_id: params.sesionId,
      }) as any;
      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || '';
        if (status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('does not exist')) {
          VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL = false;
        }
        return { usable: VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL, bloqueado: false } as const;
      }
      // Compatibilidad de respuesta:
      // - Viejo: { bloqueado: boolean, razones: string[] }
      // - Nuevo: { puede_cerrar: boolean, mensaje: string }
      const d: any = data || {};
      if (typeof d.bloqueado === 'boolean') {
        return { usable: true, bloqueado: !!d.bloqueado, razones: d.razones || [] } as const;
      }
      if (typeof d.puede_cerrar === 'boolean') {
        return { usable: true, bloqueado: d.puede_cerrar === false, razones: d.mensaje ? [String(d.mensaje)] : [] } as const;
      }
      // Si el shape no es reconocible, asumir usable y no bloqueado para no romper flujo
      return { usable: true, bloqueado: false, razones: [] } as const;
    } catch (e: any) {
      const lower = e?.message?.toLowerCase?.() || '';
      if (lower.includes('does not exist') || lower.includes('not found')) {
        VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL = false;
      }
      return { usable: VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL, bloqueado: false } as const;
    } finally {
      // liberar promesa (resultado cacheado ya reflejado en flags)
      VALIDAR_CIERRE_RPC_IN_FLIGHT = null;
    }
  })();
  return intentarValidarCierre(params); // reusar flujo de re-await
}

export const useCajaSesion = () => {
  const [sesionActual, setSesionActual] = useState<CajaSesion | null>(null);
  const [estadoCaja, setEstadoCaja] = useState<'abierta' | 'cerrada'>('cerrada');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiereSaneamiento, setRequiereSaneamiento] = useState(false);
  const [razonesBloqueo, setRazonesBloqueo] = useState<string[] | null>(null);
  const saneadorEjecutado = useRef(false);
  const sesionIdRef = useRef<string | null>(null);
  // Cache de disponibilidad de la RPC validar_cierre_caja para evitar spam 404
  const rpcValidarDisponibleRef = useRef<boolean>(true);
  const rpcDisabledLoggedRef = useRef(false);
  // Evita llamadas concurrentes (single-flight) a la RPC de validación
  const rpcValidationInFlightRef = useRef(false);
  // Flags para evitar cierres duplicados / múltiples PATCH
  const cerrandoRef = useRef(false);
  const sesionCerradaRef = useRef(false);
  const [cierreEnCurso, setCierreEnCurso] = useState(false);

  // Sincronizar ref local con cache global (primer render)
  useEffect(() => {
    if (!VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL) {
      rpcValidarDisponibleRef.current = false;
    }
  }, []);

  // Hook de mesas para validar estados (solo lectura)
  const { mesasCompletas, configuracion } = useMesas();

  const cerrarCaja = useCallback(async (notas?: string, opts?: { omitValidacion?: boolean; saldoFinalReportadoPesos?: number }) => {
    try {
      // Idempotencia: si ya se cerró previamente, retornar éxito silencioso
      if (sesionCerradaRef.current) {
        return { success: true, data: null } as const;
      }
      if (cerrandoRef.current) {
        return { success: false, error: 'cierre_en_progreso' } as const;
      }
      cerrandoRef.current = true;
      setCierreEnCurso(true);
      setLoading(true);
      setError(null);

      const profile = await getUserProfile();
      const currentSesionId = sesionIdRef.current || (sesionActual as any)?.id;
      if (!profile?.restaurant_id || !currentSesionId) {
        throw new Error('No hay sesión activa para cerrar');
      }
  // Ya no hacemos cierre optimista inmediato: primero persistimos y verificamos.
  // Indicador visual de proceso: solo flags (cierreEnCurso / loading) sin alterar estadoCaja todavía.
  console.log('[cerrarCaja][debug] Iniciando proceso de cierre para sesión', currentSesionId);
      // Lectura previa para diagnóstico (cajero_id vs auth.uid) antes de intentar update
      const { data: preRow, error: preErr } = await (await safeFrom('caja_sesiones'))
        .select('id, estado, cajero_id, restaurant_id, cerrada_at')
        .eq('id', currentSesionId)
        .maybeSingle();
      if (preErr) {
        console.warn('[cerrarCaja][warn] No se pudo leer fila previa antes de update', preErr);
      } else if (preRow) {
        console.log('[cerrarCaja][debug] Fila previa', preRow, 'auth.uid', (profile as any)?.id);
        // Guard de concurrencia: si la sesión ya está cerrada, abortar y refrescar estado
        if ((preRow as any).estado !== 'abierta') {
          console.warn('[cerrarCaja][concurrency] Sesión ya no está abierta. Abortando cierre.');
          setError('La sesión ya fue cerrada.');
          return { success: false, error: 'sesion_ya_cerrada' } as const;
        }
      }

      if (!opts?.omitValidacion) {
        // Validación previa adicional: no permitir cierre si alguna mesa está ocupada o con orden activa
        try {
          const mesasOcupadas = mesasCompletas.filter(m => {
            const est = getEstadoDisplay(m).estado;
            return ['ocupada','en_cocina','servida','por_cobrar','reservada'].includes(est);
          });
          if (mesasOcupadas.length > 0) {
            throw new Error('No se puede cerrar la caja: existen mesas ocupadas o con orden activa.');
          }
        } catch (e:any) {
          // Si el hook aún no cargó (mesasCompletas undefined), continuar a RPC que hará validaciones de órdenes.
          if (e?.message?.startsWith('No se puede cerrar la caja')) throw e;
        }
        // Paso 1: Validación por RPC
        let rpcFallo = false;
        if (rpcValidarDisponibleRef.current) {
          const resultado = await intentarValidarCierre({ restaurantId: profile.restaurant_id, sesionId: currentSesionId });
          if (!resultado.usable) {
            rpcValidarDisponibleRef.current = false;
            if (VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL === false && !rpcDisabledLoggedRef.current) {
              logRpcDisabledOnce();
              rpcDisabledLoggedRef.current = true;
            }
            rpcFallo = true;
          } else if ((resultado as any).bloqueado) {
            setRazonesBloqueo((resultado as any).razones || ['desconocido']);
            throw new Error('No se puede cerrar la caja: validación backend bloqueó el cierre.');
          }
        } else {
          rpcFallo = true;
        }

        // Paso 2 (fallback): validar órdenes activas si la RPC falló
        if (rpcFallo) {
          try {
            const profile2 = await getUserProfile();
            const qOrRes: any = await (await safeFrom('ordenes_mesa'))
              .select('id')
              .eq('restaurant_id', profile2?.restaurant_id)
              .eq('estado', 'activa')
              .limit(1);

            let hayOrdenes = false;
            if (qOrRes && 'data' in qOrRes) {
              hayOrdenes = Array.isArray(qOrRes.data) ? qOrRes.data.length > 0 : !!qOrRes.data;
            } else if (qOrRes && typeof qOrRes.maybeSingle === 'function') {
              const maybe = await qOrRes.maybeSingle();
              if (maybe && 'data' in maybe) hayOrdenes = !!maybe.data;
            }

            if (hayOrdenes) {
              throw new Error('No se puede cerrar la caja: hay órdenes de mesa activas.');
            }
          } catch (fbErr: any) {
            if (fbErr?.message?.includes('No se puede cerrar la caja')) {
              throw fbErr;
            }
            // Advertencia: si el fallback falla por otro motivo, continuamos con el cierre para no bloquear
            // eslint-disable-next-line no-console
            console.warn('Advertencia al validar cierre (fallback):', fbErr);
          }
        }
      }

      // Paso 3: Validar saldo final reportado (evitar error P0001 repetitivo)
      let saldoFinalReportado: number | undefined = undefined;
      if (typeof opts?.saldoFinalReportadoPesos === 'number' && !isNaN(opts.saldoFinalReportadoPesos)) {
        saldoFinalReportado = Math.round(opts.saldoFinalReportadoPesos);
      }
      if (!opts?.omitValidacion && (saldoFinalReportado == null || isNaN(saldoFinalReportado))) {
        // Evitar loop de reintentos: no disparamos PATCH sin saldo
        console.warn('[cerrarCaja][warn] Intento de cierre sin saldo_final_reportado. Abortando antes de PATCH.');
        setError('Debe ingresar el saldo final contado antes de cerrar la caja.');
        return { success: false, error: 'saldo_final_requerido' } as const;
      }
      if (opts?.omitValidacion && (saldoFinalReportado == null)) {
        // Cierre automático deshabilitado sin saldo explícito
        console.log('[cerrarCaja][auto-skip] Se omite cierre automático porque no hay saldo_final_reportado.');
        return { success: false, error: 'auto_skip_sin_saldo' } as const;
      }

      const updatePayload: Record<string, any> = {
        estado: 'cerrada',
        cerrada_at: new Date().toISOString(),
        notas_cierre: notas,
        saldo_final_reportado: saldoFinalReportado
      };

      // Nuevo flujo: intentar primero RPC (permite saltar RLS y evita policies rotas)
      let cierreAplicado = false;
      let ultimoError: any = null;
      {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('cerrar_caja_atomico', {
          p_sesion_id: currentSesionId,
          p_notas: updatePayload.notas_cierre || 'Cierre manual',
          p_saldo_final_reportado: saldoFinalReportado
        }) as any;
        if (!rpcErr && rpcData && (rpcData as any).success) {
          cierreAplicado = true;
        } else if (rpcErr) {
          ultimoError = rpcErr;
          console.warn('[cerrarCaja][rpc] fallo RPC cerrar_caja_atomico', { code: (rpcErr as any).code, message: (rpcErr as any).message });
          // Solo intentamos fallback a UPDATE directo si el error NO es de negocio (ej: función no existe)
          const msgLow = (rpcErr.message || '').toLowerCase();
          const fnMissing = msgLow.includes('does not exist') || msgLow.includes('not found');
          if (fnMissing) {
            // Fallback: UPDATE directo
            const { error: updError } = await (await safeFrom('caja_sesiones'))
              .update(updatePayload)
              .eq('id', currentSesionId);
            if (!updError) {
              cierreAplicado = true;
            } else {
              ultimoError = updError;
              console.warn('[cerrarCaja][update] fallo UPDATE directo', { code: (updError as any).code, message: (updError as any).message });
              // Si el error es 42703 (columna inexistente en policy/trigger), intentar limpiar mensaje y forzar fallback diagnóstico
              if ((updError as any).code === '42703') {
                console.warn('[cerrarCaja][diagnostico] Error 42703: posible policy/trigger referencia columna inexistente (current_user_id).');
              }
            }
          }
        }
      }
      if (!cierreAplicado) {
        if (ultimoError) {
          throw new Error(`No se pudo cerrar la caja: ${(ultimoError as any).code || ''} ${(ultimoError as any).message || ''}`.trim());
        }
        throw new Error('No se pudo cerrar la caja (RPC y UPDATE fallidos)');
      }
      console.log('[cerrarCaja][debug] Update aplicado, verificando persistencia...', currentSesionId);
      // Verificación de persistencia: re-leer fila
  const { data: verif, error: verifError } = await (await safeFrom('caja_sesiones'))
        .select('id, estado, cerrada_at')
        .eq('id', currentSesionId)
        .maybeSingle();
      if (verifError) {
        console.error('[cerrarCaja][error] Error verificando estado post-cierre', verifError);
        throw verifError;
      }
      if (!verif) {
        console.error('[cerrarCaja][error] No se encontró la sesión tras update, posible RLS impidiendo lectura.');
        throw new Error('No se pudo verificar cierre (RLS)');
      }
      if ((verif as any).estado !== 'cerrada') {
        console.error('[cerrarCaja][error] La sesión sigue en estado', (verif as any).estado, '=> cierre no persistió');
        // Heurística: si cajero_id distinto al usuario actual o null, probable bloqueo RLS silencioso (0 rows afectadas)
        const probableRLS = preRow && (preRow as any).cajero_id && (preRow as any).cajero_id !== (profile as any).id;
        const probableCajeroNull = preRow && !(preRow as any).cajero_id;
        if (probableRLS) {
          console.error('[cerrarCaja][diagnostico] Posible RLS: cajero_id != auth.uid => update ignorado');
          // Intentar fallback vía RPC atómica con permisos elevables
          try {
            console.log('[cerrarCaja][fallback] Intentando cerrar via RPC cerrar_caja_atomico');
            const { data: rpcData, error: rpcError } = await supabase.rpc('cerrar_caja_atomico', {
              p_sesion_id: currentSesionId,
              p_notas: notas || 'Cierre vía fallback RPC',
              p_saldo_final_reportado: saldoFinalReportado
            }) as any;
            if (rpcError) {
              console.error('[cerrarCaja][fallback][error] RPC fallo', rpcError);
              setError('No tienes permiso para cerrar esta sesión (RLS). Debe cerrarla el cajero original o un admin.');
              return { success: false, error: 'rls_update_denegado' } as const;
            }
            if (!(rpcData as any)?.success) {
              console.error('[cerrarCaja][fallback][error] RPC retorno no success', rpcData);
              setError('Fallback RPC no pudo cerrar la sesión.');
              return { success: false, error: 'fallback_rpc_failed' } as const;
            }
            // Re-verificar
            const { data: verif2 } = await supabase
              .from('caja_sesiones')
              .select('id, estado')
              .eq('id', currentSesionId)
              .maybeSingle();
            if (verif2 && (verif2 as any).estado === 'cerrada') {
              sesionCerradaRef.current = true;
              setSesionActual(null);
              setEstadoCaja('cerrada');
              sesionIdRef.current = null;
              setRequiereSaneamiento(false);
              console.log('[cerrarCaja][fallback] Cierre confirmado via RPC');
              return { success: true, data: null } as const;
            }
            setError('RPC ejecutada pero no se confirmó el cierre.');
            return { success: false, error: 'fallback_rpc_inconcluso' } as const;
          } catch (rpcCatch) {
            console.error('[cerrarCaja][fallback][exception]', rpcCatch);
            setError('Error al intentar fallback RPC de cierre.');
            return { success: false, error: 'fallback_rpc_exception' } as const;
          }
        } else if (probableCajeroNull) {
          console.error('[cerrarCaja][diagnostico] cajero_id NULL, política RLS puede impedir update.');
          // Intentar también fallback RPC cuando cajero_id es null
          try {
            console.log('[cerrarCaja][fallback] cajero_id NULL -> intentando cerrar via RPC cerrar_caja_atomico');
            const { data: rpcData, error: rpcError } = await supabase.rpc('cerrar_caja_atomico', {
              p_sesion_id: currentSesionId,
              p_notas: notas || 'Cierre vía fallback RPC (cajero null)',
              p_saldo_final_reportado: saldoFinalReportado
            }) as any;
            if (rpcError) {
              console.error('[cerrarCaja][fallback][error] RPC fallo (cajero null)', rpcError);
              setError('La sesión no tiene cajero asignado y no se pudo cerrar (RLS).');
              return { success: false, error: 'rls_cajero_null' } as const;
            }
            if (!(rpcData as any)?.success) {
              console.error('[cerrarCaja][fallback][error] RPC retorno no success (cajero null)', rpcData);
              setError('Fallback RPC no pudo cerrar la sesión (cajero null).');
              return { success: false, error: 'fallback_rpc_failed' } as const;
            }
            const { data: verif3 } = await supabase
              .from('caja_sesiones')
              .select('id, estado')
              .eq('id', currentSesionId)
              .maybeSingle();
            if (verif3 && (verif3 as any).estado === 'cerrada') {
              sesionCerradaRef.current = true;
              setSesionActual(null);
              setEstadoCaja('cerrada');
              sesionIdRef.current = null;
              setRequiereSaneamiento(false);
              console.log('[cerrarCaja][fallback] Cierre confirmado via RPC (cajero null)');
              return { success: true, data: null } as const;
            }
            setError('RPC ejecutada pero no se confirmó el cierre (cajero null).');
            return { success: false, error: 'fallback_rpc_inconcluso' } as const;
          } catch (rpcCatch2) {
            console.error('[cerrarCaja][fallback][exception] (cajero null)', rpcCatch2);
            setError('Error fallback RPC cierre (cajero null).');
            return { success: false, error: 'fallback_rpc_exception' } as const;
          }
        }
        setError('El cierre no se persistió en la base de datos. Reintenta o contacta soporte.');
        return { success: false, error: 'persistencia_fallida' } as const;
      }
      // Ahora sí limpiar estado local
      sesionCerradaRef.current = true;
      setSesionActual(null);
      setEstadoCaja('cerrada');
      sesionIdRef.current = null;
      setRequiereSaneamiento(false);
      console.log('[cerrarCaja][debug] Cierre confirmado y estado local limpiado', currentSesionId);
      return { success: true, data: null } as const;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error cerrando caja:', err);
      setError(err.message);
      return { success: false, error: err.message } as const;
    } finally {
      cerrandoRef.current = false;
      setCierreEnCurso(false);
      setLoading(false);
    }
  }, [sesionActual]);

  const verificarSesionAbierta = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) return;

      const { data, error } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('estado', 'abierta')
        .order('abierta_at', { ascending: false })
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') throw error;

      if (!data) {
        setSesionActual(null);
        setEstadoCaja('cerrada');
        return;
      }

      // Determinar si la sesión pertenece a un día previo (zona America/Bogota)
      const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const hoyBogota = fmt.format(new Date());
      const abiertaAt = new Date((data as any).abierta_at || (data as any).fechaApertura);
      const abiertaDiaBogota = fmt.format(abiertaAt);
      const esDeDiaPrevio = abiertaDiaBogota < hoyBogota;

      if (!esDeDiaPrevio) {
        setSesionActual(data as any);
        setEstadoCaja('abierta');
        setRequiereSaneamiento(false);
        return;
      }

      // Sesión de día previo: intentar autocierre una sola vez
      setSesionActual(data as any);
      setEstadoCaja('abierta');
      setRequiereSaneamiento(false);

      if (saneadorEjecutado.current) {
        // Ya se intentó previamente; requerirá acción manual
        setRequiereSaneamiento(true);
        return;
      }

      let evitarCierre = false;
      if (rpcValidarDisponibleRef.current) {
        const resultado = await intentarValidarCierre({ restaurantId: profile.restaurant_id, sesionId: (data as any).id });
        if (!resultado.usable) {
          rpcValidarDisponibleRef.current = false;
          if (VALIDAR_CIERRE_RPC_AVAILABLE_GLOBAL === false && !rpcDisabledLoggedRef.current) {
            logRpcDisabledOnce();
            rpcDisabledLoggedRef.current = true;
          }
          evitarCierre = true;
        } else if ((resultado as any).bloqueado) {
          setRazonesBloqueo((resultado as any).razones || ['desconocido']);
          evitarCierre = true;
        }
      } else {
        evitarCierre = true; // no disponible
      }

      if (evitarCierre) {
        setRequiereSaneamiento(true);
        return;
      }

  // Cierre automático deshabilitado: requerir intervención manual para registrar saldo final
  saneadorEjecutado.current = true;
  sesionIdRef.current = (data as any).id || null;
  console.log('[verificarSesionAbierta][info] Sesión de día previo detectada. Se requiere cierre manual con saldo final.');
  setRequiereSaneamiento(true);
  return;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error verificando sesión:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cerrarCaja]);

  // Mantener ref estable para ejecutar solo en mount
  const verificarSesionAbiertaRef = useRef(verificarSesionAbierta);
  useEffect(() => {
    verificarSesionAbiertaRef.current = verificarSesionAbierta;
  }, [verificarSesionAbierta]);

  // Verificar si hay sesión abierta al cargar (solo once)
  useEffect(() => {
    verificarSesionAbiertaRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suscripción en tiempo real a cambios de la sesión activa para reflejar cierre desde otra pestaña / usuario
  useEffect(() => {
    if (!sesionActual?.id || estadoCaja !== 'abierta') return;
    const channel = supabase
      .channel(`caja_sesion_${sesionActual.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'caja_sesiones',
        filter: `id=eq.${sesionActual.id}`
      }, (payload: any) => {
        const nuevoEstado = payload?.new?.estado;
        if (nuevoEstado && nuevoEstado !== estadoCaja) {
          console.log('[caja][realtime] Cambio de estado detectado', { previo: estadoCaja, nuevo: nuevoEstado });
          if (nuevoEstado === 'cerrada') {
            sesionCerradaRef.current = true;
            setSesionActual(null);
            setEstadoCaja('cerrada');
            sesionIdRef.current = null;
            setRequiereSaneamiento(false);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sesionActual?.id, estadoCaja]);

  // Revalidar al recuperar foco de la ventana para evitar acciones sobre estado obsoleto
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        verificarSesionAbiertaRef.current();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const abrirCaja = useCallback(
    async (montoInicial: number, notas?: string) => {
      try {
        setLoading(true);
        setError(null);

        const profile = await getUserProfile();
        if (!profile?.restaurant_id) {
          throw new Error('Usuario sin restaurante asignado');
        }

  // Ahora trabajamos en pesos directos
  const montoInicialPesos = Math.round(montoInicial || 0);

  // Validación de rango de negocio (0 - 10,000,000 COP)
  if (montoInicialPesos < 0 || montoInicialPesos > 10000000) {
      return { success: false, error: 'Monto fuera de rango permitido' } as const;
    }

    // Implementación atómica vía RPC, con fallback solo si la función no existe
        let sesionId: string | null = null;
        try {
          const { data, error } = await supabase.rpc('abrir_caja_atomico', {
            p_restaurant_id: profile.restaurant_id,
            p_cajero_id: (profile as any).id,
            p_monto_inicial: montoInicialPesos,
            p_notas: notas,
          });
          if (error) {
            // Ante cualquier error de RPC, intentamos fallback a inserción directa.
            // Conservamos el mensaje original para informar si el fallback también falla.
            const originalMsg = (error as any)?.message || 'Error de conexión con la base de datos';
            throw new Error(`rpc_any_error:${originalMsg}`);
          }
          if (!data?.success) {
            if ((data as any)?.error_code === 'CAJA_YA_ABIERTA') {
              const msg = 'Ya existe una caja abierta. Actualiza la página e intenta nuevamente.';
              setError(msg);
              return { success: false, error: msg } as const;
            }
            const msg = (data as any)?.message || 'Error desconocido';
            setError(msg);
            return { success: false, error: msg } as const;
          }
          sesionId = (data as any).sesion_id;
        } catch (rpcErr: any) {
          const lower = rpcErr?.message?.toLowerCase?.() || '';
          const fnNotFound = lower.includes('does not exist') || lower.includes('rpc_missing_function') || lower.startsWith('rpc_any_error:');
          const originalMsg = lower.startsWith('rpc_any_error:') ? rpcErr.message.replace(/^rpc_any_error:/, '') : 'Error de conexión con la base de datos';
          if (!fnNotFound) {
            return { success: false, error: originalMsg } as const;
          }
          // Fallback a insert directo en entornos sin RPC
          const { data: abierta, error: errCheck } = await supabase
            .from('caja_sesiones')
            .select('id')
            .eq('restaurant_id', profile.restaurant_id)
            .eq('estado', 'abierta')
            .limit(1)
            .maybeSingle();
          if (errCheck) throw errCheck;
          if (abierta) {
            const msg = 'Ya existe una caja abierta. Actualiza la página e intenta nuevamente.';
            setError(msg);
            return { success: false, error: msg } as const;
          }
  const { data: creada, error: errIns } = await supabase
            .from('caja_sesiones')
            .insert({
              restaurant_id: profile.restaurant_id,
      cajero_id: (profile as any).id,
      monto_inicial: montoInicialPesos,
      business_day: new Date().toISOString().split('T')[0],
              estado: 'abierta',
              abierta_at: new Date().toISOString(),
              notas_apertura: notas,
            })
            .select('id')
            .single();
          if (errIns) {
            // Si falla por rango/número, reintentar asumiendo que la columna está en pesos (no centavos)
            const errMsg = ((errIns as any)?.message || '').toLowerCase();
            const sospechaTipo = errMsg.includes('out of range') || errMsg.includes('invalid input') || errMsg.includes('numeric') || errMsg.includes('violates');
            if (sospechaTipo) {
        const retry = await supabase
                .from('caja_sesiones')
                .insert({
                  restaurant_id: profile.restaurant_id,
          cajero_id: (profile as any).id,
                  monto_inicial: montoInicial, // en pesos
          business_day: new Date().toISOString().split('T')[0],
                  estado: 'abierta',
                  abierta_at: new Date().toISOString(),
                  notas_apertura: notas,
                })
                .select('id')
                .single();
              if ((retry as any)?.error) {
                const msg = ((retry as any)?.error as any)?.message || (errIns as any)?.message || originalMsg || 'Error de conexión con la base de datos';
                return { success: false, error: msg } as const;
              }
              sesionId = ((retry as any)?.data as any)?.id || null;
            } else {
              const msg = (errIns as any)?.message || originalMsg || 'Error de conexión con la base de datos';
              return { success: false, error: msg } as const;
            }
          }
          sesionId = (creada as any)?.id || null;
        }

        const { data: sesionCompleta, error: errorSesion } = await supabase
          .from('caja_sesiones')
          .select('*')
          .eq('id', sesionId)
          .single();
        if (errorSesion) throw errorSesion;

        setSesionActual(sesionCompleta as any);
        setEstadoCaja('abierta');
        setRequiereSaneamiento(false);
        sesionIdRef.current = (sesionCompleta as any)?.id || null;
        return { success: true, data: sesionCompleta } as const;
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error abriendo caja:', err);
        setError(err.message);
        return { success: false, error: err.message } as const;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    sesionActual,
    estadoCaja: estadoCaja as 'abierta' | 'cerrada',
    loading,
    error,
  razonesBloqueo,
  cierreEnCurso,
  rpcValidacionHabilitada: rpcValidarDisponibleRef.current,
    abrirCaja,
    cerrarCaja,
    refrescarSesion: verificarSesionAbierta,
    requiereSaneamiento,
    cerrarSesionPrevia: () => cerrarCaja('Cierre manual de sesión previa'),
  };
};