import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { Button, SelectV2 as Select, SwitchV2 as Switch, Card } from '@spoon/shared';
import { UsuariosService, type RoleSistema, type PermisoRol } from '@spoon/shared/services/usuarios';

interface ConfiguracionRolesTabProps {
  roles: RoleSistema[];
  permisos: any; // Permisos agrupados por módulo
  onNotification: (notification: any) => void;
}

interface PermisoEstado {
  granted: boolean;
  isCustom: boolean;
}

export const ConfiguracionRolesTab: React.FC<ConfiguracionRolesTabProps> = ({
  roles,
  permisos,
  onNotification
}) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('');
  const [permisosRol, setPermisosRol] = useState<Record<string, PermisoEstado>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar permisos cuando cambia el rol seleccionado
  const cargarPermisosRol = useCallback(async (roleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await UsuariosService.getPermisosRol(roleId);
      if (error) throw error;
      const permisosEstado: Record<string, PermisoEstado> = {};
      data?.forEach((permisoRol: PermisoRol) => {
        permisosEstado[permisoRol.permission_id] = {
          granted: permisoRol.granted,
          isCustom: false,
        };
      });
      setPermisosRol(permisosEstado);
      setHasChanges(false);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los permisos del rol',
      });
    } finally {
      setLoading(false);
    }
  }, [onNotification]);

  useEffect(() => {
    if (rolSeleccionado) {
      cargarPermisosRol(rolSeleccionado);
    }
  }, [rolSeleccionado, cargarPermisosRol]);

  

  const handlePermisoChange = async (permisoId: string, granted: boolean) => {
    if (!rolSeleccionado) return;

    try {
      const { error } = await UsuariosService.actualizarPermisosRol(
        rolSeleccionado,
        permisoId,
        granted
      );

      if (error) throw error;

      // Actualizar estado local
      setPermisosRol(prev => ({
        ...prev,
        [permisoId]: {
          granted,
          isCustom: true
        }
      }));

      setHasChanges(true);

      onNotification({
        type: 'success',
        title: 'Permiso actualizado',
        message: `Permiso ${granted ? 'otorgado' : 'revocado'} correctamente`
      });
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el permiso'
      });
    }
  };

  const restaurarPorDefecto = () => {
    if (!rolSeleccionado) return;

    onNotification({
      type: 'info',
      title: 'Funcionalidad próximamente',
      message: 'La restauración de permisos por defecto estará disponible pronto'
    });
  };

  // Obtener información del rol seleccionado
  const rolActual = roles.find(r => r.id === rolSeleccionado);

  // Obtener iconos de módulos
  const moduleIcons = UsuariosService.getModuleIcons();

  // Obtener nombres de roles para display
  const roleDisplayNames = UsuariosService.getRoleDisplayNames();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Roles
          </h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">
            Gestiona los permisos específicos de cada rol
          </p>
        </div>
      </div>

      {/* Selector de rol */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-[color:var(--sp-neutral-50)] rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[color:var(--sp-info-600)]" />
          <span className="font-medium text-[color:var(--sp-neutral-900)]">
            Seleccionar rol:
          </span>
        </div>
        <div className="flex-1 md:max-w-md">
          <Select
            value={rolSeleccionado}
            onChange={(e) => setRolSeleccionado(e.target.value)}
            placeholder="Selecciona un rol para configurar"
          >
            {roles.filter(rol => rol.name !== 'administrador').map(rol => (
              <option key={rol.id} value={rol.id}>
                {roleDisplayNames[rol.name] || rol.name}
              </option>
            ))}
          </Select>
        </div>
        {rolSeleccionado && (
          <Button
            variant="outline"
            onClick={restaurarPorDefecto}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar por defecto
          </Button>
        )}
      </div>

      {/* Información del rol seleccionado */}
      {rolActual && (
        <Card className="p-4 bg-[color:var(--sp-info-50)] border-[color:var(--sp-info-200)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--sp-info-100)] flex items-center justify-center">
              <Settings className="h-5 w-5 text-[color:var(--sp-info-600)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--sp-info-900)]">
                {roleDisplayNames[rolActual.name] || rolActual.name}
              </h3>
              <p className="text-sm text-[color:var(--sp-info-700)]">
                {rolActual.description}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Matriz de permisos */}
      {rolSeleccionado && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-2"></div>
                <span className="text-[color:var(--sp-neutral-600)]">Cargando permisos...</span>
              </div>
            </div>
          ) : (
            Object.entries(permisos).map(([modulo, permisosModulo]: [string, any]) => (
              <Card key={modulo} className="overflow-hidden">
                <div className="p-4 bg-[color:var(--sp-neutral-50)] border-b border-[color:var(--sp-neutral-200)]">
                  <h3 className="font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
                    <span className="text-lg">{moduleIcons[modulo] || '📋'}</span>
                    {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                  </h3>
                  <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
                    {permisosModulo.length} permisos disponibles
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="grid gap-3">
                    {permisosModulo.map((permiso: any) => {
                      const estado = permisosRol[permiso.id];
                      const granted = estado?.granted || false;
                      const isCustom = estado?.isCustom || false;
                      
                      return (
                        <PermisoToggle
                          key={permiso.id}
                          permiso={permiso}
                          granted={granted}
                          isCustom={isCustom}
                          onChange={(newGranted) => handlePermisoChange(permiso.id, newGranted)}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Estado sin selección */}
      {!rolSeleccionado && (
        <div className="text-center py-12 text-[color:var(--sp-neutral-500)]">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Selecciona un rol para comenzar</p>
          <p className="text-sm mt-2">
            Podrás ver y modificar los permisos específicos del rol seleccionado
          </p>
        </div>
      )}

      {/* Indicador de cambios */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-[color:var(--sp-success-600)] text-[color:var(--sp-on-primary)] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          Cambios guardados automáticamente
        </div>
      )}
    </div>
  );
};

// Componente para cada toggle de permiso
interface PermisoToggleProps {
  permiso: any;
  granted: boolean;
  isCustom: boolean;
  onChange: (granted: boolean) => void;
}

const PermisoToggle: React.FC<PermisoToggleProps> = ({
  permiso,
  granted,
  isCustom,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between p-3 border border-[color:var(--sp-neutral-200)] rounded-lg hover:bg-[color:var(--sp-neutral-25)] transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[color:var(--sp-neutral-900)]">
            {permiso.description}
          </span>
          {permiso.is_critical && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]">
              <AlertTriangle className="h-3 w-3" />
              Crítico
            </span>
          )}
        </div>
        <div className="text-xs text-[color:var(--sp-neutral-500)] mt-1 font-mono">
          {permiso.name}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {isCustom && (
          <span className="text-xs px-2 py-1 bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)] rounded">
            Personalizado
          </span>
        )}
        
        <div className="flex items-center gap-2">
          {granted ? (
            <Check className="h-4 w-4 text-[color:var(--sp-success-600)]" />
          ) : (
            <X className="h-4 w-4 text-[color:var(--sp-neutral-400)]" />
          )}
          <Switch
            checked={granted}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};