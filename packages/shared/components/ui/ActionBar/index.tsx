import React from 'react';

export interface ActionBarProps {
  primary?: {
    label: string;
    onClick: () => void;
  color?: 'blue' | 'purple' | 'yellow' | 'emerald' | 'red' | 'indigo' | 'orange' | 'slate' | 'amber';
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
  children?: React.ReactNode;
  className?: string;
}

type ActionBarColor = NonNullable<NonNullable<ActionBarProps['primary']>['color']>;

// Mapeo de colores legacy a tokens semánticos
const colorToClasses: Record<ActionBarColor, string> = {
  blue: 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)]',
  purple: 'bg-[color:var(--sp-info-600)] text-[color:var(--sp-on-info)] hover:bg-[color:var(--sp-info-700)]',
  yellow: 'bg-[color:var(--sp-warning-500)] text-[color:var(--sp-on-warning)] hover:bg-[color:var(--sp-warning-600)]',
  emerald: 'bg-[color:var(--sp-success-600)] text-[color:var(--sp-on-success)] hover:bg-[color:var(--sp-success-700)]',
  red: 'bg-[color:var(--sp-error-600)] text-[color:var(--sp-on-error)] hover:bg-[color:var(--sp-error-700)]',
  indigo: 'bg-[color:var(--sp-primary-700)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-800)]',
  orange: 'bg-[color:var(--sp-warning-600)] text-[color:var(--sp-on-warning)] hover:bg-[color:var(--sp-warning-700)]',
  slate: 'bg-[color:var(--sp-neutral-700)] text-[color:var(--sp-on-surface-inverted)] hover:bg-[color:var(--sp-neutral-800)]',
  amber: 'bg-[color:var(--sp-warning-500)] text-[color:var(--sp-on-warning)] hover:bg-[color:var(--sp-warning-600)]',
};

export const ActionBar: React.FC<ActionBarProps> = ({ primary, secondary, children, className }) => {
  return (
  <div className={`p-4 border-t border-[color:var(--sp-border)] sticky bottom-0 bg-[color:var(--sp-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--sp-surface)]/80 z-10 ${className || ''}`}>
      {children && <div className="mb-3">{children}</div>}
  {(primary || secondary) && (
    <div className="grid grid-cols-2 items-center gap-2 w-full">
          {secondary && (
            <button
              onClick={secondary.onClick}
              disabled={secondary.disabled}
      className={`justify-self-start min-w-[120px] px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${secondary.variant === 'outline' ? 'bg-[color:var(--sp-surface)] border border-[color:var(--sp-border)] text-[color:var(--sp-on-surface)] hover:bg-[color:var(--sp-neutral-50)]' : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-on-surface)] hover:bg-[color:var(--sp-neutral-200)]'} ${secondary.className || ''}`}
            >
              {secondary.label}
            </button>
          )}
          {primary && (
            <button
              onClick={primary.onClick}
              disabled={primary.disabled}
      className={`justify-self-end min-w-[120px] px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorToClasses[primary.color || 'blue']} ${primary.className || ''}`}
            >
              {primary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionBar;
