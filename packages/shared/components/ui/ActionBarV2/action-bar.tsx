import React from 'react';
import { cn } from '../../../lib/utils';

export type ActionColor = 'primary' | 'neutral' | 'danger' | 'success';

const colorToClasses: Record<ActionColor, string> = {
  primary: 'bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[color:var(--sp-on-primary)]',
  neutral: 'bg-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-900)]',
  danger: 'bg-[color:var(--sp-error-600)] hover:bg-[color:var(--sp-error-700)] text-[color:var(--sp-on-error)]',
  success: 'bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[color:var(--sp-on-success)]',
};

export interface ActionBarV2Props {
  className?: string;
  children?: React.ReactNode;
  primary?: {
    label: string;
    onClick: () => void;
    color?: ActionColor;
    disabled?: boolean;
    className?: string;
  };
  secondary?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
    disabled?: boolean;
    className?: string;
  };
}

export const ActionBarV2: React.FC<ActionBarV2Props> = ({ className, children, primary, secondary }) => {
  return (
  <div className={cn('p-4 border-t border-[color:var(--sp-border)] sticky bottom-0 bg-[color:var(--sp-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--sp-surface)]/80 z-10', className)}>
      {children && <div className="mb-3">{children}</div>}
      {(primary || secondary) && (
        <div className="flex gap-2">
          {secondary && (
      <button
              type="button"
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className={cn(
        'px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2',
                secondary.variant === 'outline'
                  ? 'bg-transparent border border-[color:var(--sp-border)] text-[color:var(--sp-neutral-800)] hover:bg-[color:var(--sp-neutral-50)]'
                  : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-900)] hover:bg-[color:var(--sp-neutral-200)]',
                secondary.className
              )}
            >
              {secondary.label}
            </button>
          )}
          {primary && (
            <button
              type="button"
              onClick={primary.onClick}
              disabled={primary.disabled}
              className={cn('flex-1 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-primary-600)] focus-visible:ring-offset-2', colorToClasses[primary.color || 'primary'], primary.className)}
            >
              {primary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionBarV2;
