import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { Filter, Search, Calendar, Download } from 'lucide-react';

// Type casting for React type conflicts
const ButtonComponent = Button as any;
const InputComponent = Input as any;
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const FilterComponent = Filter as any;
const SearchComponent = Search as any;
const CalendarComponent = Calendar as any;
const DownloadComponent = Download as any;

type TabActiva = 'movimientos' | 'arqueo' | 'reportes';

interface FiltrosToolbarProps {
  tabActiva: TabActiva;
  onTabChange: (tab: TabActiva) => void;
  filtroTiempo?: string;
  onFiltroTiempoChange?: (filtro: string) => void;
  filtroFecha?: string;
  onFiltroFechaChange?: (fecha: string) => void;
  filtroFechaFin?: string; // para personalizado
  onFiltroFechaFinChange?: (fecha: string) => void;
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
  filtroFecha = require('@spoon/shared/utils/datetime').getBogotaDateISO(),
  onFiltroFechaChange,
  filtroFechaFin,
  onFiltroFechaFinChange,
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
        <nav className="flex space-x-1 bg-[color:var(--sp-neutral-100)] rounded-lg p-1" role="tablist" aria-label="Navegación de transacciones">
          <ButtonComponent
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('movimientos')}
            role="tab"
            aria-selected={tabActiva === 'movimientos'}
            className={
              tabActiva === 'movimientos'
                ? 'bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)] shadow-sm focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 active:ring-2 active:ring-[color:var(--sp-focus)] active:ring-offset-2'
                : 'text-[color:var(--sp-on-surface)]/80 hover:text-[color:var(--sp-on-surface)] focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 active:ring-2 active:ring-[color:var(--sp-focus)] active:ring-offset-2'
            }
          >
            Transacciones
          </ButtonComponent>
          <ButtonComponent
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('arqueo')}
      role="tab"
      aria-selected={tabActiva === 'arqueo'}
            className={
              tabActiva === 'arqueo'
        ? 'bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)] shadow-sm focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 active:ring-2 active:ring-[color:var(--sp-focus)] active:ring-offset-2'
        : 'text-[color:var(--sp-on-surface)]/80 hover:text-[color:var(--sp-on-surface)] focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 active:ring-2 active:ring-[color:var(--sp-focus)] active:ring-offset-2'
            }
          >
            Cierres de caja
          </ButtonComponent>
        </nav>
      </div>

      {/* Barra de filtros */}
      <CardComponent>
        <CardContentComponent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Botón filtrar */}
            <ButtonComponent variant="outline" size="sm">
              <FilterComponent className="w-4 h-4 mr-2" />
              Filtrar
            </ButtonComponent>
            
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

            {/* Selector de fecha(s) */}
            <div className="flex items-center space-x-2">
              <CalendarComponent className="w-4 h-4 text-[color:var(--sp-neutral-500)]" />
              <InputComponent
                type="date"
                value={filtroFecha}
                onChange={(e: any) => onFiltroFechaChange?.(e.target.value)}
                className="w-40"
              />
              {filtroTiempo === 'personalizado' && (
                <>
                  <span className="text-sm text-[color:var(--sp-neutral-600)]">a</span>
                  <InputComponent
                    type="date"
                    value={filtroFechaFin || filtroFecha}
                    onChange={(e: any) => onFiltroFechaFinChange?.(e.target.value)}
                    className="w-40"
                  />
                </>
              )}
            </div>

            {/* Buscador */}
            <div className="flex-1 relative">
              <SearchComponent className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)]" />
              <InputComponent
                placeholder="Buscar concepto..."
                value={busqueda}
                onChange={(e: any) => onBusquedaChange?.(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-2">
              <ButtonComponent 
                variant="outline" 
                size="sm"
                onClick={onDescargar}
                disabled={loading}
              >
                <DownloadComponent className="w-4 h-4 mr-2" />
                Descargar reporte
              </ButtonComponent>
              
              <ButtonComponent 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? '🔄' : '↻'}
              </ButtonComponent>
            </div>
          </div>
        </CardContentComponent>
      </CardComponent>
    </div>
  );
};

