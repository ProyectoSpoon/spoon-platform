'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useNotifications } from '@spoon/shared/Context/notification-context';
import ImagenesForm from './ImagenesForm';
import HorariosForm from './HorariosForm';
import { GeneralInfoForm } from '@spoon/shared/components/ui/components/GeneralInfoForm';
import { UbicacionForm } from '@spoon/shared/components/ui/components/UbicacionForm';
import { Info, Clock, Upload, Users } from 'lucide-react';
import { Tabs } from '@spoon/shared';
import { usePermissions } from '@spoon/shared/hooks/usePermissions';
import { SinPermisos } from '@spoon/shared/components/ui/SinPermisos';

// Importar componentes del módulo de usuarios
import { EstadisticasUsuarios } from './usuarios/components/EstadisticasUsuarios';
import { UsuariosTab } from './usuarios/components/UsuariosTab';
import { ConfiguracionRolesTab } from './usuarios/components/ConfiguracionRolesTab';
import { AuditoriaTab } from './usuarios/components/AuditoriaTab';
import { UsuariosService } from '@spoon/shared/services/usuarios';
import type { UsuarioRestaurante, RoleSistema, PermisoSistema, EstadisticasUsuarios as EstadisticasUsuariosStats } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react y @spoon/shared
const InfoCast = Info as any;
const ClockCast = Clock as any;
const UploadCast = Upload as any;
const UsersCast = Users as any;
const TabsCast = Tabs as any;
const GeneralInfoFormCast = GeneralInfoForm as any;
const UbicacionFormCast = UbicacionForm as any;
const SinPermisosCast = SinPermisos as any;

