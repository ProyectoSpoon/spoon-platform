import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { Filter, Search, Calendar, Download } from 'lucide-react';

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';

interface FiltrosToolbarProps {
  tabActiva: TabActiva;
  onTabChange: (tab: TabActiva) => void;
  filtroTiempo?: string;
  onFiltroTiempoChange?: (filtro: string) => void;
  filtroFecha?: string;
  onFiltroFechaChange?: (fecha: string) => void;
  busqueda?: string;
  onBusquedaChange?: (busqueda: string) => void;
  onDescargar?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const FiltrosToolbar: React.FC<FiltrosToolbarProps> = ({
  tabActiva,
  onTabChange,
  filtroTiempo = 'hoy',
  onFiltroTiempoChange,
  filtroFecha = new Date().toISOString().split('T')[0],
  onFiltroFechaChange,
  busqueda = '',
  onBusquedaChange,
  onDescargar,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="space-y-4">
      {/* Navegación principal */}
      <div className="flex items-center justify-between">
        <nav className="flex space-x-1 bg-[color:var(--sp-neutral-100)] rounded-lg p-1">
          <Button
            variant={tabActiva === 'movimientos' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('movimientos')}
            className={tabActiva === 'movimientos' ? 'bg-[color:var(--sp-surface)] shadow-sm' : ''}
          >
            Transacciones
          </Button>
          <Button
            variant={tabActiva === 'arqueo' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('arqueo')}
            className={tabActiva === 'arqueo' ? 'bg-[color:var(--sp-surface)] shadow-sm' : ''}
          >
            Cierres de caja
          </Button>
        </nav>
      </div>

      {/* Barra de filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Botón filtrar */}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            
            {/* Selector de período */}
            <select 
              value={filtroTiempo} 
              onChange={(e) => onFiltroTiempoChange?.(e.target.value)}
              className="px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md text-sm w-32"
            >
              <option value="hoy">Diario</option>
              <option value="semana">Semanal</option>
              <option value="mes">Mensual</option>
              <option value="personalizado">Personalizado</option>
            </select>

            {/* Selector de fecha */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[color:var(--sp-neutral-500)]" />
              <Input
                type="date"
                value={filtroFecha}
                onChange={(e) => onFiltroFechaChange?.(e.target.value)}
                className="w-40"
              />
            </div>

            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)]" />
              <Input
                placeholder="Buscar concepto..."
                value={busqueda}
                onChange={(e) => onBusquedaChange?.(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDescargar}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar reporte
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? '🔄' : '↻'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};