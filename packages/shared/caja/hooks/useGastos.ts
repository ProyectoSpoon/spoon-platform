import { useState, useEffect, useCallback } from 'react';
import { GastoCaja, NuevoGasto, CategoriaGasto } from '../types/cajaTypes';
import {
  crearGastoCaja,
  getGastosDelDia,
  eliminarGastoCaja,
  getUserProfile
} from '@spoon/shared/lib/supabase';
import { useCajaSesion } from './useCajaSesion';
import { CAJA_MESSAGES } from '../constants/messages';

export const useGastos = () => {
  const { sesionActual, requiereSaneamiento } = useCajaSesion();
  const [gastos, setGastos] = useState<GastoCaja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalGastos, setTotalGastos] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<{
    [key in CategoriaGasto]: number;
  }>({
    proveedor: 0,
    servicios: 0,
    suministros: 0,
    otro: 0
  });

  // Obtener gastos del día
  const obtenerGastos = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) return;

      const datos = await getGastosDelDia(profile.restaurant_id);

      setGastos(datos.gastos);
      setTotalGastos(datos.totalGastos);
      setGastosPorCategoria(datos.gastosPorCategoria);
      setError(null);

    } catch (err: any) {
      console.error('Error obteniendo gastos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar gastos al montar el componente
  useEffect(() => {
    obtenerGastos();
  }, [obtenerGastos]);

  // Crear nuevo gasto
  const crearGasto = async (nuevoGasto: NuevoGasto) => {
    try {
      if (!sesionActual) {
        throw new Error('No hay sesión de caja abierta');
      }

      if (requiereSaneamiento) {
        throw new Error('Operación bloqueada: primero cierra la sesión previa antes de registrar gastos.');
      }

      setLoading(true);
      const profile = await getUserProfile();
      if (!profile) throw new Error('Usuario no autenticado');

      await crearGastoCaja(sesionActual.id, profile.id, {
        concepto: nuevoGasto.concepto,
        monto: nuevoGasto.monto,
        categoria: nuevoGasto.categoria,
        notas: nuevoGasto.notas,
        comprobante_url: nuevoGasto.comprobante_url
      });

      // Refrescar lista de gastos
      await obtenerGastos();

      return { success: true, message: CAJA_MESSAGES.GASTO_REGISTRADO };

    } catch (err: any) {
      console.error('Error creando gasto:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar gasto
  const eliminarGasto = async (gastoId: string) => {
    try {
      setLoading(true);

      await eliminarGastoCaja(gastoId);

      // Refrescar lista de gastos
      await obtenerGastos();

      return { success: true };

    } catch (err: any) {
      console.error('Error eliminando gasto:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Validar nuevo gasto
  const validarGasto = (gasto: NuevoGasto): { esValido: boolean; errores: string[] } => {
    const errores: string[] = [];

    if (!gasto.concepto || gasto.concepto.trim().length < 3) {
      errores.push('El concepto debe tener al menos 3 caracteres');
    }

    if (gasto.monto <= 0) {
      errores.push('El monto debe ser mayor a $0');
    }

    if (!gasto.categoria) {
      errores.push('Selecciona una categoría');
    }

    if (gasto.notas && gasto.notas.length > 500) {
      errores.push('Las notas no pueden exceder 500 caracteres');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  };

  // Obtener gastos por categoría
  const getGastosPorCategoria = (categoria: CategoriaGasto): GastoCaja[] => {
    return gastos.filter(gasto => gasto.categoria === categoria);
  };

  // Buscar gastos por concepto
  const buscarGastos = (termino: string): GastoCaja[] => {
    if (!termino.trim()) return gastos;

    const terminoBusqueda = termino.toLowerCase();
    return gastos.filter(gasto =>
      gasto.concepto.toLowerCase().includes(terminoBusqueda) ||
      gasto.categoria.toLowerCase().includes(terminoBusqueda) ||
      (gasto.notas && gasto.notas.toLowerCase().includes(terminoBusqueda))
    );
  };

  return {
    // Estado
    gastos,
    loading,
    error,
    totalGastos,
    gastosPorCategoria,

    // Acciones
    crearGasto,
    eliminarGasto,
    obtenerGastos,

    // Utilidades
    validarGasto,
    getGastosPorCategoria,
    buscarGastos,

    // Información de sesión
    sesionActual
  };
};
