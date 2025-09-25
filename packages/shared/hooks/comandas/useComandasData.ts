// ========================================
// USE COMANDAS DATA HOOK
// File: packages/shared/hooks/comandas/useComandasData.ts
// ========================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../Context/notification-provider';
import { supabase, getUserProfile, getUserRestaurant, hasAnyRole, getActiveRoles, getSesionCajaActiva } from '../../lib/supabase';
import { MenuApiService } from '../../services/menu-dia/menuApiService';
import { Producto, MenuCombinacion } from '../../types/menu-dia/menuTypes';

// ========================================
// INTERFACES PARA COMANDAS
// ========================================

export interface ComandaItem {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  notas?: string;
  categoria?: string;
}

export interface Comanda {
  id: string;
  mesaId: string;
  mesaNumero: number;
  items: ComandaItem[];
  subtotal: number;
  total: number;
  estado: 'abierta' | 'pagada' | 'cancelada';
  meseroId: string;
  meseroNombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  disponible: boolean;
  ubicacion?: string;
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useComandasData = () => {
  const { notify } = useNotification();

  // ✅ ESTADOS DE AUTENTICACIÓN
  const [auth, setAuth] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [cajaOpen, setCajaOpen] = useState<null | boolean>(null);

  // ✅ ESTADOS PRINCIPALES
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [menuDelDia, setMenuDelDia] = useState<any>(null);
  const [combinacionesMenu, setCombinacionesMenu] = useState<MenuCombinacion[]>([]);
  const [comandaActual, setComandaActual] = useState<Comanda | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);

