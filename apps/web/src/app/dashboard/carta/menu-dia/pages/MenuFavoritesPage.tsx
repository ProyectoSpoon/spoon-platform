'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, PlusCircle, Play, Search } from 'lucide-react';
const Trash2Icon = Trash2 as any;
const PlusCircleIcon = PlusCircle as any;
const PlayIcon = Play as any;

import { 
  getFavoriteCombinations as sbGetFavoriteCombinations,
  getMenuTemplates as sbGetMenuTemplates,
  deleteFavoriteCombination as sbDeleteFavoriteCombination,
  deleteMenuTemplate as sbDeleteMenuTemplate,
  getTemplateProducts as sbGetTemplateProducts,
  updateFavoriteCombinationName as sbUpdateFavoriteCombinationName,
} from '@spoon/shared/lib/supabase';
import { CATEGORIAS_MENU_CONFIG } from '@spoon/shared/constants/menu-dia/menuConstants';
import FavoriteCombinationsSection from '@/app/dashboard/carta/menu-dia/sections/FavoriteCombinationsSection';
import MenuTemplatesSection from '@/app/dashboard/carta/menu-dia/sections/MenuTemplatesSection';

interface MenuDataLike {
  restaurantId: string | null;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  setSelectedProducts: (p: Record<string, any[]>) => void;
  setMenuPrice: (n: number) => void;
  menuPrice: number;
  setHasUnsavedChanges?: (b: boolean) => void;
}

interface Props {
  menuData: MenuDataLike & { selectedProducts?: Record<string, any[]> };
  onUseTemplate?: () => void;
}

