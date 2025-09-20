'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getUserRestaurant } from '@spoon/shared/lib/supabase';
import { 
  MenuDelDiaSimple, 
  CombinacionSimple, 
  EstadoMenuDelDia 
} from '../types/domiciliosTypes';
import { getBogotaDateISO } from '@spoon/shared/utils/datetime';

export const useMenuDelDia = () => {
  // ✅ ESTADO PRINCIPAL
  const [estado, setEstado] = useState<EstadoMenuDelDia>({
    menu: null,
    loading: true,
    error: null 
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // ✅ FUNCIÓN PARA MOSTRAR NOTIFICACIONES
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      console.log('✅ SUCCESS:', message);
      alert('✅ ' + message);
    } else {
      console.error('❌ ERROR:', message);
      alert('❌ ' + message);
    }
  }, []);

  // ✅ CARGAR RESTAURANT ID
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (restaurant) {
          setRestaurantId(restaurant.id);
        }
      } catch (error) {
        console.error('Error cargando restaurante:', error);
      }
    };
    loadRestaurant();
  }, []);

  // ✅ CARGAR MENÚ DEL DÍA ACTUAL
  const cargarMenuDelDia = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));

  // Fecha de hoy respetando zona America/Bogota
  const fechaHoy = getBogotaDateISO();

      // Buscar menú del día actual
      const { data: menuData, error: menuError } = await supabase
        .from('daily_menus')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('menu_date', fechaHoy)
        .or('status.eq.active,status.eq.published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // evita 406 cuando no hay fila

      if (menuError) throw menuError;

      if (!menuData) {
        setEstado(prev => ({
          ...prev,
          menu: null,
          loading: false,
          error: 'No hay menú configurado para hoy'
        }));
        return;
      }

      // Cargar combinaciones del menú
      const { data: combinaciones, error: combError } = await supabase
        .from('generated_combinations')
        .select('*')
        .eq('daily_menu_id', menuData.id)
        .order('combination_name');

      if (combError) throw combError;

      // Transformar datos para el formato simplificado
      const menuCompleto: MenuDelDiaSimple = {
        id: menuData.id,
        menu_date: menuData.menu_date,
        menu_price: menuData.menu_price,
        combinaciones: (combinaciones || []).map(comb => ({
          id: comb.id,
          combination_name: comb.combination_name,
          combination_description: comb.combination_description || '',
          combination_price: comb.combination_price,
          is_available: comb.is_available ?? true
        }))
      };

      setEstado(prev => ({
        ...prev,
        menu: menuCompleto,
        loading: false,
        error: null
      }));

      console.log(`✅ Menú del día cargado: ${combinaciones}`);


    } catch (error) {
      console.error('Error cargando menú del día:', error);
      setEstado(prev => ({
        ...prev,
        menu: null,
        loading: false,
        error: 'Error al cargar el menú del día'
      }));
    }
  }, [restaurantId]);

  // ✅ ACTUALIZAR DISPONIBILIDAD DE COMBINACIÓN
  const actualizarDisponibilidad = useCallback(async (combinacionId: string, disponible: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_combinations')
        .update({ 
          is_available: disponible,
          updated_at: new Date().toISOString()
        })
        .eq('id', combinacionId);

      if (error) throw error;

      // Actualizar estado local inmediatamente
      setEstado(prev => ({
        ...prev,
        menu: prev.menu ? {
          ...prev.menu,
          combinaciones: prev.menu.combinaciones.map(comb =>
            comb.id === combinacionId 
              ? { ...comb, is_available: disponible }
              : comb
          )
        } : null
      }));

      const mensaje = disponible ? 'Combinación activada' : 'Combinación desactivada';
      showNotification(mensaje);

    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      showNotification('Error al actualizar disponibilidad', 'error');
    }
  }, [showNotification]);

  // ✅ OBTENER COMBINACIONES DISPONIBLES
  const combinacionesDisponibles = estado.menu?.combinaciones.filter(
    comb => comb.is_available
  ) || [];

  // ✅ OBTENER COMBINACIONES AGOTADAS
  const combinacionesAgotadas = estado.menu?.combinaciones.filter(
    comb => !comb.is_available
  ) || [];

  // ✅ VERIFICAR SI HAY MENÚ PARA HOY (debe haber al menos 1 combinación disponible)
  const hayMenuHoy = (estado.menu?.combinaciones.filter(c => c.is_available).length || 0) > 0;

  // ✅ CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    if (restaurantId) {
      cargarMenuDelDia();
    }
  }, [restaurantId, cargarMenuDelDia]);

  // ✅ SUSCRIPCIÓN EN TIEMPO REAL PARA CAMBIOS EN EL MENÚ
  useEffect(() => {
    if (!restaurantId || !estado.menu?.id) return;

    const channel = supabase
      .channel('menu_combinations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_combinations',
          filter: `daily_menu_id=eq.${estado.menu.id}`,
        },
        (payload) => {
          console.log('Cambio en combinaciones:', payload);
          cargarMenuDelDia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, estado.menu?.id, cargarMenuDelDia]);

  return {
    // Estado
    menu: estado.menu,
    loading: estado.loading,
    error: estado.error,
    hayMenuHoy,

    // Datos derivados
    combinacionesDisponibles,
    combinacionesAgotadas,
  totalCombinaciones: estado.menu?.combinaciones.filter(c => c.is_available).length || 0,

    // Funciones
    cargarMenuDelDia,
    actualizarDisponibilidad,
    showNotification
  };
};


