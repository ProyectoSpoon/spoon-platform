'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, TrendingUp, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';

// Type casting para React
const SearchComponent = Search as any;
const FilterComponent = Filter as any;
const CalendarComponent = Calendar as any;
const TrendingUpComponent = TrendingUp as any;
const BarChart3Component = BarChart3 as any;
const ChevronDownComponent = ChevronDown as any;
const ChevronRightComponent = ChevronRight as any;

import { MenuApiService } from '@spoon/shared/services/menu-dia/menuApiService';
import { CATEGORIAS_MENU_CONFIG, CATEGORY_ICONS } from '@spoon/shared/constants/menu-dia/menuConstants';
import ProductImage from '@spoon/shared/components/ProductImage';

interface ProductUsage {
  id: string;
  universal_product_id: string;
  product_name: string;
  category_name: string;
  times_used: number;
  last_used_date: string;
  first_used_date: string;
  total_orders: number;
  avg_rating: number;
  restaurant_price: number;
}

interface MenuData {
  restaurantId: string | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  currentMenu?: any;
}

interface Props {
  menuData: MenuData;
  onReprogramarMenu?: () => void;
}

export default function MenuAnalyticsPage({ menuData, onReprogramarMenu }: Props) {
  // Destructure to provide stable references for hooks deps
  const { restaurantId, showNotification } = menuData;
  const [productUsage, setProductUsage] = useState<ProductUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'times_used' | 'last_used' | 'total_orders'>('times_used');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Cargar datos de uso de productos
  useEffect(() => {
    const loadProductUsage = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        const data = await MenuApiService.getProductUsageHistory(restaurantId);
        setProductUsage(data);
      } catch (error) {
        console.error('Error cargando historial de productos:', error);
        showNotification('Error al cargar el historial de productos', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProductUsage();
  }, [restaurantId, showNotification]);

  // Filtrar y ordenar productos
  const filteredProducts = productUsage
    .filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || 
        product.category_name.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'times_used':
          return b.times_used - a.times_used;
        case 'last_used':
          return new Date(b.last_used_date).getTime() - new Date(a.last_used_date).getTime();
        case 'total_orders':
          return b.total_orders - a.total_orders;
        default:
          return 0;
      }
    });

  // Agrupar por fecha de último uso
  const groupedByDate = useMemo(() => {
    const map = new Map<string, ProductUsage[]>();
    for (const p of filteredProducts) {
      const key = p.last_used_date ? p.last_used_date : 'Sin fecha';
      const arr = map.get(key) || [];
      arr.push(p);
      map.set(key, arr);
    }
    return map;
  }, [filteredProducts]);

  const sortedDateKeys = useMemo(() => {
    const keys = Array.from(groupedByDate.keys());
    return keys.sort((a, b) => {
      if (a === 'Sin fecha') return 1;
      if (b === 'Sin fecha') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedByDate]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const getIconForCategory = (categoryName: string) => {
    return CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-primary-600)]"></div>
  <span className="ml-3 text-[color:var(--sp-neutral-600)]">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header con métricas rápidas */}
      <div className="bg-[--sp-surface] rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)]">Historial de Productos</h3>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
              Historial de uso y popularidad de productos en tu menú
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-[color:var(--sp-info-600)] text-[color:var(--sp-on-info)] rounded-lg hover:bg-[color:var(--sp-info-700)] transition-colors"
              onClick={() => {
                if (menuData.currentMenu) {
                  const proceed = confirm('Ya hay un Menú del Día activo hoy. Esto reemplazará el menú actual. ¿Deseas continuar?');
                  if (!proceed) return;
                }
                if (onReprogramarMenu) return onReprogramarMenu();
                showNotification('Abre el asistente desde "Productos Día" para reprogramar el menú.', 'success');
              }}
            >
              Reprogramar Menú
            </button>
            <BarChart3Component className="h-8 w-8 text-[color:var(--sp-primary-600)]" />
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[color:var(--sp-primary-50)] p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUpComponent className="h-5 w-5 text-[color:var(--sp-primary-600)]" />
              <span className="ml-2 text-sm font-medium text-[color:var(--sp-primary-900)]">
                Productos Únicos
              </span>
            </div>
            <div className="mt-1 text-2xl font-bold text-[color:var(--sp-primary-900)]">
              {productUsage.length}
            </div>
          </div>
          
          <div className="bg-[color:var(--sp-success-50)] p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[color:var(--sp-success-900)]">
                Más Usado
              </span>
            </div>
            <div className="mt-1 text-lg font-bold text-[color:var(--sp-success-900)]">
              {productUsage[0]?.times_used || 0} veces
            </div>
          </div>

          <div className="bg-[color:var(--sp-info-50)] p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[color:var(--sp-info-900)]">
                Total Órdenes
              </span>
            </div>
            <div className="mt-1 text-lg font-bold text-[color:var(--sp-info-900)]">
              {productUsage.reduce((sum, p) => sum + p.total_orders, 0)}
            </div>
          </div>

          <div className="bg-[color:var(--sp-warning-50)] p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[color:var(--sp-warning-900)]">
                Categorías
              </span>
            </div>
            <div className="mt-1 text-lg font-bold text-[color:var(--sp-warning-900)]">
              {new Set(productUsage.map(p => p.category_name)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtro */}
      <div className="bg-[--sp-surface] rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <SearchComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)] w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="flex items-center gap-2">
            <FilterComponent className="h-4 w-4 text-[color:var(--sp-neutral-600)]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] text-sm"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIAS_MENU_CONFIG.map(category => (
                <option key={category.id} value={category.nombre}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[color:var(--sp-neutral-600)]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] text-sm"
            >
              <option value="times_used">Más usado</option>
              <option value="last_used">Más reciente</option>
              <option value="total_orders">Más pedido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de productos agrupada por fecha */}
      {filteredProducts.length > 0 ? (
        <div className="bg-[--sp-surface] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[color:var(--sp-neutral-50)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Veces Usado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Total Órdenes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Última Vez
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--sp-neutral-500)] uppercase tracking-wider">
                    Calificación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[--sp-surface] divide-y divide-[color:var(--sp-neutral-200)]">
                {sortedDateKeys.map((dateKey) => {
                  const items = groupedByDate.get(dateKey) || [];
                  const isCollapsed = collapsedGroups.has(dateKey);
                  return (
                    <React.Fragment key={dateKey}>
                      <tr className="bg-[color:var(--sp-neutral-50)]">
                        <td colSpan={6} className="px-6 py-2">
                          <button
                            type="button"
                            aria-expanded={!isCollapsed}
                            onClick={() => toggleGroup(dateKey)}
                            className="w-full text-left flex items-center gap-2 text-xs font-semibold text-[color:var(--sp-neutral-700)] uppercase tracking-wide hover:text-[color:var(--sp-neutral-900)]"
                          >
                            {isCollapsed ? (
                              <ChevronRightComponent className="h-4 w-4" />
                            ) : (
                              <ChevronDownComponent className="h-4 w-4" />
                            )}
                            <span>
                              {dateKey === 'Sin fecha' ? 'Sin fecha' : new Date(dateKey).toLocaleDateString('es-CO')}
                            </span>
                            <span className="ml-2 text-[color:var(--sp-neutral-500)] normal-case">({items.length})</span>
                          </button>
                        </td>
                      </tr>
                      {!isCollapsed && items.map((product) => (
                      <tr key={product.id} className="hover:bg-[color:var(--sp-neutral-50)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <ProductImage
                                product={{ name: product.product_name }}
                                size={40}
                                className="rounded-lg"
                                fallbackIcon={getIconForCategory(product.category_name)}
                                showFallback={true}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                                {product.product_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-800)]">
                            {product.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[color:var(--sp-success-600)]">
                            {product.times_used}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--sp-neutral-900)]">
                          {product.total_orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--sp-neutral-600)]">
                          {new Date(product.last_used_date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-[color:var(--sp-warning-600)]">
                              {product.avg_rating ? `⭐ ${product.avg_rating.toFixed(1)}` : '—'}
                            </span>
                          </div>
                        </td>
                      </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[--sp-surface] rounded-lg shadow-sm p-8 text-center">
          <BarChart3Component className="h-12 w-12 text-[color:var(--sp-neutral-400)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-2">
            No hay datos de historial
          </h3>
          <p className="text-[color:var(--sp-neutral-600)]">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No se encontraron productos con los filtros aplicados.'
              : 'Crea algunos menús para ver el historial de uso de productos.'}
          </p>
        </div>
      )}
    </div>
  );
}
