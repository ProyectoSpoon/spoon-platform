'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getUserRestaurant } from '@spoon/shared/lib/supabase';
import {
  Domiciliario,
  EstadoDomiciliario,
  EstadoDomiciliarios
} from '../types/domiciliosTypes';
import { ESTADOS_DOMICILIARIO } from '../constants/domiciliosConstants';

export const useDomiciliarios = () => {
  const [estado, setEstado] = useState<EstadoDomiciliarios>({
    domiciliarios: [],
    loading: true,
    error: null
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const prefix = type === 'success' ? '✅' : '❌';
    console[type === 'success' ? 'log' : 'error'](`${prefix} ${message}`);
    // Puedes reemplazar por toast.success / toast.error aquí
    // alert(`${prefix} ${message}`);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadRestaurant = async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (restaurant && isMounted) {
          setRestaurantId(restaurant.id);
        }
      } catch (error) {
        console.error('Error cargando restaurante:', error);
      }
    };
    loadRestaurant();
    return () => {
      isMounted = false;
    };
  }, []);

  const cargarDomiciliarios = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));

      const { data: domiciliarios, error } = await supabase
        .from('delivery_personnel')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setEstado(prev => ({
        ...prev,
        domiciliarios: domiciliarios || [],
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error cargando domiciliarios:', error);
      setEstado(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los domiciliarios'
      }));
    }
  }, [restaurantId]);

  const agregarDomiciliario = useCallback(async (nombre: string, telefono: string) => {
    if (!restaurantId) return;

    try {
      setEstado(prev => ({ ...prev, loading: true }));

      const { error } = await supabase
        .from('delivery_personnel')
        .insert({
          restaurant_id: restaurantId,
          name: nombre.trim(),
          phone: telefono.trim(),
          status: ESTADOS_DOMICILIARIO.DISPONIBLE,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await cargarDomiciliarios();
      showNotification('Domiciliario agregado exitosamente');

    } catch (error) {
      console.error('Error agregando domiciliario:', error);
      showNotification('Error al agregar domiciliario', 'error');
    }
  }, [restaurantId, cargarDomiciliarios, showNotification]);

  const actualizarEstado = useCallback(async (id: string, nuevoEstado: EstadoDomiciliario) => {
    try {
      const { error } = await supabase
        .from('delivery_personnel')
        .update({
          status: nuevoEstado,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setEstado(prev => ({
        ...prev,
        domiciliarios: prev.domiciliarios.map(d =>
          d.id === id ? { ...d, status: nuevoEstado } : d
        )
      }));

      showNotification('Estado actualizado correctamente');

    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotification('Error al actualizar estado', 'error');
    }
  }, [showNotification]);

  const desactivarDomiciliario = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_personnel')
        .update({
          is_active: false,
          status: ESTADOS_DOMICILIARIO.DESCONECTADO,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await cargarDomiciliarios();
      showNotification('Domiciliario desactivado');

    } catch (error) {
      console.error('Error desactivando domiciliario:', error);
      showNotification('Error al desactivar domiciliario', 'error');
    }
  }, [cargarDomiciliarios, showNotification]);

  const domiciliariosDisponibles = estado.domiciliarios.filter(
    d => d.status === ESTADOS_DOMICILIARIO.DISPONIBLE
  );

  const domiciliariosOcupados = estado.domiciliarios.filter(
    d => d.status === ESTADOS_DOMICILIARIO.OCUPADO
  );

  useEffect(() => {
    if (restaurantId) {
      cargarDomiciliarios();
    }
  }, [restaurantId, cargarDomiciliarios]);

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel('delivery_personnel_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_personnel',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          console.log('Cambio en domiciliarios:', payload);
          cargarDomiciliarios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, cargarDomiciliarios]);

  return {
    domiciliarios: estado.domiciliarios,
    domiciliariosDisponibles,
    domiciliariosOcupados,
    loading: estado.loading,
    error: estado.error,
    cargarDomiciliarios,
    agregarDomiciliario,
    actualizarEstado,
    desactivarDomiciliario,
    showNotification
  };
};
