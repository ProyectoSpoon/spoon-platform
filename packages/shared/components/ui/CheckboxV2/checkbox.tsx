import React from 'react';
import { cn } from '../../../lib/utils';

export type CheckboxV2Size = 'sm' | 'md' | 'lg';

export interface CheckboxV2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  size?: CheckboxV2Size;
  requiredMark?: boolean;
}

const sizeMap: Record<CheckboxV2Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const CheckboxV2 = React.forwardRef<HTMLInputElement, CheckboxV2Props>(
  (
    { id, className, label, helperText, errorMessage, size = 'md', disabled, requiredMark, ...props },
    ref
  ) => {
    const descriptionId = helperText || errorMessage ? `${id || 'checkbox'}-description` : undefined;
    return (
      <div className={cn('w-full', className)}>
        <label htmlFor={id} className={cn('flex items-start gap-3 cursor-pointer', disabled && 'cursor-not-allowed opacity-70')}>
          <span className="relative inline-flex items-center">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className={cn(
                'peer appearance-none rounded border bg-[color:var(--sp-surface)] transition-colors duration-150',
                'border-[color:var(--sp-border)] hover:border-[color:var(--sp-neutral-400)]',
                'focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:border-transparent',
                sizeMap[size],
                disabled && 'bg-[color:var(--sp-neutral-50)]',
              )}
              aria-invalid={!!errorMessage || undefined}
              aria-describedby={descriptionId}
              disabled={disabled}
              {...props}
            />
            <svg
              className={cn(
                'pointer-events-none absolute inset-0 m-auto text-[color:var(--sp-on-primary)] opacity-0 scale-75 transition-all duration-150',
                'peer-checked:opacity-100 peer-checked:scale-100'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {/* Checked state background via pseudo element using ring not possible; leverage peer classes with a wrapper */}
            <span
              aria-hidden
              className={cn(
                'absolute inset-0 rounded',
                'peer-checked:bg-[color:var(--sp-primary-500)] peer-checked:border-[color:var(--sp-primary-500)]'
              )}
            />
          </span>
          {label && (
            <span className="select-none text-sm text-[color:var(--sp-neutral-800)]">
              {label}
              {requiredMark && <span className="text-[color:var(--sp-error)] ml-1">*</span>}
            </span>
          )}
        </label>
        {(helperText || errorMessage) && (
          <p
            id={descriptionId}
            className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

CheckboxV2.displayName = 'CheckboxV2';

export default CheckboxV2;
