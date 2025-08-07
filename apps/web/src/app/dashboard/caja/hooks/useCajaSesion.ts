import { useState, useEffect } from 'react';
import { CajaSesion } from '../../caja/types/cajaTypes';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';
import { CAJA_MESSAGES } from '../../caja/constants/cajaConstants';

export const useCajaSesion = () => {
  const [sesionActual, setSesionActual] = useState<CajaSesion | null>(null);
  const [estadoCaja, setEstadoCaja] = useState<'abierta' | 'cerrada'>('cerrada');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay sesión abierta al cargar
  useEffect(() => {
    verificarSesionAbierta();
  }, []);

  const verificarSesionAbierta = async () => {
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
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSesionActual(data);
        setEstadoCaja('abierta');
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
  };

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

  const cerrarCaja = async (notas?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!sesionActual) {
        throw new Error('No hay sesión activa para cerrar');
      }

      const { data, error } = await supabase
        .from('caja_sesiones')
        .update({
          estado: 'cerrada',
          cerrada_at: new Date().toISOString(),
          notas_cierre: notas
        })
        .eq('id', sesionActual.id)
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
  };

  return {
    sesionActual,
     estadoCaja: estadoCaja as 'abierta' | 'cerrada',
    loading,
    error,
    abrirCaja,
    cerrarCaja,
    refrescarSesion: verificarSesionAbierta
  };
};