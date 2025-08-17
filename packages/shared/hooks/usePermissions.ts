// ========================================
// HOOK DE PERMISOS
// File: packages/shared/hooks/usePermissions.ts
// ========================================

import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserRestaurant } from '../lib/supabase';

interface UserPermissions {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string; // legacy
  };
  role: {
    id: string;
    name: string;
    description: string;
  } | null;
  permissions: string[];
  restaurant_id: string;
}

export const usePermissions = () => {
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuario actual
      const user = await getCurrentUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Obtener restaurante
      const restaurant = await getUserRestaurant();
      if (!restaurant) {
        setError('Restaurante no encontrado');
        return;
      }

      // Llamar a la función RPC para obtener permisos
      const { data, error: rpcError } = await supabase.rpc('get_user_permissions', {
        p_user_id: user.id,
        p_restaurant_id: restaurant.id
      });

      if (rpcError) {
        console.error('Error obteniendo permisos:', rpcError);
        setError('Error cargando permisos');
        return;
      }

      setUserPermissions(data);
    } catch (err) {
      console.error('Error en loadUserPermissions:', err);
      setError('Error cargando permisos del usuario');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    if (!userPermissions) return false;
    
    // Si es propietario o administrador, tiene todos los permisos
    if (userPermissions.role?.name === 'propietario' || userPermissions.role?.name === 'administrador') {
      return true;
    }

    // Verificar en la lista de permisos
    return userPermissions.permissions.includes(permission);
  };

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (roleName: string): boolean => {
    return userPermissions?.role?.name === roleName;
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!userPermissions?.role) return false;
    return roleNames.includes(userPermissions.role.name);
  };

  /**
   * Obtener información del rol actual
   */
  const getCurrentRole = () => {
    return userPermissions?.role || null;
  };

  /**
   * Obtener lista de todos los permisos del usuario
   */
  const getAllPermissions = (): string[] => {
    return userPermissions?.permissions || [];
  };

  /**
   * Verificar si es propietario (acceso total)
   */
  const isOwner = (): boolean => {
    return hasRole('propietario');
  };

  /**
   * Verificar si es administrador (acceso técnico completo)
   */
  const isAdmin = (): boolean => {
    return hasRole('administrador');
  };

  /**
   * Verificar si tiene permisos administrativos (propietario o administrador)
   */
  const hasAdminAccess = (): boolean => {
    return isOwner() || isAdmin();
  };

  /**
   * Refrescar permisos del usuario
   */
  const refreshPermissions = () => {
    loadUserPermissions();
  };

  /**
   * Obtener display name del rol actual
   */
  const getCurrentRoleDisplayName = (): string => {
    if (!userPermissions?.role) return 'Sin rol';
    
    const roleDisplayNames: Record<string, string> = {
      'propietario': '👔 Propietario',
      'gerente': '👨‍💼 Gerente',
      'cajero': '💰 Cajero',
      'mesero': '🍽️ Mesero',
      'cocinero': '👨‍🍳 Cocinero',
      'administrador': '⚙️ Administrador'
    };

    return roleDisplayNames[userPermissions.role.name] || userPermissions.role.name;
  };

  return {
    // Estado
    userPermissions,
    loading,
    error,

    // Funciones de verificación
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isOwner,
    isAdmin,
    hasAdminAccess,

    // Funciones de información
    getCurrentRole,
    getAllPermissions,
    getCurrentRoleDisplayName,

    // Utilidades
    refreshPermissions
  };
};