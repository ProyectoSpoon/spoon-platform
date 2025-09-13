"use client";

import React from 'react';
import { Heart, Star, RefreshCw, Edit3, Plus } from 'lucide-react';
import { ComboFilters, LoadingStates } from '@spoon/shared/types/menu-dia/menuTypes';

// Type casting for React type conflicts
const HeartComponent = Heart as any;
const StarComponent = Star as any;
const RefreshCwComponent = RefreshCw as any;
const Edit3Component = Edit3 as any;
const PlusComponent = Plus as any;

interface Props {
  filters: ComboFilters;
  setFilters: (updater: (prev: ComboFilters) => ComboFilters) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasActiveMenu: boolean;
  loadingStates: LoadingStates;
  onEditMenu: () => void;
  onCreateMenu: () => void;
  showPrimaryCta?: boolean; // para permitir ocultarlo en contextos que no lo requieran
}

export default function CombinationsFilterBar({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  hasActiveMenu,
  loadingStates,
  onEditMenu,
  onCreateMenu,
  showPrimaryCta = true
}: Props) {
  return (
    <div className="bg-[--sp-surface] rounded-lg shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar combinaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
          >
            <option value="name">Ordenar por nombre</option>
            <option value="price">Ordenar por precio</option>
            <option value="created">Ordenar por fecha</option>
          </select>

          <button
            onClick={() => setFilters((prev) => ({ ...prev, favorites: !prev.favorites }))}
            className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
              filters.favorites
                ? 'bg-[color:var(--sp-error-50)] border-[color:var(--sp-error-200)] text-[color:var(--sp-error-700)]'
                : 'bg-[--sp-surface] border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-50)]'
            }`}
          >
            <HeartComponent className={`w-4 h-4 mr-2 ${filters.favorites ? 'fill-current' : ''}`} />
            Favoritos
          </button>

          <button
            onClick={() => setFilters((prev) => ({ ...prev, specials: !prev.specials }))}
            className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
              filters.specials
                ? 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)] text-[color:var(--sp-warning-700)]'
                : 'bg-[--sp-surface] border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-50)]'
            }`}
          >
            <StarComponent className={`w-4 h-4 mr-2 ${filters.specials ? 'fill-current' : ''}`} />
            Especiales
          </button>

          <select
            value={filters.availability}
            onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value as any }))}
            className="px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
          >
            <option value="all">Todas</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>

          {showPrimaryCta && (
            <div className="flex gap-2">
              <button
                onClick={hasActiveMenu ? onEditMenu : onCreateMenu}
                disabled={loadingStates.loading}
                className="flex items-center px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50 transition-colors"
              >
                {loadingStates.loading ? (
                  <RefreshCwComponent className="w-4 h-4 mr-2 animate-spin" />
                ) : hasActiveMenu ? (
                  <Edit3Component className="w-4 h-4 mr-2" />
                ) : (
                  <PlusComponent className="w-4 h-4 mr-2" />
                )}
                {loadingStates.loading ? 'Cargando...' : hasActiveMenu ? 'Editar Menú' : 'Nuevo Menú'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

