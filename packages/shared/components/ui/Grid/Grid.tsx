// shared/components/ui/Grid/Grid.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: string;
  gapX?: string;
  gapY?: string;
}

/**
 * Grid responsivo reutilizable para tarjetas y layouts.
 * Ejemplo de uso:
 * <Grid cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" gapX="gap-x-8" gapY="gap-y-8">...</Grid>
 */
export const Grid: React.FC<GridProps> = ({
  children,
  className = '',
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  gapX = 'gap-x-8',
  gapY = 'gap-y-8',
}) => (
  <div className={cn('grid', cols, gapX, gapY, className)}>
    {children}
  </div>
);