export default function MenuFavoritesPage({ menuData, onUseTemplate }: Props) {
  const { restaurantId, showNotification } = menuData;
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'templates'>('favorites');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date' | 'price'>('date');

  const filteredFavorites = (() => {
    const list = favorites || [];
    const bySearch = search.trim().toLowerCase();
    let out = bySearch ? list.filter((f) => (f.combination_name || '').toLowerCase().includes(bySearch)) : list;
    // default sort: prefer updated_at, then created_at, then id as tiebreaker
    out = out.slice().sort((a, b) => {
      const ta = new Date((b.updated_at || b.created_at || 0)).getTime();
      const tb = new Date((a.updated_at || a.created_at || 0)).getTime();
      if (ta !== tb) return ta - tb;
      // fallback stable sort by id desc
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
    return out;
  })();

  const filteredTemplates = (() => {
    const list = templates || [];
    const bySearch = search.trim().toLowerCase();
    let out = bySearch ? list.filter((t) => (t.template_name || '').toLowerCase().includes(bySearch)) : list;
    if (sort === 'price') {
      out = out.slice().sort((a, b) => (a.menu_price || 0) - (b.menu_price || 0));
    } else {
      out = out.slice().sort((a, b) => {
        const ta = new Date((b.updated_at || b.created_at || 0)).getTime();
        const tb = new Date((a.updated_at || a.created_at || 0)).getTime();
        if (ta !== tb) return ta - tb;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
    }
    return out;
  })();

  useEffect(() => {
    const load = async () => {
      if (!restaurantId) return;
      try {
        setLoading(true);
        const [fav, tpl] = await Promise.all([
          sbGetFavoriteCombinations(restaurantId),
          sbGetMenuTemplates(restaurantId)
        ]);
        setFavorites(fav || []);
        setTemplates(tpl || []);
      } catch (e) {
        console.error('[Favorites] load error', e);
        showNotification('No se pudo cargar Favoritos/Plantillas', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId, showNotification]);

  const handleDeleteFavorite = async (id: string) => {
    try {
      setBusyId(id);
  await sbDeleteFavoriteCombination(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      showNotification('Favorito eliminado');
    } catch (e) {
      console.error('[Favorites] delete favorite', e);
      showNotification('Error al eliminar favorito', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setBusyId(id);
  await sbDeleteMenuTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showNotification('Plantilla eliminada');
    } catch (e) {
      console.error('[Favorites] delete template', e);
      showNotification('Error al eliminar plantilla', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const applyTemplate = async (template: any) => {
    try {
      setBusyId(template.id);
  const items = await sbGetTemplateProducts(template.id);
      const selectedByCat: Record<string, any[]> = {};
      for (const item of items) {
        const cfg = item.category_id
          ? CATEGORIAS_MENU_CONFIG.find((c) => c.uuid === item.category_id)
          : (item.category_name ? CATEGORIAS_MENU_CONFIG.find((c) => c.nombre?.toLowerCase() === String(item.category_name).toLowerCase()) : undefined);
        const catId = cfg?.id || 'otros';
        if (!selectedByCat[catId]) selectedByCat[catId] = [];
        selectedByCat[catId].push({
          id: item.universal_product_id,
          name: item.product_name,
          category_id: item.category_id,
        });
      }
      menuData.setSelectedProducts(selectedByCat);
      if (template.menu_price) menuData.setMenuPrice(template.menu_price);
  // mark as dirty so Save is enabled
  menuData.setHasUnsavedChanges?.(true);
      onUseTemplate?.();
      showNotification('Plantilla aplicada a la selección');
    } catch (e) {
      console.error('[Favorites] apply template', e);
      showNotification('Error al aplicar plantilla', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[--sp-surface] rounded-lg p-6 text-center">
        Cargando favoritos y plantillas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Favoritos y Plantillas</h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">Reutiliza combinaciones y configuraciones completas.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'favorites' ? 'Buscar combinación...' : 'Buscar plantilla...'}
              className="pl-9 pr-3 py-2 rounded-lg border border-[color:var(--sp-neutral-300)] text-sm"
            />
          </div>
          {activeTab === 'templates' && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-[color:var(--sp-neutral-300)] text-sm"
            >
              <option value="date">Más recientes</option>
              <option value="price">Precio</option>
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[color:var(--sp-neutral-100)] rounded-lg p-1 inline-flex">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'favorites' ? 'bg-[--sp-surface] shadow-sm' : ''}`}
        >
          Favoritos ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'templates' ? 'bg-[--sp-surface] shadow-sm' : ''}`}
        >
          Plantillas ({templates.length})
        </button>
      </div>

      {/* Content by tab */}
      {activeTab === 'favorites' ? (
        <FavoriteCombinationsSection
          items={filteredFavorites}
          busyId={busyId}
          onDelete={handleDeleteFavorite}
          onUse={(fav: any) => {
            // Pre-cargar wizard con combinación específica
            // Creamos selectedProducts mínimos con principio, proteina, etc.
            const selectedByCat: Record<string, any[]> = {};
            const pushByUuid = (uuid: string | null, productId: string | null, name?: string) => {
              if (!uuid || !productId) return;
              const cfg = CATEGORIAS_MENU_CONFIG.find((c) => c.uuid === uuid);
              if (!cfg) return;
              if (!selectedByCat[cfg.id]) selectedByCat[cfg.id] = [];
              selectedByCat[cfg.id].push({ id: productId, name: name || 'Producto', category_id: uuid });
            };
            const cat = (id: string) => CATEGORIAS_MENU_CONFIG.find((c) => c.id === id)?.uuid || null;
            // Usar uuids conocidos por categoría si la fila no los trae
            pushByUuid(cat('principios'), fav.principio_product_id || null);
            pushByUuid(cat('proteinas'), fav.proteina_product_id || null);
            if (fav.entrada_product_id) pushByUuid(cat('entradas'), fav.entrada_product_id);
            if (fav.bebida_product_id) pushByUuid(cat('bebidas'), fav.bebida_product_id);
            // acompañamientos es array de uuids sin nombre; el wizard no requiere nombre
            if (Array.isArray(fav.acompanamiento_products)) {
              const acompCfg = CATEGORIAS_MENU_CONFIG.find((c) => c.id === 'acompanamientos');
              if (acompCfg) {
                selectedByCat[acompCfg.id] = fav.acompanamiento_products.map((pid: string) => ({ id: pid, name: 'Acompañamiento', category_id: acompCfg.uuid }));
              }
            }
            menuData.setSelectedProducts(selectedByCat);
            if (fav.combination_price) menuData.setMenuPrice(fav.combination_price);
            menuData.setHasUnsavedChanges?.(true);
            onUseTemplate?.();
            showNotification('Combinación favorita aplicada');
          }}
          onCreateFromCurrent={() => {
            showNotification('Para guardar actual como favorito, usa el botón en una tarjeta de combinación.');
          }}
          onEditName={async (favId: string, newName: string) => {
            try {
              setBusyId(favId);
              await sbUpdateFavoriteCombinationName(favId, newName);
              setFavorites((prev) => prev.map((f) => (f.id === favId ? { ...f, combination_name: newName } : f)));
              showNotification('Nombre actualizado');
            } catch (e) {
              console.error('edit favorite name error', e);
              showNotification('Error al actualizar nombre', 'error');
            } finally {
              setBusyId(null);
            }
          }}
        />
      ) : (
        <MenuTemplatesSection
          items={filteredTemplates}
          busyId={busyId}
          onUse={applyTemplate}
          onDelete={handleDeleteTemplate}
          onCreateFromCurrent={() => {
            showNotification('Para crear plantilla, usa la opción en el paso final del asistente.');
          }}
        />
      )}
    </div>
  );
}
