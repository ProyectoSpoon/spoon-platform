"use client";

import React from 'react';
import { Grid } from 'lucide-react';

interface Props {
  hasActiveMenu: boolean;
  hasCombinations: boolean;
  onGenerate: () => void;
  onClearFilters: () => void;
}

export default function CombinationsEmptyState({ hasActiveMenu, hasCombinations, onGenerate, onClearFilters }: Props) {
  const isNoData = !hasCombinations;
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-[color:var(--sp-neutral-100)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Grid className="w-12 h-12 text-[color:var(--sp-neutral-400)]" />
        </div>
        <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-4">
          {isNoData ? 'No hay combinaciones disponibles' : 'No se encontraron combinaciones'}
        </h3>
        <p className="text-[color:var(--sp-neutral-600)] mb-8">
          {isNoData
            ? hasActiveMenu
              ? 'Tienes un menú activo, pero aún no hay combinaciones. Abre el asistente para generarlas a partir de tu configuración.'
              : 'Crea un menú del día para generar combinaciones automáticamente.'
            : 'Prueba ajustando los filtros de búsqueda.'}
        </p>
        <button
          onClick={isNoData ? onGenerate : onClearFilters}
          className="px-6 py-3 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] transition-colors"
        >
          {isNoData ? (hasActiveMenu ? 'Generar combinaciones' : 'Crear Primer Menú') : 'Limpiar Filtros'}
        </button>
      </div>
    </div>
  );
}
