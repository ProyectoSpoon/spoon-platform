import React from 'react';
import { cn } from '../../../lib/utils';

export type ProgressV2Size = 'sm' | 'md' | 'lg';
export type ProgressV2Variant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

export interface ProgressV2Props extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: ProgressV2Size;
  variant?: ProgressV2Variant;
  label?: string;
  showPercentage?: boolean;
  'aria-label'?: string;
}

const sizeMap: Record<ProgressV2Size, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const trackColor = 'bg-[color:var(--sp-neutral-200)]';
const variantColor: Record<ProgressV2Variant, string> = {
  primary: 'bg-[color:var(--sp-primary-500)]',
  success: 'bg-[color:var(--sp-success)]',
  warning: 'bg-[color:var(--sp-warning)]',
  error: 'bg-[color:var(--sp-error)]',
  neutral: 'bg-[color:var(--sp-neutral-500)]',
};

export const ProgressV2 = React.forwardRef<HTMLDivElement, ProgressV2Props>(
  (
    { className, value, max = 100, size = 'md', variant = 'primary', label, showPercentage = true, ...props },
    ref
  ) => {
    const clampedValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;
    const pct = Number.isFinite(max) && max > 0 ? (clampedValue / max) * 100 : 0;
    const pctRounded = Math.round(Math.min(Math.max(pct, 0), 100));

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-[color:var(--sp-neutral-700)]">{label}</span>
            )}
            {showPercentage && (
              <span className="text-sm font-semibold text-[color:var(--sp-neutral-700)]">{pctRounded}%</span>
            )}
          </div>
        )}

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.round(clampedValue)}
          aria-valuetext={`${pctRounded}%`}
          className={cn('w-full rounded-full overflow-hidden', sizeMap[size], trackColor)}
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-300 ease-out', variantColor[variant])}
            style={{ width: `${pctRounded}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressV2.displayName = 'ProgressV2';

export default ProgressV2;
