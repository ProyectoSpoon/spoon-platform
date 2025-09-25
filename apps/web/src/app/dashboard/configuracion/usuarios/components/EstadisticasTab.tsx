import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, Shield, Activity, TrendingUp, TrendingDown, Clock, Calendar } from 'lucide-react';
import { UsuariosService } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react
const UsersCast = Users as any;
const UserPlusCast = UserPlus as any;
const ShieldCast = Shield as any;
const ActivityCast = Activity as any;
const TrendingUpCast = TrendingUp as any;
const TrendingDownCast = TrendingDown as any;
const ClockCast = Clock as any;
const CalendarCast = Calendar as any;

interface EstadisticasTabProps {
  onNotification: (notification: any) => void;
}

interface EstadisticasData {
  usuariosActivos: number;
  cajeros: number;
  meseros: number;
  cocineros: number;
  gerentes: number;
  total: number;
  porRol: Record<string, number>;
}

interface ActividadReciente {
  id: string;
  accion: string;
  usuario: string;
  fecha: string;
  tipo: string;
}

export const EstadisticasTab: React.FC<EstadisticasTabProps> = ({ onNotification }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar estadísticas de usuarios
      const { data: statsData, error: statsError } = await UsuariosService.getEstadisticas();
      if (statsError) throw statsError;
      setEstadisticas(statsData);

      // Cargar actividad reciente (últimos 10 eventos)
      const { data: actividadData, error: actividadError } = await UsuariosService.getHistorialCambios({
        pageSize: 10
      });
      if (!actividadError && actividadData) {
        setActividadReciente(actividadData);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las estadísticas'
      });
    } finally {
      setCargando(false);
    }
  };

  // Calcular métricas derivadas
  const metricasCalculadas = useMemo(() => {
    if (!estadisticas) return null;

    const totalUsuarios = estadisticas.total;
    const usuariosActivos = estadisticas.usuariosActivos;
    const porcentajeActivos = totalUsuarios > 0 ? (usuariosActivos / totalUsuarios) * 100 : 0;

    // Calcular distribución por rol
    const distribucionRoles = Object.entries(estadisticas.porRol).map(([rol, cantidad]) => ({
      rol: rol.charAt(0).toUpperCase() + rol.slice(1),
      cantidad,
      porcentaje: totalUsuarios > 0 ? (cantidad / totalUsuarios) * 100 : 0
    })).sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalUsuarios,
      usuariosActivos,
      porcentajeActivos,
      distribucionRoles,
      rolesActivos: Object.keys(estadisticas.porRol).length
    };
  }, [estadisticas]);

  // Formatear fecha relativa
  const formatearFechaRelativa = (fecha: string) => {
    const ahora = new Date();
    const fechaEvento = new Date(fecha);
    const diffMs = ahora.getTime() - fechaEvento.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    const diffDias = diffHoras / 24;

    if (diffHoras < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHoras < 24) {
      return `Hace ${Math.floor(diffHoras)} horas`;
    } else if (diffDias < 7) {
      return `Hace ${Math.floor(diffDias)} días`;
    } else {
      return fechaEvento.toLocaleDateString('es-CO');
    }
  };

  // Obtener color para el tipo de actividad
  const getColorActividad = (tipo: string) => {
    const colores: Record<string, string> = {
      'usuario_creado': 'text-green-600 bg-green-100',
      'rol_asignado': 'text-blue-600 bg-blue-100',
      'usuario_activado': 'text-green-600 bg-green-100',
      'usuario_desactivado': 'text-red-600 bg-red-100',
      'permiso_modificado': 'text-purple-600 bg-purple-100'
    };
    return colores[tipo] || 'text-gray-600 bg-gray-100';
  };

  // Obtener icono para el tipo de actividad
  const getIconoActividad = (tipo: string) => {
    switch (tipo) {
      case 'usuario_creado':
        return <UserPlusCast className="h-4 w-4" />;
      case 'rol_asignado':
        return <ShieldCast className="h-4 w-4" />;
      case 'usuario_activado':
      case 'usuario_desactivado':
        return <UsersCast className="h-4 w-4" />;
      case 'permiso_modificado':
        return <ActivityCast className="h-4 w-4" />;
      default:
        return <ActivityCast className="h-4 w-4" />;
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)]"></div>
        <span className="ml-2 text-[color:var(--sp-neutral-600)]">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
            Estadísticas de Usuarios
          </h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">
            Métricas y actividad del sistema de usuarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[color:var(--sp-neutral-600)]">Período:</span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as any)}
            className="px-3 py-1 border border-[color:var(--sp-neutral-300)] rounded-md text-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      {metricasCalculadas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersCast className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                  {metricasCalculadas.totalUsuarios}
                </div>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">
                  Total Usuarios
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ActivityCast className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                  {metricasCalculadas.usuariosActivos}
                </div>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">
                  Usuarios Activos
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUpCast className="h-3 w-3" />
                  {metricasCalculadas.porcentajeActivos.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShieldCast className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                  {metricasCalculadas.rolesActivos}
                </div>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">
                  Roles Activos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <UserPlusCast className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[color:var(--sp-neutral-900)]">
                  {actividadReciente.length}
                </div>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">
                  Eventos Recientes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por roles */}
        <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-6">
          <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-4">
            Distribución por Roles
          </h3>
          {metricasCalculadas?.distribucionRoles.length ? (
            <div className="space-y-3">
              {metricasCalculadas.distribucionRoles.map((item, index) => (
                <div key={item.rol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'][index % 5]
                    }`} />
                    <span className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                      {item.rol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[color:var(--sp-neutral-600)]">
                      {item.cantidad} usuarios
                    </span>
                    <span className="text-xs text-[color:var(--sp-neutral-500)]">
                      ({item.porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--sp-neutral-500)]">
              No hay datos de distribución disponibles
            </p>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-6">
          <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] mb-4">
            Actividad Reciente
          </h3>
          {actividadReciente.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {actividadReciente.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-3 p-3 rounded-lg bg-[color:var(--sp-neutral-50)]">
                  <div className={`p-1.5 rounded-full ${getColorActividad(actividad.tipo)}`}>
                    {getIconoActividad(actividad.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                      {actividad.accion}
                    </p>
                    <p className="text-xs text-[color:var(--sp-neutral-600)] mb-1">
                      {actividad.usuario}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[color:var(--sp-neutral-500)]">
                      <ClockCast className="h-3 w-3" />
                      {formatearFechaRelativa(actividad.fecha)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[color:var(--sp-neutral-500)]">
              <ActivityCast className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <TrendingUpCast className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Insights del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800 mb-1">
                  <strong>Tasa de actividad:</strong> {metricasCalculadas?.porcentajeActivos.toFixed(1)}% de usuarios activos
                </p>
                <p className="text-blue-800 mb-1">
                  <strong>Roles más comunes:</strong> {metricasCalculadas?.distribucionRoles[0]?.rol || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-blue-800 mb-1">
                  <strong>Eventos recientes:</strong> {actividadReciente.length} en los últimos días
                </p>
                <p className="text-blue-800">
                  <strong>Cobertura de roles:</strong> {metricasCalculadas?.rolesActivos || 0} roles configurados
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Recomendación:</strong> Mantén una distribución equilibrada de roles
                y monitorea la actividad para identificar patrones de uso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
