import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';
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
  // Monto inicial en centavos (algunas vistas lo requieren para balance)
  monto_inicial?: number;
}

export const useCajaSesion = () => {
  const [sesionActual, setSesionActual] = useState<CajaSesion | null>(null);
  const [estadoCaja, setEstadoCaja] = useState<'abierta' | 'cerrada'>('cerrada');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiereSaneamiento, setRequiereSaneamiento] = useState(false);
  const saneadorEjecutado = useRef(false);
  const sesionIdRef = useRef<string | null>(null);

  // Hook de mesas para validar estados (solo lectura)
  const { mesasCompletas, configuracion } = useMesas();

  const cerrarCaja = useCallback(async (notas?: string, opts?: { omitValidacion?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const profile = await getUserProfile();
      const currentSesionId = sesionIdRef.current || (sesionActual as any)?.id;
      if (!profile?.restaurant_id || !currentSesionId) {
        throw new Error('No hay sesión activa para cerrar');
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
        try {
          const { data: validacion, error: rpcError } = await supabase.rpc('validar_cierre_caja', {
            p_restaurant_id: profile.restaurant_id,
            p_sesion_id: currentSesionId,
          });
          if (rpcError) {
            rpcFallo = true;
          } else if (validacion && (validacion as any).bloqueado) {
            throw new Error('No se puede cerrar la caja: hay órdenes de mesa activas.');
          }
        } catch (e: any) {
          // Si la RPC falla por cualquier razón, activamos el fallback
          if (!e?.message?.includes('No se puede cerrar la caja')) {
            rpcFallo = true;
          } else {
            throw e;
          }
        }

        // Paso 2 (fallback): validar órdenes activas si la RPC falló
        if (rpcFallo) {
          try {
            const profile2 = await getUserProfile();
            const qOrRes: any = await supabase
              .from('ordenes_mesa')
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

      // Paso 3: Cerrar sesión
      const { data, error } = await supabase
        .from('caja_sesiones')
        .update({
          estado: 'cerrada',
          cerrada_at: new Date().toISOString(),
          notas_cierre: notas,
        })
        .eq('id', currentSesionId)
        .select()
        .single();

      if (error) throw error;

      setSesionActual(null);
      setEstadoCaja('cerrada');
      setRequiereSaneamiento(false);
      return { success: true, data } as const;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error cerrando caja:', err);
      setError(err.message);
      return { success: false, error: err.message } as const;
    } finally {
      setLoading(false);
    }
  }, [sesionActual]);

  const verificarSesionAbierta = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) return;

  const { data, error } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('estado', 'abierta')
        .order('abierta_at', { ascending: false })
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Comparar fechas en zona 'America/Bogota'
        const fmt = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Bogota',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const hoyBogota = fmt.format(new Date()); // YYYY-MM-DD
        const abiertaAt = new Date((data as any).abierta_at || (data as any).fechaApertura);
        const abiertaDiaBogota = fmt.format(abiertaAt);
        const esDeDiaPrevio = abiertaDiaBogota < hoyBogota;

        if (esDeDiaPrevio) {
          // Marcar como abierta provisionalmente y tratar autocierre una sola vez
          setSesionActual(data as any);
          setEstadoCaja('abierta');
          setRequiereSaneamiento(false);
          try {
            if (!saneadorEjecutado.current) {
              let evitarCierre = false;
              let permitirCierre = false;
              // Prevalidación única para no duplicar llamadas RPC
              try {
                const { data: valid, error: rpcErr } = await supabase.rpc('validar_cierre_caja', {
                  p_restaurant_id: profile.restaurant_id,
                  p_sesion_id: (data as any).id,
                });
                if (rpcErr) {
                  evitarCierre = true;
                } else if (valid && (valid as any).bloqueado) {
                  evitarCierre = true;
                } else {
                  permitirCierre = true;
                }
              } catch {
                // Si la RPC rechazó o falló, evitar autocierre y requerir saneamiento
                evitarCierre = true;
              }

              if (evitarCierre) {
                setSesionActual(data as any);
                setEstadoCaja('abierta');
                setRequiereSaneamiento(true);
                return;
              }

              saneadorEjecutado.current = true;
              sesionIdRef.current = (data as any).id || null;
              const cierre = await cerrarCaja('Cierre automático: sesión previa', { omitValidacion: true });
              if (!cierre.success) {
                setSesionActual(data as any);
                setEstadoCaja('abierta');
                setRequiereSaneamiento(true);
              } else {
                setSesionActual(null);
                setEstadoCaja('cerrada');
                setRequiereSaneamiento(false);
              }
            }
          } catch {
            setSesionActual(data as any);
            setEstadoCaja('abierta');
            setRequiereSaneamiento(true);
          }
          return;
        } else {
          setSesionActual(data as any);
          setEstadoCaja('abierta');
          setRequiereSaneamiento(false);
          return;
        }
      } else {
        setSesionActual(null);
        setEstadoCaja('cerrada');
      }
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

  const abrirCaja = useCallback(
    async (montoInicial: number, notas?: string, cajeroId?: string) => {
      try {
        setLoading(true);
        setError(null);

        const profile = await getUserProfile();
        if (!profile?.restaurant_id) {
          throw new Error('Usuario sin restaurante asignado');
        }

    // Normalizar: montoInicial llega en pesos desde el modal → convertir a centavos
    const montoInicialCentavos = Math.round((montoInicial || 0) * 100);

    // Implementación atómica vía RPC, con fallback solo si la función no existe
        let sesionId: string | null = null;
        try {
          const { data, error } = await supabase.rpc('abrir_caja_atomico', {
            p_restaurant_id: profile.restaurant_id,
            p_cajero_id: cajeroId || (profile as any).id,
      p_monto_inicial: montoInicialCentavos,
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
              cajero_id: cajeroId || (profile as any).id,
        monto_inicial: montoInicialCentavos,
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
                  cajero_id: cajeroId || (profile as any).id,
                  monto_inicial: montoInicial, // en pesos
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
    abrirCaja,
    cerrarCaja,
    refrescarSesion: verificarSesionAbierta,
    requiereSaneamiento,
    cerrarSesionPrevia: () => cerrarCaja('Cierre manual de sesión previa'),
  };
};