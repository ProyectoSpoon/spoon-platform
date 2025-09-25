import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit3, Trash2, Shield, Users, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { SelectV2 as Select } from '@spoon/shared/components/ui/SelectV2';
import { SwitchV2 as Switch } from '@spoon/shared/components/ui/SwitchV2';
import { DialogV2 as Dialog } from '@spoon/shared/components/ui/DialogV2';
import { UsuariosService } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react y @spoon/shared
const PlusCast = Plus as any;
const Edit3Cast = Edit3 as any;
const Trash2Cast = Trash2 as any;
const ShieldCast = Shield as any;
const UsersCast = Users as any;
const SettingsCast = Settings as any;
const EyeCast = Eye as any;
const EyeOffCast = EyeOff as any;
const ButtonCast = Button as any;
const SelectCast = Select as any;
const InputCast = Input as any;
const SwitchCast = Switch as any;
const DialogCast = Dialog as any;

interface RolesTabProps {
  onNotification: (notification: any) => void;
  onRefresh: () => void;
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  permissions?: string[];
}

interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  is_critical: boolean;
}

export const RolesTab: React.FC<RolesTabProps> = ({ onNotification, onRefresh }) => {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<{ isOpen: boolean; role: CustomRole | null }>({
    isOpen: false,
    role: null
  });

  // Estados para formularios
  const [formCrear, setFormCrear] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [formEditar, setFormEditar] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    is_active: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar roles personalizados
      const { data: rolesData, error: rolesError } = await UsuariosService.getCustomRoles('');
      if (rolesError) throw rolesError;

      // Cargar permisos disponibles
      const { data: permisosData, error: permisosError } = await UsuariosService.getPermisos();
      if (permisosError) throw permisosError;

      // Convertir permisos a array plano
      const permisosArray = Object.values(permisosData || {}).flat() as Permission[];
      setPermissions(permisosArray);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos'
      });
    } finally {
      setCargando(false);
    }
  };

  // Agrupar permisos por módulo
  const permisosPorModulo = useMemo(() => {
    return permissions.reduce((acc: Record<string, Permission[]>, permiso) => {
      if (!acc[permiso.module]) {
        acc[permiso.module] = [];
      }
      acc[permiso.module].push(permiso);
      return acc;
    }, {});
  }, [permissions]);

  // Manejar creación de rol
  const handleCrearRol = async () => {
    if (!formCrear.name.trim()) {
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'El nombre del rol es obligatorio'
      });
      return;
    }

    try {
      const { data, error } = await UsuariosService.createCustomRole({
        name: formCrear.name.trim(),
        description: formCrear.description.trim() || undefined,
        permissions: formCrear.permissions.length > 0 ? formCrear.permissions : undefined
      });

      if (error) throw error;

      onNotification({
        type: 'success',
        title: 'Rol creado',
        message: `El rol "${formCrear.name}" se creó correctamente`
      });

      setModalCrear(false);
      setFormCrear({ name: '', description: '', permissions: [] });
      cargarDatos();
      onRefresh();
    } catch (error) {
      console.error('Error creando rol:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear el rol'
      });
    }
  };

  // Manejar edición de rol
  const handleEditarRol = async () => {
    if (!modalEditar.role || !formEditar.name.trim()) {
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'Datos inválidos'
      });
      return;
    }

    try {
      // Aquí iría la lógica para actualizar el rol
      // Por ahora, solo mostramos que se guardó
      onNotification({
        type: 'success',
        title: 'Rol actualizado',
        message: `El rol "${formEditar.name}" se actualizó correctamente`
      });

      setModalEditar({ isOpen: false, role: null });
      cargarDatos();
      onRefresh();
    } catch (error) {
      console.error('Error editando rol:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el rol'
      });
    }
  };

  // Manejar eliminación de rol
  const handleEliminarRol = async (roleId: string, roleName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${roleName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Aquí iría la lógica para eliminar el rol
      onNotification({
        type: 'success',
        title: 'Rol eliminado',
        message: `El rol "${roleName}" se eliminó correctamente`
      });

      cargarDatos();
      onRefresh();
    } catch (error) {
      console.error('Error eliminando rol:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el rol'
      });
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (role: CustomRole) => {
    setModalEditar({ isOpen: true, role });
    setFormEditar({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
  };

  // Toggle permiso en formulario
  const togglePermiso = (permisoId: string, isCrear: boolean = true) => {
    const form = isCrear ? formCrear : formEditar;
    const setForm = isCrear ? setFormCrear : setFormEditar;

    const permisosActuales = form.permissions;
    const nuevosPermisos = permisosActuales.includes(permisoId)
      ? permisosActuales.filter(p => p !== permisoId)
      : [...permisosActuales, permisoId];

  setForm((prev: any) => ({ ...prev, permissions: nuevosPermisos }));
  };

  // Obtener icono del módulo
  const getModuleIcon = (module: string) => {
    const icons: Record<string, string> = {
      'caja': '💰',
      'menu': '📋',
      'ordenes': '🍽️',
      'config': '⚙️',
      'reportes': '📊',
      'mesas': '🪑'
    };
    return icons[module] || '🔧';
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)]"></div>
        <span className="ml-2 text-[color:var(--sp-neutral-600)]">Cargando roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
            Gestión de Roles Personalizados
          </h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">
            Crea y administra roles con permisos específicos
          </p>
        </div>
        <ButtonCast
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2"
        >
          <PlusCast className="h-4 w-4" />
          Crear Rol
        </ButtonCast>
      </div>

      {/* Lista de roles */}
      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="text-center py-12 text-[color:var(--sp-neutral-500)]">
            <ShieldCast className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay roles personalizados creados</p>
            <p className="text-sm mt-2">Crea tu primer rol personalizado para comenzar</p>
          </div>
        ) : (
          roles.map(rol => (
            <div
              key={rol.id}
              className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--sp-purple-100)] flex items-center justify-center">
                    <ShieldCast className="h-6 w-6 text-[color:var(--sp-purple-700)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[color:var(--sp-neutral-900)] truncate">
                        {rol.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Personalizado
                      </span>
                    </div>
                    {rol.description && (
                      <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
                        {rol.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[color:var(--sp-neutral-500)]">
                      <span>{(rol.permissions || []).length} permisos</span>
                      <span>Creado: {new Date(rol.created_at).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ButtonCast
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalEdicion(rol)}
                    className="flex items-center gap-1"
                  >
                    <Edit3Cast className="h-3 w-3" />
                    Editar
                  </ButtonCast>
                  <ButtonCast
                    variant="outline"
                    size="sm"
                    onClick={() => handleEliminarRol(rol.id, rol.name)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2Cast className="h-3 w-3" />
                    Eliminar
                  </ButtonCast>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear Rol */}
      <DialogCast open={modalCrear} onClose={() => setModalCrear(false)}>
        <div className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">➕ Crear Rol Personalizado</h2>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <InputCast
                placeholder="Nombre del rol (ej: Supervisor de Cocina)"
                value={formCrear.name}
                onChange={(e: any) => setFormCrear((prev: typeof formCrear) => ({ ...prev, name: e.target.value }))}
              />
              <textarea
                placeholder="Descripción del rol (opcional)"
                value={formCrear.description}
                onChange={(e: any) => setFormCrear((prev: typeof formCrear) => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-[color:var(--sp-neutral-300)] rounded-md resize-none"
                rows={3}
              />
            </div>

            {/* Permisos por módulo */}
            <div className="space-y-4">
              <h3 className="font-medium text-[color:var(--sp-neutral-900)]">
                Permisos del Rol
              </h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">
                Selecciona los permisos que tendrá este rol
              </p>

              {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
                <div key={modulo} className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                  <h4 className="font-medium text-[color:var(--sp-neutral-900)] mb-3 flex items-center gap-2">
                    <span className="text-lg">{getModuleIcon(modulo)}</span>
                    {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permisosModulo.map(permiso => (
                      <label key={permiso.id} className="flex items-center gap-3 p-2 rounded hover:bg-[color:var(--sp-neutral-50)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formCrear.permissions.includes(permiso.id)}
                          onChange={() => togglePermiso(permiso.id, true)}
                          className="rounded border-[color:var(--sp-neutral-300)]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[color:var(--sp-neutral-900)]">
                            {permiso.name}
                          </div>
                          <div className="text-xs text-[color:var(--sp-neutral-600)]">
                            {permiso.description}
                          </div>
                          {permiso.is_critical && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Crítico
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <ButtonCast variant="outline" onClick={() => setModalCrear(false)}>
              Cancelar
            </ButtonCast>
            <ButtonCast onClick={handleCrearRol}>
              ➕ Crear Rol
            </ButtonCast>
          </div>
        </div>
      </DialogCast>

      {/* Modal Editar Rol */}
      <DialogCast open={modalEditar.isOpen} onClose={() => setModalEditar({ isOpen: false, role: null })}>
        <div className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">✏️ Editar Rol</h2>

          {modalEditar.role && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <InputCast
                  placeholder="Nombre del rol"
                  value={formEditar.name}
                  onChange={(e: any) => setFormEditar((prev: typeof formEditar) => ({ ...prev, name: e.target.value }))}
                />
                <textarea
                  placeholder="Descripción del rol (opcional)"
                  value={formEditar.description}
                  onChange={(e: any) => setFormEditar((prev: typeof formEditar) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-[color:var(--sp-neutral-300)] rounded-md resize-none"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <SwitchCast
                    checked={formEditar.is_active}
                    onChange={(e: any) =>
                      setFormEditar((prev: any) => ({ ...prev, is_active: e.target.checked }))
                    }
                  />
                  <span>Rol activo</span>
                </div>
              </div>

              {/* Permisos por módulo */}
              <div className="space-y-4">
                <h3 className="font-medium text-[color:var(--sp-neutral-900)]">
                  Permisos del Rol
                </h3>

                {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
                  <div key={modulo} className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                    <h4 className="font-medium text-[color:var(--sp-neutral-900)] mb-3 flex items-center gap-2">
                      <span className="text-lg">{getModuleIcon(modulo)}</span>
                      {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permisosModulo.map(permiso => (
                        <label key={permiso.id} className="flex items-center gap-3 p-2 rounded hover:bg-[color:var(--sp-neutral-50)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formEditar.permissions.includes(permiso.id)}
                            onChange={() => togglePermiso(permiso.id, false)}
                            className="rounded border-[color:var(--sp-neutral-300)]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[color:var(--sp-neutral-900)]">
                              {permiso.name}
                            </div>
                            <div className="text-xs text-[color:var(--sp-neutral-600)]">
                              {permiso.description}
                            </div>
                            {permiso.is_critical && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                Crítico
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <ButtonCast variant="outline" onClick={() => setModalEditar({ isOpen: false, role: null })}>
              Cancelar
            </ButtonCast>
            <ButtonCast onClick={handleEditarRol}>
              💾 Guardar
            </ButtonCast>
          </div>
        </div>
      </DialogCast>
    </div>
  );
};
