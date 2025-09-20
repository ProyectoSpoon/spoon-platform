"use client";

import React from 'react';
import { Play, Edit3, Trash2 } from 'lucide-react';
const PlayIcon = Play as any;
const EditIcon = Edit3 as any;
const TrashIcon = Trash2 as any;

interface Props {
  items: any[];
  busyId: string | null;
  onUse: (fav: any) => void;
  onDelete: (id: string) => void;
  onCreateFromCurrent?: () => void;
  onEditName?: (id: string, name: string) => void;
}

export default function FavoriteCombinationsSection({ items, busyId, onUse, onDelete, onCreateFromCurrent, onEditName }: Props) {
  return (
    <section className="bg-[--sp-surface] rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Favoritos ({items.length})</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-[color:var(--sp-neutral-600)]">No tienes combinaciones favoritas</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((fav) => (
            <div key={fav.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{fav.combination_name || 'Combinación'}</h3>
                  {fav.combination_description && (
                    <p className="text-xs text-[color:var(--sp-neutral-600)]">{fav.combination_description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUse(fav)}
                    disabled={busyId === fav.id}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-primary-700)]"
                    title="Usar combinación"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const name = prompt('Editar nombre', fav.combination_name || '');
                      if (name != null) {
                        onEditName?.(fav.id, name);
                      }
                    }}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]"
                    title="Editar nombre"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(fav.id)}
                    disabled={busyId === fav.id}
                    className="p-1 rounded hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-error-600)]"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-[color:var(--sp-neutral-600)] space-y-1">
                <div><strong>Precio:</strong> {fav.combination_price ? `$${fav.combination_price.toLocaleString()}` : '—'}</div>
                <div className="text-[10px] text-[color:var(--sp-neutral-500)]">Creado: {fav.created_at ? new Date(fav.created_at).toLocaleString('es-CO') : '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
