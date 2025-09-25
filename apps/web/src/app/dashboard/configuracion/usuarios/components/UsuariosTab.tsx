import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, Edit3, Mail, Phone, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { SelectV2 as Select } from '@spoon/shared/components/ui/SelectV2';
import { SwitchV2 as Switch } from '@spoon/shared/components/ui/SwitchV2';
import { DialogV2 as Dialog } from '@spoon/shared/components/ui/DialogV2';
import { UsuariosService, type UsuarioRestaurante, type RoleSistema } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react y @spoon/shared
const SearchCast = Search as any;
const UserPlusCast = UserPlus as any;
const Edit3Cast = Edit3 as any;
const MailCast = Mail as any;
const PhoneCast = Phone as any;
const CalendarCast = Calendar as any;
const ClockCast = Clock as any;
const UsersCast = Users as any;
const ButtonCast = Button as any;
const SelectCast = Select as any;
const InputCast = Input as any;
const SwitchCast = Switch as any;
const DialogCast = Dialog as any;

interface UsuariosTabProps {
  usuarios: UsuarioRestaurante[];
  roles: RoleSistema[];
  customRoles?: any[];
  onRefresh: () => void;
  onNotification: (notification: any) => void;
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({
  usuarios,
  roles,
  customRoles = [],
  onRefresh,
  onNotification
}) => {
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalInvitar, setModalInvitar] = useState(false);
  const [modalEditar, setModalEditar] = useState<{ isOpen: boolean; usuario: UsuarioRestaurante | null }>({
    isOpen: false,
    usuario: null
  });

