"use client";

import * as React from 'react';
import { cn } from '../../../lib/utils';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error';
type Size = 'md' | 'lg';

export interface MetricCardV2Props extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label?: React.ReactNode;
  trend?: React.ReactNode;
  tone?: Tone;
  size?: Size;
}

const toneBg: Record<Tone, string> = {
  neutral: 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]',
  info: 'bg-[color:var(--sp-info-100)] text-[color:var(--sp-info-700)]',
  success: 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-700)]',
  warning: 'bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]',
  error: 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-700)]',
};

export function MetricCardV2({
  icon,
  value,
  label,
  trend,
  tone = 'neutral',
  size = 'md',
  className,
  ...props
}: MetricCardV2Props) {
  const valueClass = size === 'lg' ? 'text-[2rem]' : 'text-xl';

  return (
    <div
      className={cn(
        'bg-[color:var(--sp-surface-elevated)] p-6 rounded-lg shadow-sm border border-[color:var(--sp-border)] min-h-[120px]',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn('p-2 rounded-lg', toneBg[tone])}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn('font-semibold leading-tight mb-2', valueClass)}>{value}</div>
          {label && (
            <div className="text-sm text-[color:var(--sp-neutral-600)] truncate">{label}</div>
          )}
          {trend && (
            <div className="mt-2 text-xs text-[color:var(--sp-neutral-500)]">{trend}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetricCardV2;