  // ✅ ESTADOS DE LOADING
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingComanda, setLoadingComanda] = useState(false);

  // ✅ FUNCIÓN PARA NOTIFICACIONES
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    notify(type, message);
  }, [notify]);

  // ✅ FUNCIÓN PARA VERIFICAR AUTENTICACIÓN Y AUTORIZACIÓN
  const verificarAcceso = useCallback(async (): Promise<boolean> => {
    try {
      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuth('denied');
        return false;
      }

      // Verificar rol mesero
      const requestedRoles = ['mesero', 'waiter', 'mozo', 'admin', 'administrador', 'owner', 'propietario', 'dueño', 'dueno', 'gerente', 'manager'];
      let allowed = await hasAnyRole(requestedRoles);

      if (!allowed) {
        // Fallback de desarrollo
        if (process.env.NODE_ENV !== 'production') {
          allowed = true;
        } else {
          setAuth('denied');
          return false;
        }
      }

      setAuth('ok');
      return true;

    } catch (error) {
      console.error('Error verificando acceso:', error);
      setAuth('denied');
      return false;
    }
  }, []);

  // ✅ FUNCIÓN PARA VERIFICAR CAJA ABIERTA
  const verificarCajaAbierta = useCallback(async (restaurantId: string): Promise<boolean> => {
    try {
      const sesion = await getSesionCajaActiva(restaurantId);
      const abierta = !!sesion;
      setCajaOpen(abierta);
      return abierta;
    } catch (error) {
      console.error('Error verificando caja:', error);
      setCajaOpen(false);
      return false;
    }
  }, []);

  // ✅ FUNCIÓN PARA CARGAR DATOS INICIALES
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setAuth('checking');

      // Verificar acceso
      const accesoPermitido = await verificarAcceso();
      if (!accesoPermitido) {
        return;
      }

      const [_profile, restaurant] = await Promise.all([
        getUserProfile(),
        getUserRestaurant()
      ]);

      if (restaurant) {
        setRestaurantId(restaurant.id);

        // Verificar caja abierta
        const cajaAbierta = await verificarCajaAbierta(restaurant.id);
        if (!cajaAbierta) {
          // No cargar mesas ni menú si caja está cerrada
          return;
        }

        // Cargar mesas del restaurante
        await loadMesas(restaurant.id);

        // Cargar menú del día si existe
        await loadMenuDelDia(restaurant.id);
      }

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showNotification('Error al cargar información', 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [showNotification, verificarAcceso, verificarCajaAbierta]);

  // ✅ FUNCIÓN PARA CARGAR MESAS
  const loadMesas = useCallback(async (restaurantId: string) => {
    try {
      setLoadingMesas(true);

      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('numero');

      if (error) throw error;

      const mesasTransformadas: Mesa[] = (data || []).map(mesa => ({
        id: mesa.id,
        numero: mesa.numero,
        capacidad: mesa.capacidad || 4,
        disponible: mesa.disponible !== false, // por defecto true
        ubicacion: mesa.ubicacion
      }));

      setMesas(mesasTransformadas);

    } catch (error) {
      console.error('Error cargando mesas:', error);
      showNotification('Error al cargar mesas', 'error');
    } finally {
      setLoadingMesas(false);
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA CARGAR MENÚ DEL DÍA
  const loadMenuDelDia = useCallback(async (restaurantId: string) => {
    try {
      setLoadingMenu(true);

      const menu = await MenuApiService.getTodayMenu(restaurantId);

      if (menu) {
        setMenuDelDia(menu);

        // Cargar combinaciones del menú
        const combinaciones = await MenuApiService.getMenuCombinations(menu.id);
        const combinacionesTransformadas: MenuCombinacion[] = (combinaciones || []).map(combo => ({
          id: combo.id,
          nombre: combo.combination_name,
          descripcion: combo.combination_description,
          precio: combo.combination_price,
          disponible: combo.is_available,
          disponibleHoy: combo.available_today,
          favorito: combo.is_favorite,
          destacado: combo.is_featured,
          cantidadMaxima: combo.max_daily_quantity,
          cantidadVendida: combo.current_sold_quantity,
          fechaCreacion: combo.generated_at,
          specialDishId: combo.special_dish_id
        }));

        setCombinacionesMenu(combinacionesTransformadas);
      } else {
        setMenuDelDia(null);
        setCombinacionesMenu([]);
      }

    } catch (error) {
      console.error('Error cargando menú del día:', error);
      showNotification('Error al cargar menú del día', 'error');
    } finally {
      setLoadingMenu(false);
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA SELECCIONAR MESA
  const seleccionarMesa = useCallback(async (mesa: Mesa) => {
    try {
      setMesaSeleccionada(mesa);

      // Verificar si hay una comanda abierta para esta mesa
      const comandaExistente = await buscarComandaAbierta(mesa.id);

      if (comandaExistente) {
        setComandaActual(comandaExistente);
        showNotification(`Comanda existente cargada para mesa ${mesa.numero}`);
      } else {
        // Crear nueva comanda vacía
        const nuevaComanda: Comanda = {
          id: `temp-${Date.now()}`, // ID temporal hasta guardar
          mesaId: mesa.id,
          mesaNumero: mesa.numero,
          items: [],
          subtotal: 0,
          total: 0,
          estado: 'abierta',
          meseroId: '', // TODO: obtener del usuario actual
          meseroNombre: '', // TODO: obtener del usuario actual
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setComandaActual(nuevaComanda);
        showNotification(`Nueva comanda iniciada para mesa ${mesa.numero}`);
      }

    } catch (error) {
      console.error('Error seleccionando mesa:', error);
      showNotification('Error al seleccionar mesa', 'error');
    }
  }, [showNotification]);

  // ✅ FUNCIÓN PARA BUSCAR COMANDA ABIERTA
  const buscarComandaAbierta = useCallback(async (mesaId: string): Promise<Comanda | null> => {
    try {
      // TODO: Implementar búsqueda en base de datos
      // Por ahora retorna null para simular que no hay comanda abierta
      return null;
    } catch (error) {
      console.error('Error buscando comanda abierta:', error);
      return null;
    }
  }, []);

  // ✅ FUNCIÓN PARA AGREGAR ITEM A LA COMANDA
  const agregarItemAComanda = useCallback(async (combinacion: MenuCombinacion) => {
    if (!comandaActual) {
      showNotification('No hay comanda activa', 'error');
      return;
    }

    try {
      const nuevoItem: ComandaItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        productoId: combinacion.id,
        nombre: combinacion.nombre || 'Sin nombre',
        cantidad: 1,
        precioUnitario: combinacion.precio || 0,
        precioTotal: combinacion.precio || 0,
        notas: '',
        categoria: 'menú del día'
      };

      const itemsActualizados = [...comandaActual.items, nuevoItem];
      const subtotal = itemsActualizados.reduce((sum, item) => sum + item.precioTotal, 0);

      const comandaActualizada: Comanda = {
        ...comandaActual,
        items: itemsActualizados,
        subtotal,
        total: subtotal, // TODO: agregar impuestos, propinas, etc.
        updatedAt: new Date().toISOString()
      };

      setComandaActual(comandaActualizada);
      showNotification(`"${nuevoItem.nombre}" agregado a la comanda`);

    } catch (error) {
      console.error('Error agregando item:', error);
      showNotification('Error al agregar item', 'error');
    }
  }, [comandaActual, showNotification]);

  // ✅ FUNCIÓN PARA REMOVER ITEM DE LA COMANDA
  const removerItemDeComanda = useCallback(async (itemId: string) => {
    if (!comandaActual) return;

    try {
      const itemsActualizados = comandaActual.items.filter(item => item.id !== itemId);
      const subtotal = itemsActualizados.reduce((sum, item) => sum + item.precioTotal, 0);

      const comandaActualizada: Comanda = {
        ...comandaActual,
        items: itemsActualizados,
        subtotal,
        total: subtotal,
        updatedAt: new Date().toISOString()
      };

      setComandaActual(comandaActualizada);
      showNotification('Item removido de la comanda');

    } catch (error) {
      console.error('Error removiendo item:', error);
      showNotification('Error al remover item', 'error');
    }
  }, [comandaActual, showNotification]);

  // ✅ FUNCIÓN PARA GUARDAR COMANDA
  const guardarComanda = useCallback(async () => {
    if (!comandaActual || !restaurantId) {
      showNotification('No hay comanda para guardar', 'error');
      return;
    }

    try {
      setLoadingComanda(true);

      // TODO: Implementar guardado en base de datos
      // Por ahora solo simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('Comanda guardada exitosamente');

    } catch (error) {
      console.error('Error guardando comanda:', error);
      showNotification('Error al guardar comanda', 'error');
    } finally {
      setLoadingComanda(false);
    }
  }, [comandaActual, restaurantId, showNotification]);

  // ✅ CARGAR DATOS AL MONTAR
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ✅ RETORNAR ESTADO Y FUNCIONES
  return {
    // Estados de autenticación
    auth,
    cajaOpen,

    // Estados
    restaurantId,
    mesas,
    menuDelDia,
    combinacionesMenu,
    comandaActual,
    mesaSeleccionada,

    // Estados de loading
    initialLoading,
    loadingMesas,
    loadingMenu,
    loadingComanda,

    // Funciones
    showNotification,
    loadInitialData,
    loadMesas,
    loadMenuDelDia,
    seleccionarMesa,
    agregarItemAComanda,
    removerItemDeComanda,
    guardarComanda
  };
};
