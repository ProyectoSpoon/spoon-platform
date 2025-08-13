/**
 * EJEMPLO DE OPTIMIZACIÓN DE HOOKS
 * Patrones de optimización para hooks de mesas
 */

import { useMemo, useCallback } from 'react';
import { Mesa } from '@spoon/shared/types/mesas';

// Optimización 1: Memoización de cálculos costosos
export const useOptimizedMesaStats = (mesas: Mesa[]) => {
  const estadisticas = useMemo(() => {
    // Cálculos pesados memoizados
    return mesas.reduce((acc, mesa) => {
      // Lógica de cálculo
      return acc;
    }, {});
  }, [mesas]);

  const calcularPromedios = useCallback((filtro: string) => {
    // Función estable para evitar re-renders
    return estadisticas;
  }, [estadisticas]);

  return { estadisticas, calcularPromedios };
};

// Optimización 2: Componente memoizado
import React from 'react';

interface MesaCardOptimizedProps {
  mesa: Mesa;
  onClick: (mesa: Mesa) => void;
}

export const MesaCardOptimized = React.memo<MesaCardOptimizedProps>(({ 
  mesa, 
  onClick 
}) => {
  const handleClick = useCallback(() => {
    onClick(mesa);
  }, [mesa, onClick]);

  return (
    <div onClick={handleClick}>
      {/* Contenido del componente */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada
  return (
    prevProps.mesa.id === nextProps.mesa.id &&
    prevProps.mesa.estado === nextProps.mesa.estado &&
    prevProps.mesa.ordenActiva?.total === nextProps.mesa.ordenActiva?.total
  );
});
