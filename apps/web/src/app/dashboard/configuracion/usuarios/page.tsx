'use client';

import React, { useCallback, useState } from 'react';
import { useNotifications } from '@spoon/shared/Context/notification-context';
import { Users, Settings, FileText } from 'lucide-react';
import { Tabs } from '@spoon/shared/components/ui/Tabs';
import { usePermissions } from '@spoon/shared/hooks/usePermissions';
import { SinPermisos } from '@spoon/shared/components/ui/SinPermisos';
import { getUserRestaurant } from '@spoon/shared/lib/supabase';
import { UsuariosTab } from './components/UsuariosTab';
import { ConfiguracionRolesTab } from './components/ConfiguracionRolesTab';
import { AuditoriaTab } from './components/AuditoriaTab';
import { EstadisticasUsuarios } from './components/EstadisticasUsuarios';
import type { UsuarioRestaurante, RoleSistema, EstadisticasUsuarios as EstadisticasUsuariosType } from '@spoon/shared/services/usuarios';

// Type casting para componentes
const UsersCast = Users as any;
const SettingsCast = Settings as any;
const FileTextCast = FileText as any;
const TabsCast = Tabs as any;
const SinPermisosCast = SinPermisos as any;

export default function ConfiguracionUsuariosPage() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { hasPermission } = usePermissions();

  // Estados para datos
  const [usuarios, setUsuarios] = useState<UsuarioRestaurante[]>([]);
  const [roles, setRoles] = useState<RoleSistema[]>([]);
  const [permisos, setPermisos] = useState<Record<string, any>>({});
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuariosType>({
    usuariosActivos: 0,
    cajeros: 0,
    meseros: 0,
    cocineros: 0,
    gerentes: 0,
  total: 0,
  porRol: {}
  });

  // Cargar datos al montar
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Cargar usuarios, roles y estadísticas
        const { UsuariosService } = await import('@spoon/shared/services/usuarios');
        const [usuariosData, statsData] = await Promise.all([
          UsuariosService.getUsuariosRestaurante(),
          UsuariosService.getEstadisticas()
        ]);

        if (usuariosData.data) setUsuarios(usuariosData.data);
        if (statsData.data) setEstadisticas(statsData.data);

        if (usuariosData.error) {
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'Error al cargar los datos de usuarios'
          });
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar la configuración de usuarios'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // empty deps to avoid re-fetch loop when notification context identity changes
  }, []);

  // Funciones para refrescar datos
  const refrescarUsuarios = useCallback(async () => {
    try {
      const { UsuariosService } = await import('@spoon/shared/services/usuarios');
      const [usuariosData, statsData] = await Promise.all([
        UsuariosService.getUsuariosRestaurante(),
        UsuariosService.getEstadisticas()
      ]);

      if (usuariosData.data) setUsuarios(usuariosData.data);
      if (statsData.data) setEstadisticas(statsData.data);
    } catch (error) {
      console.error('Error refrescando usuarios:', error);
    }
  }, []);

  // Lazy load de roles y permisos cuando se abre la pestaña
  React.useEffect(() => {
  async function loadRolesPermisos() {
    try {
      console.log('🔍 Cargando roles y permisos...');
      const { UsuariosService } = await import('@spoon/shared/services/usuarios');
      const restaurant = await getUserRestaurant();
      const restaurantId = restaurant?.id || '';

      const [rolesData, permisosData] = await Promise.all([
        UsuariosService.getRolesSistema(),
        UsuariosService.getPermisos()
      ]);

      let customRolesData: { data: any[] | null; error: any } = { data: [], error: null };
      if (restaurantId) {
        customRolesData = await UsuariosService.getCustomRoles(restaurantId);
      }

      console.log('🔍 Roles obtenidos:', rolesData);
      console.log('🔍 Roles personalizados:', customRolesData);
      console.log('🔍 Permisos obtenidos:', permisosData);

      if (rolesData.data) {
        const systemRoles = rolesData.data.map((r: any) => ({ ...r, isCustom: false }));
        const customRoles = (customRolesData.data || []).map((r: any) => ({ ...r, isCustom: true }));
        setRoles([...systemRoles, ...customRoles]);
      }
      if (permisosData.data) setPermisos(permisosData.data);
    } catch (e) {
      console.error('Error cargando roles/permisos:', e);
    }
  }

  // CAMBIAR ESTA CONDICIÓN: cargar roles tanto en usuarios como en roles
  if ((activeTab === 'usuarios' || activeTab === 'roles') && (roles.length === 0 || Object.keys(permisos).length === 0)) {
    loadRolesPermisos();
  }
}, [activeTab, roles.length, permisos]);

  // Verificar permisos
  if (!hasPermission('config.usuarios')) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
        <SinPermisosCast 
          titulo="Sin permisos para gestionar usuarios"
          mensaje="Solo los propietarios pueden acceder a la configuración de usuarios y roles."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-2"></div>
            <span className="text-[color:var(--sp-neutral-600)]">Cargando configuración de usuarios...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
            👥 Gestión de Usuarios
          </h1>
          <p className="text-[color:var(--sp-neutral-600)] mt-1">
            Administra roles y permisos de tu equipo
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasUsuarios 
        estadisticas={estadisticas}
        className="mb-6"
      />

      {/* Pestañas */}
      <TabsCast
        className="mt-0 mb-3"
        activeId={activeTab}
        onChange={setActiveTab}
        items={[
          { 
            id: 'usuarios', 
            label: `Usuarios (${usuarios.filter((u: any) => u.is_active).length})`, 
            icon: <UsersCast className="h-4 w-4" />
          },
          { 
            id: 'roles', 
            label: 'Configuración de Roles', 
            icon: <SettingsCast className="h-4 w-4" /> 
          },
          { 
            id: 'auditoria', 
            label: 'Auditoría', 
            icon: <FileTextCast className="h-4 w-4" /> 
          },
        ]}
      />

      {/* Contenido de pestañas */}
      <div className="mt-2">
        {activeTab === 'usuarios' && (
          <UsuariosTab
            usuarios={usuarios}
            roles={roles}
            customRoles={roles.filter((r: any) => r.isCustom)}
            onRefresh={refrescarUsuarios}
            onNotification={addNotification}
          />
        )}
        
        {activeTab === 'roles' && (
          <ConfiguracionRolesTab
            roles={roles}
            permisos={permisos}
            onNotification={addNotification}
          />
        )}
        
        {activeTab === 'auditoria' && (
          <AuditoriaTab
            onNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
}
