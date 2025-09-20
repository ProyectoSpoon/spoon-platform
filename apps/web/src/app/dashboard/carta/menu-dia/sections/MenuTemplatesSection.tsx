"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Play, Trash2, Eye, X } from 'lucide-react';
const PlayIcon = Play as any;
const TrashIcon = Trash2 as any;
const EyeIcon = Eye as any;
const XIcon = X as any;

import { getTemplateProducts as sbGetTemplateProducts } from '@spoon/shared/lib/supabase';
import { CATEGORIAS_MENU_CONFIG } from '@spoon/shared/constants/menu-dia/menuConstants';

interface Props {
  items: any[];
  busyId: string | null;
  onUse: (tpl: any) => void;
  onDelete: (id: string) => void;
  onCreateFromCurrent?: () => void;
}

export default function MenuTemplatesSection({ items, busyId, onUse, onDelete, onCreateFromCurrent }: Props) {
  const [viewTpl, setViewTpl] = useState<any | null>(null);
  const [viewItems, setViewItems] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { name: string; items: any[] }> = {};
    for (const it of viewItems) {
      const cfg = it.category_id ? CATEGORIAS_MENU_CONFIG.find((c) => c.uuid === it.category_id) : undefined;
      const nameFromCfg = cfg?.nombre;
      const key = cfg?.id || (it.category_name ? it.category_name.toLowerCase() : String(it.category_id || 'otros'));
      const name = nameFromCfg || it.category_name || 'Otros';
      if (!groups[key]) groups[key] = { name, items: [] };
      groups[key].items.push(it);
    }
    return groups;
  }, [viewItems]);

  const openViewProducts = async (tpl: any) => {
    try {
      setViewTpl(tpl);
      setViewLoading(true);
      const items = await sbGetTemplateProducts(tpl.id);
      setViewItems(items || []);
    } catch (e) {
      console.error('view template products error', e);
      // Fallback simple alert if something goes wrong
      alert('No se pudieron cargar los productos de la plantilla');
      setViewTpl(null);
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewTpl(null);
    setViewItems([]);
  };
  return (
    <section className="bg-[--sp-surface] rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Plantillas ({items.length})</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-[color:var(--sp-neutral-600)]">No tienes plantillas guardadas</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((tpl) => (
            <div
              key={tpl.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-sm"
              onClick={() => openViewProducts(tpl)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{tpl.template_name}</h3>
                  <div className="text-xs text-[color:var(--sp-neutral-600)]">
                    {tpl.menu_price ? `Precio: $${tpl.menu_price.toLocaleString()}` : 'Sin precio definido'}
                  </div>
                  <div className="text-[10px] text-[color:var(--sp-neutral-500)]">Creada: {tpl.created_at ? new Date(tpl.created_at).toLocaleString('es-CO') : '—'}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onUse(tpl); }}
                    disabled={busyId === tpl.id}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-primary-700)]"
                    title="Usar plantilla"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openViewProducts(tpl); }}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]"
                    title="Ver productos"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); }}
                    disabled={busyId === tpl.id}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-error-600)]"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ver Productos */}
      {viewTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[color:var(--sp-overlay)]" onClick={closeView} />
          <div className="relative z-10 w-full max-w-2xl bg-[--sp-surface] rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">Productos de la plantilla</h3>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">{viewTpl.template_name}</div>
              </div>
              <button onClick={closeView} className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)]">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            {viewLoading ? (
              <div className="p-6 text-center">Cargando productos...</div>
            ) : viewItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-[color:var(--sp-neutral-600)]">Esta plantilla no tiene productos.</div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-4">
                {Object.entries(groupedByCategory).map(([key, group]) => (
                  <div key={key} className="border rounded-md">
                    <div className="px-3 py-2 font-medium bg-[color:var(--sp-neutral-100)]">{(group as any).name}</div>
                    <ul className="px-3 py-2 text-sm">
                      {(group as any).items.map((it: any, idx: number) => {
                        const key = `${it.category_id || 'no-cat'}-${it.universal_product_id}-${idx}`;
                        return (
                          <li key={key} className="py-1 border-b last:border-b-0 border-[color:var(--sp-neutral-200)]">
                            {it.product_name || 'Producto'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={closeView} className="px-4 py-2 text-sm rounded bg-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-300)]">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
