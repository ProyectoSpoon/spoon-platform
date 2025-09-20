import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Calendar, User, Activity, Shield, UserPlus, UserX, Settings } from 'lucide-react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { SelectV2 as Select } from '@spoon/shared/components/ui/SelectV2';
import { UsuariosService, type CambioAuditoria } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react y @spoon/shared
const FileTextCast = FileText as any;
const DownloadCast = Download as any;
const CalendarCast = Calendar as any;
const UserCast = User as any;
const ActivityCast = Activity as any;
const ShieldCast = Shield as any;
const UserPlusCast = UserPlus as any;
const UserXCast = UserX as any;
const SettingsCast = Settings as any;
const ButtonCast = Button as any;
const SelectCast = Select as any;
const InputCast = Input as any;

interface AuditoriaTabProps {
  onNotification: (notification: any) => void;
}

export const AuditoriaTab: React.FC<AuditoriaTabProps> = ({ onNotification }) => {
  const [cambios, setCambios] = useState<CambioAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [exportando, setExportando] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [kpiData, setKpiData] = useState<CambioAuditoria[]>([]);

  const cargarHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error, total } = await UsuariosService.getHistorialCambios({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(new Date(endDate).setHours(23,59,59,999)).toISOString() : undefined,
        page,
        pageSize,
      });
      
      if (error) throw error;
      
      setCambios(data || []);
      setTotal(total || 0);
      // Cargar dataset extendido para KPIs del periodo (hasta 1000)
      const { data: kpiList } = await UsuariosService.getHistorialCambios({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(new Date(endDate).setHours(23,59,59,999)).toISOString() : undefined,
        page: 1,
        pageSize: 1000,
      });
      setKpiData(kpiList || []);
    } catch (error) {
      console.error('Error cargando historial:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el historial de cambios'
      });
    } finally {
      setLoading(false);
    }
  }, [onNotification, startDate, endDate, page, pageSize]);

  // Cargar historial al montar el componente
  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const exportarAuditoria = async () => {
    setExportando(true);
    try {
      const { data, error } = await UsuariosService.exportarAuditoria({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(new Date(endDate).setHours(23,59,59,999)).toISOString() : undefined,
      });
      
      if (error) throw error;
      
      if (data) {
        // Crear archivo CSV y descargarlo
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `auditoria-usuarios-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onNotification({
          type: 'success',
          title: 'Exportación completada',
          message: 'El archivo de auditoría se ha descargado correctamente'
        });
      }
    } catch (error) {
      console.error('Error exportando:', error);
      onNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar la auditoría'
      });
    } finally {
      setExportando(false);
    }
  };

  // Filtrar cambios
  const cambiosFiltrados = cambios.filter(cambio => {
    const cumpleFiltroTipo = filtroTipo === 'todos' || cambio.tipo === filtroTipo;
    const cumpleBusqueda = busqueda === '' ||
      cambio.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      cambio.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      cambio.detalles.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroTipo && cumpleBusqueda;
  });

  // KPIs por periodo aplicando filtros de tipo/búsqueda sobre dataset expandido
  const kpiFiltrados = kpiData.filter(cambio => {
    const cumpleFiltroTipo = filtroTipo === 'todos' || cambio.tipo === filtroTipo;
    const cumpleBusqueda = busqueda === '' ||
      cambio.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      cambio.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      cambio.detalles.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltroTipo && cumpleBusqueda;
  });

  // Obtener icono según el tipo de cambio
  const getIconoPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'usuario_creado':
        return <UserPlusCast className="h-4 w-4 text-[color:var(--sp-success-600)]" />;
      case 'usuario_activado':
        return <UserCast className="h-4 w-4 text-[color:var(--sp-success-600)]" />;
      case 'usuario_desactivado':
        return <UserXCast className="h-4 w-4 text-[color:var(--sp-error-600)]" />;
      case 'rol_asignado':
        return <ShieldCast className="h-4 w-4 text-[color:var(--sp-info-600)]" />;
      case 'permiso_modificado':
        return <SettingsCast className="h-4 w-4 text-[color:var(--sp-warning-600)]" />;
      default:
        return <ActivityCast className="h-4 w-4 text-[color:var(--sp-neutral-600)]" />;
    }
  };

  // Obtener color del badge según el tipo
  const getColorPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'usuario_creado':
      case 'usuario_activado':
        return 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]';
      case 'usuario_desactivado':
        return 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]';
      case 'rol_asignado':
        return 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-800)]';
      case 'permiso_modificado':
        return 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]';
      default:
        return 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]';
    }
  };

  // Formatear fecha de forma legible
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    } else if (horas < 24) {
      return `Hace ${horas} horas`;
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
            <FileTextCast className="h-5 w-5" />
            Historial de Cambios
          </h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">
            Registro completo de todas las modificaciones realizadas
          </p>
        </div>
        <ButtonCast
          onClick={exportarAuditoria}
          disabled={exportando}
          className="flex items-center gap-2"
        >
          <DownloadCast className="h-4 w-4" />
          {exportando ? 'Exportando...' : 'Exportar'}
        </ButtonCast>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[color:var(--sp-neutral-600)]">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
            className="border border-[color:var(--sp-neutral-300)] rounded-md px-2 py-1 text-sm bg-[color:var(--sp-surface)]"
          />
          <label className="text-sm text-[color:var(--sp-neutral-600)]">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
            className="border border-[color:var(--sp-neutral-300)] rounded-md px-2 py-1 text-sm bg-[color:var(--sp-surface)]"
          />
          <ButtonCast onClick={() => { setPage(1); cargarHistorial(); }} className="ml-2">Aplicar</ButtonCast>
          {(startDate || endDate) && (
            <ButtonCast variant="secondary" onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}>
              Limpiar
            </ButtonCast>
          )}
        </div>
        <div className="md:w-64">
          <SelectCast
            value={filtroTipo}
            onChange={(e: any) => setFiltroTipo(e.target.value)}
            placeholder="Filtrar por tipo"
          >
            <option value="todos">Todos los tipos</option>
            <option value="usuario_creado">Usuario creado</option>
            <option value="usuario_activado">Usuario activado</option>
            <option value="usuario_desactivado">Usuario desactivado</option>
            <option value="rol_asignado">Rol asignado</option>
            <option value="permiso_modificado">Permiso modificado</option>
          </SelectCast>
        </div>
        <div className="flex-1">
          <InputCast
            placeholder="🔍 Buscar en el historial..."
            value={busqueda}
            onChange={(e: any) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-3">
          <div className="text-xl font-bold text-[color:var(--sp-info-700)]">
            {kpiFiltrados.length}
          </div>
          <div className="text-xs text-[color:var(--sp-info-600)]">Total de cambios (periodo)</div>
        </div>
        <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-3">
          <div className="text-xl font-bold text-[color:var(--sp-success-700)]">
            {kpiFiltrados.filter(c => c.tipo === 'usuario_creado').length}
          </div>
          <div className="text-xs text-[color:var(--sp-success-600)]">Usuarios creados</div>
        </div>
        <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-3">
          <div className="text-xl font-bold text-[color:var(--sp-warning-700)]">
            {kpiFiltrados.filter(c => c.tipo === 'rol_asignado').length}
          </div>
          <div className="text-xs text-[color:var(--sp-warning-600)]">Roles modificados</div>
        </div>
        <div className="bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg p-3">
          <div className="text-xl font-bold text-[color:var(--sp-error-700)]">
            {kpiFiltrados.filter(c => c.tipo === 'permiso_modificado').length}
          </div>
          <div className="text-xs text-[color:var(--sp-error-600)]">Permisos modificados</div>
        </div>
      </div>

      {/* Timeline de cambios */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-2"></div>
              <span className="text-[color:var(--sp-neutral-600)]">Cargando historial...</span>
            </div>
          </div>
        ) : cambiosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-[color:var(--sp-neutral-500)]">
            <FileTextCast className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron cambios con los filtros aplicados</p>
          </div>
        ) : (
          cambiosFiltrados.map((cambio) => (
            <div
              key={cambio.id}
              className="bg-[color:var(--sp-surface)] rounded-lg border border-[color:var(--sp-neutral-200)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getIconoPorTipo(cambio.tipo)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[color:var(--sp-neutral-900)]">
                        {cambio.accion}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getColorPorTipo(cambio.tipo)}`}>
                        {cambio.tipo.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[color:var(--sp-neutral-700)] mb-2">
                      {cambio.detalles}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-[color:var(--sp-neutral-500)]">
                      <div className="flex items-center gap-1">
                        <UserCast className="h-3 w-3" />
                        <span>Usuario: {cambio.usuario}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarCast className="h-3 w-3" />
                        <span>{formatearFecha(cambio.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ActivityCast className="h-3 w-3" />
                        <span>Por: {cambio.realizado_por}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-[color:var(--sp-neutral-600)]">
          Mostrando {cambios.length > 0 ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + cambios.length} de {total}
        </div>
        <div className="flex items-center gap-2">
          <ButtonCast variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</ButtonCast>
          <ButtonCast variant="secondary" disabled={(page * pageSize) >= total} onClick={() => setPage((p) => p + 1)}>Siguiente</ButtonCast>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="text-center py-4 text-xs text-[color:var(--sp-neutral-500)]">
        <p>
          Los cambios se registran automáticamente y se conservan por tiempo indefinido.
          Exporta regularmente para tener respaldos locales.
        </p>
      </div>
    </div>
  );
};