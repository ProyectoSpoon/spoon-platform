"use client";

import React from 'react';
import { MenuCombinacion, LoadingStates } from '@spoon/shared/types/menu-dia/menuTypes';
import { Heart, Star, Edit3, RefreshCw, Check, X, Trash2 } from 'lucide-react';

interface Props {
  combo: MenuCombinacion;
  index: number;
  loadingStates: LoadingStates;
  onEdit: (id: string) => void;
  onSave: (id: string, updates: MenuCombinacion) => void;
  onCancel: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleSpecial: (id: string) => void;
  onAskDelete: (id: string) => void;
  onDraftChange: (id: string, patch: Partial<MenuCombinacion>) => void;
}

export default function CombinationCard({
  combo,
  index,
  loadingStates,
  onEdit,
  onSave,
  onCancel,
  onToggleFavorite,
  onToggleSpecial,
  onAskDelete,
  onDraftChange
}: Props) {
  return (
    <div
      className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
        combo.disponible ? 'bg-[--sp-surface-elevated] border-[--sp-border]' : 'bg-[color:var(--sp-neutral-50)] border-[color:var(--sp-neutral-300)]'
      } ${combo.isEditing ? 'ring-2 ring-[color:var(--sp-primary-500)]' : ''}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[color:var(--sp-neutral-900)] text-sm leading-5">
            {combo.isEditing ? (
              <input
                type="text"
                value={combo.nombre || ''}
                onChange={(e) => onDraftChange(combo.id, { nombre: e.target.value })}
                className="w-full text-sm font-semibold border border-[color:var(--sp-neutral-300)] rounded px-2 py-1 focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
              />
            ) : (
              combo.nombre || `Combinación #${index + 1}`
            )}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => onToggleFavorite(combo.id)}
              className={`p-1 hover:bg-[color:var(--sp-error-100)] rounded transition-colors ${
                combo.favorito ? 'text-[color:var(--sp-error-600)]' : 'text-[color:var(--sp-neutral-400)]'
              }`}
            >
              <Heart className={`h-4 w-4 ${combo.favorito ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onToggleSpecial(combo.id)}
              className={`p-1 hover:bg-[color:var(--sp-warning-100)] rounded transition-colors ${
                combo.especial ? 'text-[color:var(--sp-warning-600)]' : 'text-[color:var(--sp-neutral-400)]'
              }`}
            >
              <Star className={`h-4 w-4 ${combo.especial ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Descripción */}
        <div className="text-xs text-[color:var(--sp-neutral-600)]">
          {combo.isEditing ? (
            <textarea
              value={combo.descripcion || ''}
              onChange={(e) => onDraftChange(combo.id, { descripcion: e.target.value })}
              className="w-full text-xs border border-[color:var(--sp-neutral-300)] rounded px-2 py-1 focus:ring-2 focus:ring-[color:var(--sp-primary-500)] resize-none"
              rows={2}
            />
          ) : (
            combo.descripcion || 'Combinación del menú del día'
          )}
        </div>

        {/* Precio */}
        <div className="space-y-2 pt-2 border-t border-[color:var(--sp-neutral-200)]">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[color:var(--sp-neutral-900)]">
              {combo.isEditing ? (
                <div className="flex items-center">
                  <span className="text-sm mr-1">$</span>
                  <input
                    type="number"
                    value={combo.precio || 0}
                    onChange={(e) => onDraftChange(combo.id, { precio: parseInt(e.target.value) || 0 })}
                    className="w-20 text-lg font-bold border border-[color:var(--sp-neutral-300)] rounded px-2 py-1 focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
                  />
                </div>
              ) : (
                `$${(combo.precio || 0).toLocaleString()}`
              )}
            </span>
          </div>

          {combo.cantidad && (
            <div className="text-xs text-[color:var(--sp-neutral-600)]">Cantidad disponible: {combo.cantidad}</div>
          )}
        </div>

        {/* Estado y acciones */}
        <div className="flex justify-between items-center pt-2 border-t border-[color:var(--sp-neutral-200)]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                combo.disponible
                  ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]'
                  : 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]'
              }`}
            >
              {combo.disponible ? 'Disponible' : 'No disponible'}
            </span>
            {combo.especial && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-800)]">
                Especial
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {combo.isEditing ? (
              <>
                <button
                  onClick={() => onSave(combo.id, combo)}
                  disabled={loadingStates.updating === combo.id}
                  className="p-1 text-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-100)] rounded transition-colors disabled:opacity-50"
                >
                  {loadingStates.updating === combo.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onCancel(combo.id)}
                  className="p-1 text-[color:var(--sp-neutral-600)] hover:bg-[color:var(--sp-neutral-100)] rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(combo.id)}
                  className="p-1 text-[color:var(--sp-info-600)] hover:bg-[color:var(--sp-info-100)] rounded transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAskDelete(combo.id)}
                  className="p-1 text-[color:var(--sp-error-600)] hover:bg-[color:var(--sp-error-100)] rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
