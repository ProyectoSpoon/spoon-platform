import React from 'react';
import { cn } from '../../../lib/utils';

export type RadioV2Size = 'sm' | 'md' | 'lg';

export interface RadioV2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  size?: RadioV2Size;
}

const sizeMap: Record<RadioV2Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const RadioV2 = React.forwardRef<HTMLInputElement, RadioV2Props>(
  ({ id, className, label, size = 'md', disabled, ...props }, ref) => {
    return (
      <label htmlFor={id} className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'cursor-not-allowed opacity-70', className)}>
        <span className="relative inline-flex items-center">
          <input
            ref={ref}
            id={id}
            type="radio"
            className={cn(
              'peer appearance-none rounded-full border bg-[color:var(--sp-surface)] transition-colors duration-150',
              'border-[color:var(--sp-border)] hover:border-[color:var(--sp-neutral-400)]',
              'focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:border-transparent',
              sizeMap[size]
            )}
            disabled={disabled}
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              'absolute inset-1 rounded-full bg-[color:var(--sp-primary-500)] opacity-0 scale-0 transition-all duration-150',
              'peer-checked:opacity-100 peer-checked:scale-100'
            )}
          />
        </span>
        {label && <span className="text-sm text-[color:var(--sp-neutral-800)]">{label}</span>}
      </label>
    );
  }
);

RadioV2.displayName = 'RadioV2';

export default RadioV2;
