import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Users, Settings, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { UsuariosService } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react
const ShieldCast = Shield as any;
const UsersCast = Users as any;
const SettingsCast = Settings as any;
const EyeCast = Eye as any;
const EyeOffCast = EyeOff as any;
const AlertTriangleCast = AlertTriangle as any;
const CheckCircleCast = CheckCircle as any;
const XCircleCast = XCircle as any;

interface PermisosOverviewProps {
  onNotification: (notification: any) => void;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  is_critical: boolean;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
  granted: boolean;
  permission: Permission;
}

export const PermisosOverview: React.FC<PermisosOverviewProps> = ({ onNotification }) => {
  const [permisos, setPermisos] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vistaExpandida, setVistaExpandida] = useState<Record<string, boolean>>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar permisos disponibles
      const { data: permisosData, error: permisosError } = await UsuariosService.getPermisos();
      if (permisosError) throw permisosError;

      // Convertir permisos a array plano
      const permisosArray = Object.values(permisosData || {}).flat() as Permission[];
      setPermisos(permisosArray);

      // Aquí podríamos cargar permisos de roles específicos si fuera necesario
      // Por ahora mostramos la estructura general
    } catch (error) {
      console.error('Error cargando permisos:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los permisos'
      });
    } finally {
      setCargando(false);
    }
  };

  // Agrupar permisos por módulo
  const permisosPorModulo = useMemo(() => {
    return permisos.reduce((acc: Record<string, Permission[]>, permiso) => {
      if (!acc[permiso.module]) {
        acc[permiso.module] = [];
      }
      acc[permiso.module].push(permiso);
      return acc;
    }, {});
  }, [permisos]);

  // Estadísticas de permisos
  const estadisticasPermisos = useMemo(() => {
    const total = permisos.length;
    const criticos = permisos.filter(p => p.is_critical).length;
    const modulos = Object.keys(permisosPorModulo).length;

    return { total, criticos, modulos };
  }, [permisos, permisosPorModulo]);

  // Toggle vista expandida de módulo
  const toggleModulo = (modulo: string) => {
    setVistaExpandida(prev => ({
      ...prev,
      [modulo]: !prev[modulo]
    }));
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

  // Obtener color de severidad
  const getSeverityColor = (isCritical: boolean) => {
    return isCritical ? 'text-[color:var(--sp-error-600)] bg-[color:var(--sp-error-50)]' : 'text-[color:var(--sp-warning-600)] bg-[color:var(--sp-warning-50)]';
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)]"></div>
        <span className="ml-2 text-[color:var(--sp-neutral-600)]">Cargando permisos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--sp-info-100)] flex items-center justify-center">
              <ShieldCast className="h-5 w-5 text-[color:var(--sp-info-600)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                {estadisticasPermisos.total}
              </div>
              <div className="text-sm text-[color:var(--sp-neutral-600)]">
                Permisos Totales
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--sp-error-100)] flex items-center justify-center">
              <AlertTriangleCast className="h-5 w-5 text-[color:var(--sp-error-600)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                {estadisticasPermisos.criticos}
              </div>
              <div className="text-sm text-[color:var(--sp-neutral-600)]">
                Permisos Críticos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--sp-success-100)] flex items-center justify-center">
              <SettingsCast className="h-5 w-5 text-[color:var(--sp-success-600)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                {estadisticasPermisos.modulos}
              </div>
              <div className="text-sm text-[color:var(--sp-neutral-600)]">
                Módulos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de módulos y permisos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
          Permisos por Módulo
        </h3>

        {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
          const isExpanded = vistaExpandida[modulo];
          const permisosCriticos = permisosModulo.filter(p => p.is_critical);

          return (
            <div key={modulo} className="border border-[color:var(--sp-neutral-200)] rounded-lg overflow-hidden">
              {/* Header del módulo */}
              <div
                className="bg-[color:var(--sp-neutral-50)] p-4 cursor-pointer hover:bg-[color:var(--sp-neutral-100)] transition-colors"
                onClick={() => toggleModulo(modulo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getModuleIcon(modulo)}</span>
                    <div>
                      <h4 className="font-medium text-[color:var(--sp-neutral-900)]">
                        {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                      </h4>
                      <p className="text-sm text-[color:var(--sp-neutral-600)]">
                        {permisosModulo.length} permisos • {permisosCriticos.length} críticos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {permisosCriticos.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]">
                        {permisosCriticos.length} críticos
                      </span>
                    )}
                    {isExpanded ? (
                      <EyeOffCast className="h-5 w-5 text-[color:var(--sp-neutral-500)]" />
                    ) : (
                      <EyeCast className="h-5 w-5 text-[color:var(--sp-neutral-500)]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="p-4 border-t border-[color:var(--sp-neutral-200)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permisosModulo.map(permiso => (
                      <div
                        key={permiso.id}
                        className={`p-3 rounded-lg border ${
                          permiso.is_critical
                            ? 'border-[color:var(--sp-error-200)] bg-[color:var(--sp-error-50)]'
                            : 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm text-[color:var(--sp-neutral-900)] truncate">
                                {permiso.name}
                              </h5>
                              {permiso.is_critical && (
                                <AlertTriangleCast className="h-4 w-4 text-[color:var(--sp-error-500)] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-[color:var(--sp-neutral-600)] mb-2">
                              {permiso.description}
                            </p>
                            <div className="flex items-center gap-2">
                              {permiso.is_critical ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]">
                                  <XCircleCast className="h-3 w-3 mr-1" />
                                  Crítico
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]">
                                  <CheckCircleCast className="h-3 w-3 mr-1" />
                                  Estándar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCast className="h-5 w-5 text-[color:var(--sp-info-600)] mt-0.5" />
          <div>
            <h4 className="font-medium text-[color:var(--sp-info-900)] mb-1">
              Sistema de Permisos
            </h4>
            <p className="text-sm text-[color:var(--sp-info-800)] mb-2">
              Los permisos marcados como &ldquo;críticos&rdquo; requieren especial atención ya que afectan
              funciones sensibles del sistema como finanzas, configuración y seguridad.
            </p>
            <p className="text-sm text-[color:var(--sp-info-700)]">
              <strong>Recomendación:</strong> Asigna permisos críticos solo a roles de alta confianza
              y limita su uso a usuarios autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
