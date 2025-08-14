import React from 'react';
import { cn } from '../../../lib/utils';

export interface SkeletonV2Props {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  variant?: 'rect' | 'text' | 'circle';
  width?: number | string;
  height?: number | string;
}

const radius: Record<NonNullable<SkeletonV2Props['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const SkeletonV2: React.FC<SkeletonV2Props> = ({
  className,
  rounded = 'md',
  variant = 'rect',
  width,
  height,
}) => {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  const variantCls =
    variant === 'text' ? 'h-4' : variant === 'circle' ? 'aspect-square' : '';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      className={cn(
        'relative overflow-hidden bg-[color:var(--sp-neutral-100)]',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-[color:var(--sp-neutral-200)] before:to-transparent',
        'before:animate-[skeleton_1.2s_ease-in-out_infinite]',
        radius[rounded],
        variantCls,
        className
      )}
      style={style}
    >
      <span className="sr-only">Cargando…</span>
    </div>
  );
};

export default SkeletonV2;
