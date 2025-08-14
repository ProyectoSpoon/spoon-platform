import { useState, useEffect, useRef, useCallback } from 'react';
import { CajaSesion } from '../../caja/types/cajaTypes';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';
import { CAJA_MESSAGES } from '../../caja/constants/cajaConstants';

export const useCajaSesion = () => {
  const [sesionActual, setSesionActual] = useState<CajaSesion | null>(null);
  const [estadoCaja, setEstadoCaja] = useState<'abierta' | 'cerrada'>('cerrada');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiereSaneamiento, setRequiereSaneamiento] = useState(false);
  const saneadorEjecutado = useRef(false);
  const sesionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sesionIdRef.current = sesionActual?.id ?? null;
  }, [sesionActual?.id]);

  const cerrarCaja = useCallback(async (notas?: string) => {
    try {
      setLoading(true);
      setError(null);

      const currentSesionId = sesionIdRef.current;
      if (!currentSesionId) {
        throw new Error('No hay sesión activa para cerrar');
      }

      // Validación previa: no cerrar si hay órdenes pendientes por cobrar
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) {
        throw new Error('Usuario sin restaurante asignado');
      }

      // Intentar validar con RPC si existe; de lo contrario, fallback a consulta simple
    try {
        const { data: validacion } = await supabase.rpc('validar_cierre_caja', {
          p_restaurant_id: profile.restaurant_id,
      p_sesion_id: currentSesionId
        });
        if (validacion && validacion.bloqueado) {
          throw new Error(validacion.mensaje || 'No se puede cerrar la caja. Hay pendientes.');
        }
      } catch {
        // Fallback: verificar órdenes activas
        const { data: ordenesPend, error: errPend } = await supabase
          .from('ordenes_mesa')
          .select('id')
          .eq('restaurant_id', profile.restaurant_id)
          .eq('estado', 'activa')
          .limit(1);
        if (errPend) {
          console.warn('Advertencia al validar cierre (fallback):', errPend);
        }
        if (ordenesPend && ordenesPend.length > 0) {
          throw new Error('No se puede cerrar la caja: hay órdenes de mesa activas.');
        }
      }

  const { data, error } = await supabase
        .from('caja_sesiones')
        .update({
          estado: 'cerrada',
          cerrada_at: new Date().toISOString(),
          notas_cierre: notas
        })
        .eq('id', currentSesionId)
        .select()
        .single();

      if (error) throw error;

      setSesionActual(null);
      setEstadoCaja('cerrada');
      return { success: true, data };

    } catch (err: any) {
      console.error('Error cerrando caja:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

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
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSesionActual(data);
        setEstadoCaja('abierta');
        // Saneador: si la sesión es de un día anterior, intentar cierre automático una vez
        try {
          const inicioHoy = new Date();
          inicioHoy.setHours(0, 0, 0, 0);
          const abiertaAt = new Date((data as any).abierta_at || (data as any).fechaApertura);
          if (abiertaAt && abiertaAt < inicioHoy) {
            if (!saneadorEjecutado.current) {
              saneadorEjecutado.current = true;
              const cierre = await cerrarCaja('Cierre automático: sesión previa');
              if (!cierre.success) {
                setRequiereSaneamiento(true);
              } else {
                setRequiereSaneamiento(false);
              }
            }
          } else {
            setRequiereSaneamiento(false);
          }
        } catch {
          setRequiereSaneamiento(true);
        }
      } else {
        setSesionActual(null);
        setEstadoCaja('cerrada');
      }
    } catch (err: any) {
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

const abrirCaja = async (montoInicial: number, notas?: string) => {
  try {
    setLoading(true);
    setError(null);

    const profile = await getUserProfile();
    if (!profile?.restaurant_id) {
      throw new Error('Usuario sin restaurante asignado');
    }

    // NUEVA IMPLEMENTACIÓN ATÓMICA
    const { data, error } = await supabase.rpc('abrir_caja_atomico', {
      p_restaurant_id: profile.restaurant_id,
      p_cajero_id: profile.id,
      p_monto_inicial: montoInicial,
      p_notas: notas
    });

    if (error) {
      console.error('Error en RPC:', error);
      throw new Error('Error de conexión con la base de datos');
    }

    // Manejar respuesta de la función
    if (!data.success) {
      if (data.error_code === 'CAJA_YA_ABIERTA') {
        throw new Error('Ya existe una caja abierta. Actualiza la página e intenta nuevamente.');
      }
      throw new Error(data.message || 'Error desconocido');
    }

    // Obtener los datos completos de la sesión creada
    const { data: sesionCompleta, error: errorSesion } = await supabase
      .from('caja_sesiones')
      .select('*')
      .eq('id', data.sesion_id)
      .single();

    if (errorSesion) throw errorSesion;

    setSesionActual(sesionCompleta);
    setEstadoCaja('abierta');
    return { success: true, data: sesionCompleta };

  } catch (err: any) {
    console.error('Error abriendo caja:', err);
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};

  return {
    sesionActual,
     estadoCaja: estadoCaja as 'abierta' | 'cerrada',
    loading,
    error,
    abrirCaja,
    cerrarCaja,
  refrescarSesion: verificarSesionAbierta,
  requiereSaneamiento,
  cerrarSesionPrevia: () => cerrarCaja('Cierre manual de sesión previa')
  };
};