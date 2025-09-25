import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface MenuRealtimeData {
  menuId: string;
  combinations: any[]; // GeneratedCombination[]
  selections: any[]; // DailyMenuSelection[]
  lastUpdate: Date;
}

export const useRealtimeMenu = (restaurantId: string, menuId: string) => {
  const [menuData, setMenuData] = useState<MenuRealtimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // ✅ FUNCIÓN PARA REFRESCAR DATOS DEL MENÚ
  const refrescarMenuData = useCallback(async (): Promise<MenuRealtimeData> => {
    try {
      // Obtener combinaciones generadas
      const { data: combinations } = await supabase
        .from('generated_combinations')
        .select('*')
        .eq('daily_menu_id', menuId)
        .order('created_at', { ascending: false });

      // Obtener selecciones del menú
      const { data: selections } = await supabase
        .from('daily_menu_selections')
        .select('*')
        .eq('daily_menu_id', menuId)
        .order('created_at', { ascending: false });

      return {
        menuId,
        combinations: combinations || [],
        selections: selections || [],
        lastUpdate: new Date()
      };

    } catch (error) {
      console.error('Error refrescando datos del menú:', error);
      throw error;
    }
  }, [menuId]);

  // ✅ EFECTO PARA CONFIGURAR SUSCRIPCIONES REALTIME
  useEffect(() => {
    if (!restaurantId || !menuId) return;

    setConnectionStatus('connecting');

    // 📡 SUSCRIPCIÓN A CAMBIOS EN COMBINACIONES
    const combinationsChannel = supabase
      .channel(`menu-combinations-${menuId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'generated_combinations',
        filter: `daily_menu_id=eq.${menuId}`
      }, async (payload) => {
        console.log('🍽️ Cambio en combinaciones:', payload.eventType, (payload.new as any)?.id);
        try {
          const nuevosDatos = await refrescarMenuData();
          setMenuData(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando menú tras cambio en combinaciones:', error);
        }
      })
      .subscribe((status) => {
        console.log('📡 Estado suscripción combinaciones:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      });

    // 📡 SUSCRIPCIÓN A CAMBIOS EN SELECCIONES
    const selectionsChannel = supabase
      .channel(`menu-selections-${menuId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_menu_selections',
        filter: `daily_menu_id=eq.${menuId}`
      }, async (payload) => {
        console.log('📝 Cambio en selecciones:', payload.eventType, (payload.new as any)?.id);
        try {
          const nuevosDatos = await refrescarMenuData();
          setMenuData(nuevosDatos);
        } catch (error) {
          console.error('Error actualizando menú tras cambio en selecciones:', error);
        }
      })
      .subscribe((status) => {
        console.log('📡 Estado suscripción selecciones:', status);
      });

    // 🧹 LIMPIEZA AL DESMONTAR
    return () => {
      console.log('🧹 Limpiando suscripciones realtime del menú');
      combinationsChannel.unsubscribe();
      selectionsChannel.unsubscribe();
    };
  }, [restaurantId, menuId, refrescarMenuData]);

  // ✅ EFECTO PARA CARGA INICIAL
  useEffect(() => {
    if (restaurantId && menuId) {
      refrescarMenuData().then(setMenuData).catch(console.error);
    }
  }, [restaurantId, menuId, refrescarMenuData]);

  return {
    menuData,
    isConnected,
    connectionStatus,
    refrescarMenuData
  };
};