export default function ConfiguracionPage() {
  // Estados existentes
  const [editGeneral, setEditGeneral] = useState(false);
  const [editUbicacion, setEditUbicacion] = useState(false);
  const [editHorarios, setEditHorarios] = useState(false);
  const [editImagenes, setEditImagenes] = useState(false);
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingUbicacion, setSavingUbicacion] = useState(false);

  // Hook de permisos
  const { hasPermission } = usePermissions();

  // Estados para usuarios
  const [activeUsersTab, setActiveUsersTab] = useState('usuarios');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioRestaurante[]>([]);
  const [roles, setRoles] = useState<RoleSistema[]>([]);
  const [permisos, setPermisos] = useState<Record<string, PermisoSistema[]>>({});
  // Evitar llamadas duplicadas en dev (StrictMode) y cargar roles/permisos solo una vez
  const hasLoadedUsuariosOnce = useRef(false);
  const hasLoadedRolesPermisos = useRef(false);
  // Control de reintentos para roles/permisos
  const [rolesPermisosAttempt, setRolesPermisosAttempt] = useState(0);
  const hasWarnedRolesPermisos = useRef(false);
  // Cargar roles también desde la subpestaña Usuarios (para selects en invitar/editar)
  const hasAttemptedRolesFromUsuarios = useRef(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuariosStats>({
    usuariosActivos: 0,
    cajeros: 0,
    meseros: 0,
    cocineros: 0,
    gerentes: 0,
  total: 0,
  porRol: {}
  });

  // Estados existentes para info general y ubicación
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    cuisineType: ''
  });
  const [ubicacion, setUbicacion] = useState<{
    address: string;
    country_id: string;
    department_id: string;
    city_id: string;
    latitude?: number;
    longitude?: number;
  }>({
    address: '',
  country_id: '',
  department_id: '',
  city_id: '',
    latitude: undefined,
    longitude: undefined
  });

  // Datos mock para países, departamentos y ciudades
  const countries = [{ id: 'CO', name: 'Colombia', code: 'CO', phone_code: '+57' }];
  const departments = [{ id: '11', name: 'Bogotá', code: '11', country_id: 'CO' }];
  const cities = [{ id: '11001', name: 'Bogotá', department_id: '11', latitude: 4.711, longitude: -74.072, is_capital: true }];

  // Cargar datos reales al montar
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
  const { RestaurantService } = await import('@spoon/shared/services/restaurant');
  const { data, error } = await RestaurantService.getUserRestaurant();
        if (error || !data) return;
        setGeneralInfo({
          name: data.name || '',
          description: data.description || '',
          phone: data.contact_phone || '',
          email: data.contact_email || '',
          cuisineType: data.cuisine_type || ''
        });
        setUbicacion({
          address: data.address || '',
          country_id: data.country_id || '',
          department_id: data.department_id || '',
          city_id: data.city_id || '',
          latitude: data.latitude,
          longitude: data.longitude
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Cargar datos de usuarios cuando se selecciona esa pestaña
  // Memoized loader to satisfy exhaustive-deps and avoid identity churn
  const loadUsuariosYEstadisticas = useCallback(async () => {
    setLoadingUsers(true);
    try {
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
          message: 'Error al cargar los usuarios'
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
      setLoadingUsers(false);
    }
  }, [addNotification]);

  React.useEffect(() => {
    if (activeTab !== 'usuarios' || !hasPermission('config.usuarios')) return;
    if (hasLoadedUsuariosOnce.current) return;
    hasLoadedUsuariosOnce.current = true;
    loadUsuariosYEstadisticas();
  }, [activeTab, hasPermission, loadUsuariosYEstadisticas]);

  // Cargar SOLO roles cuando se entra a la subpestaña "usuarios" y aún no han sido cargados
  React.useEffect(() => {
    if (activeTab !== 'usuarios') return;
    if (activeUsersTab !== 'usuarios') return;
    if (roles && roles.length > 0) return;
    if (hasLoadedRolesPermisos.current) return; // ya se cargaron junto con permisos
    if (hasAttemptedRolesFromUsuarios.current) return; // evitar duplicados (StrictMode)

    hasAttemptedRolesFromUsuarios.current = true;
    (async () => {
      const res = await UsuariosService.getRolesSistema();
      if (res.data) setRoles(res.data);
      if (res.error) {
        addNotification({
          type: 'warning',
          title: 'Aviso',
          message: 'No se pudieron cargar los roles para edición/invitación.'
        });
      }
    })();
  }, [activeTab, activeUsersTab, roles, addNotification]);

  // Cargar roles y permisos solo al abrir la subpestaña "roles".
  // Reintenta automáticamente si falla y solo marca como cargado al tener éxito.
  React.useEffect(() => {
    if (activeTab !== 'usuarios') return;
    if (activeUsersTab !== 'roles') return;
    if (hasLoadedRolesPermisos.current) return;

    let cancelled = false;

    (async () => {
      const [rolesRes, permisosRes] = await Promise.all([
        UsuariosService.getRolesSistema(),
        UsuariosService.getPermisos()
      ]);

      const rolesOk = !!rolesRes.data && !rolesRes.error;
      const permisosOk = permisosRes.data !== null && permisosRes.error == null;

      if (!cancelled) {
        if (rolesOk) setRoles(rolesRes.data!);
        if (permisosOk) setPermisos(permisosRes.data!);

        if (rolesOk && permisosOk) {
          hasLoadedRolesPermisos.current = true;
          hasWarnedRolesPermisos.current = false;
        } else {
          if (!hasWarnedRolesPermisos.current) {
            addNotification({
              type: 'warning',
              title: 'Aviso',
              message: 'No se pudieron cargar roles o permisos. Reintentando…'
            });
            hasWarnedRolesPermisos.current = true;
          }
          // Pequeño backoff antes de reintentar
          setTimeout(() => {
            if (!cancelled && activeTab === 'usuarios' && activeUsersTab === 'roles' && !hasLoadedRolesPermisos.current) {
              setRolesPermisosAttempt(a => a + 1);
            }
          }, Math.min(2000 + rolesPermisosAttempt * 500, 5000));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [activeTab, activeUsersTab, rolesPermisosAttempt]);

  // Funciones para refrescar datos de usuarios
  const refrescarUsuarios = async () => {
    try {
      const [usuariosData, statsData] = await Promise.all([
        UsuariosService.getUsuariosRestaurante(),
        UsuariosService.getEstadisticas()
      ]);

      if (usuariosData.data) setUsuarios(usuariosData.data);
      if (statsData.data) setEstadisticas(statsData.data);
    } catch (error) {
      console.error('Error refrescando usuarios:', error);
    }
  };

  // Funciones existentes
  const handleGeneralChange = (field: string, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneralSubmit = () => {
    setSavingGeneral(true);
    (async () => {
      try {
  const { RestaurantService } = await import('@spoon/shared/services/restaurant');
  const { error } = await RestaurantService.updateBasicInfo({
          name: generalInfo.name,
          description: generalInfo.description,
          contact_phone: generalInfo.phone,
          contact_email: generalInfo.email,
          cuisine_type: generalInfo.cuisineType
        });
        if (!error) {
          addNotification({ type: 'success', title: 'Éxito', message: 'Información general actualizada correctamente.' });
        } else {
          addNotification({ type: 'error', title: 'Error', message: 'Error al actualizar la información general.' });
        }
      } finally {
        setSavingGeneral(false);
      }
    })();
  };

  const handleUbicacionChange = (field: string, value: string | number) => {
    setUbicacion(prev => ({ ...prev, [field]: value }));
  };

  const handleUbicacionSubmit = () => {
    setSavingUbicacion(true);
    (async () => {
      try {
  const { RestaurantService } = await import('@spoon/shared/services/restaurant');
  const { error } = await RestaurantService.updateLocation({
          address: ubicacion.address,
          country_id: ubicacion.country_id,
          department_id: ubicacion.department_id,
          city_id: ubicacion.city_id,
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude
        });
        if (!error) {
          addNotification({ type: 'success', title: 'Éxito', message: 'Ubicación actualizada correctamente.' });
        } else {
          addNotification({ type: 'error', title: 'Error', message: 'Error al actualizar la ubicación.' });
        }
      } finally {
        setSavingUbicacion(false);
      }
    })();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="text-[color:var(--sp-neutral-600)]">Cargando configuración...</span>
          </div>
        </div>
      </div>
    );
  }

  // Construir items de pestañas dinámicamente
  const tabItems = [
    { id: 'info', label: 'Información General', icon: <InfoCast className="h-4 w-4" /> },
    { id: 'location', label: 'Ubicación', icon: <InfoCast className="h-4 w-4" /> },
    { id: 'horarios', label: 'Horarios', icon: <ClockCast className="h-4 w-4" /> },
    { id: 'imagenes', label: 'Imágenes', icon: <UploadCast className="h-4 w-4" /> }
  ];

  // Solo agregar pestaña de usuarios si tiene permisos
  if (hasPermission('config.usuarios')) {
    tabItems.push({
      id: 'usuarios',
      label: `Usuarios y Roles${usuarios.length ? ` (${usuarios.filter((u) => u.is_active).length})` : ''}`,
      icon: <UsersCast className="h-4 w-4" />
    } as any);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
        

      {/* Pestañas */}
      <TabsCast
        className="mt-0 mb-3"
        activeId={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Contenido de pestañas */}
      <div className="mt-2">
        {activeTab === 'info' && (
          <GeneralInfoFormCast
            formData={generalInfo}
            onChange={handleGeneralChange}
            onSubmit={handleGeneralSubmit}
            saving={savingGeneral}
            readOnly={!editGeneral}
            showSave={editGeneral}
            onCancel={() => setEditGeneral(false)}
            onToggleEdit={() => setEditGeneral(true)}
          />
        )}

        {activeTab === 'location' && (
          <UbicacionFormCast
            formData={ubicacion}
            onChange={handleUbicacionChange}
            onSubmit={handleUbicacionSubmit}
            saving={savingUbicacion}
            readOnly={!editUbicacion}
            showSave={editUbicacion}
            onCancel={() => setEditUbicacion(false)}
            onToggleEdit={() => setEditUbicacion(true)}
          />
        )}

        {activeTab === 'horarios' && (
          <HorariosForm
            readOnly={!editHorarios}
            showSave={editHorarios}
            onCancel={() => setEditHorarios(false)}
            onToggleEdit={() => setEditHorarios(true)}
          />
        )}

        {activeTab === 'imagenes' && (
          <ImagenesForm
            readOnly={!editImagenes}
            showSave={editImagenes}
            onCancel={() => setEditImagenes(false)}
            onToggleEdit={() => setEditImagenes(true)}
          />
        )}

        {activeTab === 'usuarios' && (
          <>
            {hasPermission('config.usuarios') ? (
              <div className="space-y-6">
                {/* Header del módulo de usuarios */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
                      👥 Gestión de Usuarios
                    </h2>
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

                {/* Sub-pestañas del módulo de usuarios */}
                <TabsCast
                  className="mt-0 mb-3"
                  activeId={activeUsersTab}
                  onChange={setActiveUsersTab}
                  items={[
                    { 
                      id: 'usuarios', 
                        label: `Usuarios${usuarios.length ? ` (${usuarios.filter((u) => u.is_active).length})` : ''}`, 
                        icon: <UsersCast className="h-4 w-4" />
                      },
                    { 
                      id: 'roles', 
                      label: 'Configuración de Roles', 
                      icon: <InfoCast className="h-4 w-4" /> 
                    },
                    { 
                      id: 'auditoria', 
                      label: 'Auditoría', 
                      icon: <ClockCast className="h-4 w-4" /> 
                    },
                  ]}
                />

                {/* Contenido de sub-pestañas */}
                <div className="mt-2">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-2"></div>
                        <span className="text-[color:var(--sp-neutral-600)]">Cargando configuración de usuarios...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeUsersTab === 'usuarios' && (
                        <UsuariosTab
                          usuarios={usuarios}
                          roles={roles}
                          onRefresh={refrescarUsuarios}
                          onNotification={addNotification}
                        />
                      )}
                      
                      {activeUsersTab === 'roles' && (
                        <ConfiguracionRolesTab
                          roles={roles}
                          permisos={permisos}
                          onNotification={addNotification}
                        />
                      )}
                      
                      {activeUsersTab === 'auditoria' && (
                        <AuditoriaTab
                          onNotification={addNotification}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <SinPermisosCast 
                titulo="Sin permisos para gestionar usuarios"
                mensaje="Solo los propietarios pueden acceder a la configuración de usuarios y roles."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}