  // Estados para formularios
  const [formInvitar, setFormInvitar] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    mensaje: ''
  });

  const [formEditar, setFormEditar] = useState({
    role_id: '',
    is_active: true
  });

  // Filtrar y buscar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      // Determinar el rol del usuario (sistema o personalizado)
      const rolSistema = usuario.user_roles?.[0]?.system_roles;
      const customRoleId = usuario.user_roles?.[0]?.custom_role_id;
      const rolPersonalizado = customRoleId ? customRoles.find(cr => cr.id === customRoleId) : null;

      // Obtener el nombre del rol para filtrar
      const nombreRolActual = rolPersonalizado ? rolPersonalizado.name : rolSistema?.name;

      const cumpleFiltroRol = filtroRol === 'todos' || nombreRolActual === filtroRol;

      const cumpleBusqueda = busqueda === '' ||
        `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase());

      return cumpleFiltroRol && cumpleBusqueda;
    });
  }, [usuarios, filtroRol, busqueda, customRoles]);

  // Obtener roles disponibles usando el método del sistema
  const [rolesDisponibles, setRolesDisponibles] = useState<any[]>([]);
  const [cargandoRoles, setCargandoRoles] = useState(false);

  useEffect(() => {
    const cargarRoles = async () => {
      setCargandoRoles(true);
      try {
        // Usar el método existente que funciona con roles del sistema
        const { data, error } = await UsuariosService.getRolesSistema();
        if (!error && data) {
          // Filtrar para excluir propietario y mapear al formato esperado
          const rolesFiltrados = data
            .filter(rol => rol.name !== 'propietario')
            .map(rol => ({
              id: rol.id,
              name: rol.name,
              type: 'system',
              description: rol.description,
              is_system: true
            }));
          setRolesDisponibles(rolesFiltrados);
        }
      } catch (error) {
        console.error('Error cargando roles:', error);
        // Fallback: usar roles prop
        if (roles.length > 0) {
          const rolesFiltrados = roles
            .filter(rol => rol.name !== 'propietario')
            .map(rol => ({
              id: rol.id,
              name: rol.name,
              type: 'system',
              description: rol.description,
              is_system: true
            }));
          setRolesDisponibles(rolesFiltrados);
        }
      } finally {
        setCargandoRoles(false);
      }
    };

    cargarRoles();
  }, [roles]);

  // Manejar creación directa de usuario
  const handleCrearUsuario = async () => {
    if (!formInvitar.first_name || !formInvitar.last_name || !formInvitar.email || !formInvitar.role_id) {
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    try {
      // Si es un rol personalizado, extraer el ID real
      let roleIdToSend = formInvitar.role_id;
      if (formInvitar.role_id.startsWith('custom_')) {
        const customRoleId = formInvitar.role_id.replace('custom_', '');
        roleIdToSend = customRoleId;
      }

      const userData = {
        first_name: formInvitar.first_name,
        last_name: formInvitar.last_name,
        email: formInvitar.email,
        phone: formInvitar.phone,
        role_id: roleIdToSend,
        // La contraseña temporal se genera automáticamente
      };

      const { data, error } = await UsuariosService.crearUsuarioDirecto(userData);

      if (error) throw error;

      // Mostrar contraseña temporal al administrador
      const passwordTemporal = data?.password_temporal;
      const instrucciones = data?.instrucciones;
      onNotification({
        type: 'success',
        title: 'Usuario creado exitosamente',
        message: instrucciones || `Usuario creado. Contraseña temporal: ${passwordTemporal}. Compártela de forma segura con el usuario.`
      });

      setModalInvitar(false);
      setFormInvitar({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        mensaje: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error creando usuario:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear el usuario'
      });
    }
  };

  // Manejar edición de usuario
  const handleEditarUsuario = async () => {
    if (!modalEditar.usuario) return;

    try {
      // Si es un rol personalizado, extraer el ID real
      let roleIdToSend = formEditar.role_id;
      if (formEditar.role_id.startsWith('custom_')) {
        const customRoleId = formEditar.role_id.replace('custom_', '');
        roleIdToSend = customRoleId;
      }

      const { error } = await UsuariosService.cambiarRolUsuario(
        modalEditar.usuario.id,
        roleIdToSend,
        'Rol actualizado desde configuración'
      );

      if (error) throw error;

      onNotification({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'Los cambios se guardaron correctamente'
      });

      setModalEditar({ isOpen: false, usuario: null });
      onRefresh();
    } catch (error) {
      console.error('Error editando usuario:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el usuario'
      });
    }
  };

  // Manejar toggle de usuario activo
  const handleToggleUsuario = async (userId: string, activo: boolean) => {
    try {
      const { error } = await UsuariosService.toggleUsuarioActivo(userId, activo);
      
      if (error) throw error;

      onNotification({
        type: 'success',
        title: activo ? 'Usuario activado' : 'Usuario desactivado',
        message: 'El estado del usuario se actualizó correctamente'
      });

      onRefresh();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cambiar el estado del usuario'
      });
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (usuario: UsuarioRestaurante) => {
    setModalEditar({ isOpen: true, usuario });
    setFormEditar({
      role_id: usuario.user_roles?.[0]?.role_id || '',
      is_active: usuario.is_active
    });
  };

  // Obtener label del rol
  const getRoleLabel = (roleName: string) => {
    const displayNames = UsuariosService.getRoleDisplayNames();
    return displayNames[roleName] || roleName;
  };

  // Obtener color del rol
  const getRoleColor = (roleName: string) => {
    const colors = UsuariosService.getRoleColors();
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  // Formatear fecha
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-CO');
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
            Lista de Usuarios
          </h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">
            Gestiona los miembros de tu equipo
          </p>
        </div>
        <ButtonCast
          onClick={() => setModalInvitar(true)}
          className="flex items-center gap-2"
        >
          <UserPlusCast className="h-4 w-4" />
          Crear Usuario
        </ButtonCast>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64">
          <SelectCast
            value={filtroRol}
            onChange={(e: any) => setFiltroRol(e.target.value)}
            placeholder="Filtrar por rol"
          >
            <option value="todos">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.name}>
                {getRoleLabel(rol.name)}
              </option>
            ))}
            {customRoles.map(rol => (
              <option key={`filter_${rol.id}`} value={rol.name}>
                {rol.name} (Personalizado)
              </option>
            ))}
          </SelectCast>
        </div>
        <div className="flex-1">
          <div className="relative">
            <SearchCast className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[color:var(--sp-neutral-400)]" />
            <InputCast
              placeholder="🔍 Buscar por nombre o email..."
              value={busqueda}
              onChange={(e: any) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-[color:var(--sp-neutral-500)]">
            <UsersCast className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron usuarios con los filtros aplicados</p>
          </div>
        ) : (
          usuariosFiltrados.map(usuario => {
            const rolSistema = usuario.user_roles?.[0]?.system_roles;
            const customRoleId = usuario.user_roles?.[0]?.custom_role_id;

            // Buscar rol personalizado si existe
            const rolPersonalizado = customRoleId ? customRoles.find(cr => cr.id === customRoleId) : null;

            // Determinar qué rol mostrar
            const rolDisplay = rolPersonalizado || rolSistema;
            const esPersonalizado = !!rolPersonalizado;

            return (
              <div
                key={usuario.id}
                className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[color:var(--sp-info-100)] flex items-center justify-center font-semibold text-[color:var(--sp-info-700)]">
                      {usuario.first_name[0]}{usuario.last_name[0]}
                    </div>

                    {/* Info del usuario */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[color:var(--sp-neutral-900)] truncate">
                        {usuario.first_name} {usuario.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-[color:var(--sp-neutral-600)] mt-1">
                        <div className="flex items-center gap-1">
                          <MailCast className="h-3 w-3" />
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        {usuario.phone && (
                          <div className="flex items-center gap-1">
                            <PhoneCast className="h-3 w-3" />
                            <span>{usuario.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {rolDisplay && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${esPersonalizado ? 'bg-purple-100 text-purple-800' : getRoleColor(rolDisplay.name)}`}>
                            {esPersonalizado ? rolDisplay.name : getRoleLabel(rolDisplay.name)}
                            {esPersonalizado && ' ⭐'}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-[color:var(--sp-neutral-500)]">
                          <CalendarCast className="h-3 w-3" />
                          Creado: {formatearFecha(usuario.created_at)}
                        </div>
                        {usuario.last_login && (
                          <div className="flex items-center gap-1 text-xs text-[color:var(--sp-neutral-500)]">
                            <ClockCast className="h-3 w-3" />
                            Último acceso: {formatearFecha(usuario.last_login)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex items-center gap-3">
                    <ButtonCast
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalEdicion(usuario)}
                      className="flex items-center gap-1"
                    >
                      <Edit3Cast className="h-3 w-3" />
                      Editar
                    </ButtonCast>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[color:var(--sp-neutral-600)]">
                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <SwitchCast
                        checked={usuario.is_active}
                        onChange={(e: any) => handleToggleUsuario(usuario.id, e.currentTarget.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Invitar Usuario */}
  <DialogCast open={modalInvitar} onClose={() => setModalInvitar(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">➕ Crear Nuevo Usuario</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputCast
                placeholder="Nombre"
                value={formInvitar.first_name}
                onChange={(e: any) => setFormInvitar(prev => ({ ...prev, first_name: e.target.value }))}
              />
              <InputCast
                placeholder="Apellido"
                value={formInvitar.last_name}
                onChange={(e: any) => setFormInvitar(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <InputCast
              type="email"
              placeholder="Email"
              value={formInvitar.email}
              onChange={(e: any) => setFormInvitar(prev => ({ ...prev, email: e.target.value }))}
            />
            <InputCast
              placeholder="Teléfono"
              value={formInvitar.phone}
              onChange={(e: any) => setFormInvitar(prev => ({ ...prev, phone: e.target.value }))}
            />
            <SelectCast
              value={formInvitar.role_id}
              onChange={(e: any) => setFormInvitar(prev => ({ ...prev, role_id: e.target.value }))}
              placeholder="Seleccionar rol"
            >
              {roles.filter(rol => rol.name !== 'propietario').map(rol => (
                <option key={rol.id} value={rol.id}>
                  {getRoleLabel(rol.name)}
                </option>
              ))}
              {customRoles.map(rol => (
                <option key={`custom_${rol.id}`} value={`custom_${rol.id}`}>
                  {rol.name} (Personalizado)
                </option>
              ))}
            </SelectCast>
            <textarea
              placeholder="Mensaje personalizado (opcional)"
              value={formInvitar.mensaje}
              onChange={(e) => setFormInvitar(prev => ({ ...prev, mensaje: e.target.value }))}
              className="w-full p-3 border border-[color:var(--sp-neutral-300)] rounded-md resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <ButtonCast variant="outline" onClick={() => setModalInvitar(false)}>
              Cancelar
            </ButtonCast>
            <ButtonCast onClick={handleCrearUsuario}>
              ➕ Crear Usuario
            </ButtonCast>
          </div>
        </div>
      </DialogCast>

      {/* Modal Editar Usuario */}
  <DialogCast open={modalEditar.isOpen} onClose={() => setModalEditar({ isOpen: false, usuario: null })}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">✏️ Editar Usuario</h2>
          
          {modalEditar.usuario && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[color:var(--sp-neutral-50)] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[color:var(--sp-info-100)] flex items-center justify-center font-semibold text-[color:var(--sp-info-700)]">
                  {modalEditar.usuario.first_name[0]}{modalEditar.usuario.last_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {modalEditar.usuario.first_name} {modalEditar.usuario.last_name}
                  </h3>
                  <p className="text-sm text-[color:var(--sp-neutral-600)]">
                    {modalEditar.usuario.email}
                  </p>
                </div>
              </div>
              
              <SelectCast
                value={formEditar.role_id}
                onChange={(e: any) => setFormEditar(prev => ({ ...prev, role_id: e.target.value }))}
                placeholder="Seleccionar rol"
              >
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {getRoleLabel(rol.name)}
                  </option>
                ))}
                {customRoles.map(rol => (
                  <option key={`custom_${rol.id}`} value={`custom_${rol.id}`}>
                    {rol.name} (Personalizado)
                  </option>
                ))}
              </SelectCast>
              
              <div className="flex items-center gap-2">
                <SwitchCast
                  checked={formEditar.is_active}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormEditar(prev => ({ ...prev, is_active: e.target.checked }))
                  }
                />
                <span>Usuario activo</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <ButtonCast variant="outline" onClick={() => setModalEditar({ isOpen: false, usuario: null })}>
              Cancelar
            </ButtonCast>
            <ButtonCast onClick={handleEditarUsuario}>
              💾 Guardar
            </ButtonCast>
          </div>
        </div>
      </DialogCast>
    </div>
  );
};
