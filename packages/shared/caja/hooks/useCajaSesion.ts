"use client";

/**
 * Hook de sesión de caja conectado a BD (Supabase)
 * - Usa RPCs: abrir_caja_atomico y cerrar_caja_atomico
 * - Incluye fallback a operaciones directas si la RPC no existe
 * - Mantiene API compatible con consumidores actuales
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, getUserProfile, getActiveRoles } from '@spoon/shared/lib/supabase';
import { handleCajaError, classifyCajaError } from '../utils/errorHandling';
import { ensureCajaAbiertaYPermisos, validateMonto } from '../utils/validations';
import { toCentavos, toPesos } from '../utils/currency';
import { CAJA_ERROR_CODES, CAJA_MESSAGES, CAJA_LOG_MESSAGES } from '../constants/messages';

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
}

export const useCajaSesion = () => {
  const [sesion, setSesion] = useState<CajaSesion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sesionIdRef = useRef<string | null>(null);

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

  const abrirCaja = useCallback(async (montoInicial: number, notas?: string): Promise<ResultadoOperacion> => {
    try {
      setLoading(true);
      setError(null);

      // Guard de permisos: permitir solo cajero/administrador cuando roles estén definidos
      try {
        const roles = await getActiveRoles();
        if (Array.isArray(roles) && roles.length > 0) {
          const allowed = roles.some(r => ['cajero','admin','administrador','propietario'].includes(String(r).toLowerCase()));
          if (!allowed) {
            return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO] } as const;
          }
        }
      } catch { /* si no se pueden leer roles, no bloquear para compatibilidad */ }

      const profile = await getUserProfile();
      const rid = profile?.restaurant_id;
      if (!profile?.id || !rid) {
  return { success: false, error: 'Usuario o restaurante no válido' };
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
        if (Array.isArray(roles) && roles.length > 0) {
          const allowed = roles.some(r => ['cajero','admin','administrador','propietario'].includes(String(r).toLowerCase()));
          if (!allowed) {
            return { success: false, error: CAJA_MESSAGES[CAJA_ERROR_CODES.PERMISO_DENEGADO] } as const;
          }
        }
      } catch { /* ignore */ }
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

  return {
    // API principal usada por consumidores
    sesionActual: sesion,
    estadoCaja,
    loading,
    error,
    abrirCaja,
    cerrarCaja,
    refrescarSesion: cargarSesionActiva,

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
