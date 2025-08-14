import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const selectVariants = cva(
  [
    'w-full rounded-lg transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:border-transparent',
  ],
  {
    variants: {
      appearance: {
        default: [
          'bg-[color:var(--sp-surface)] border border-[color:var(--sp-border)]',
          'hover:border-[color:var(--sp-neutral-300)]',
          'text-[color:var(--sp-neutral-800)]',
        ],
        filled: [
          'bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-border)]',
          'hover:border-[color:var(--sp-neutral-300)]',
          'text-[color:var(--sp-neutral-800)]',
        ],
        ghost: [
          'bg-transparent border border-transparent',
          'text-[color:var(--sp-neutral-800)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'h-12 px-4 py-2 text-lg',
      },
      validation: {
        default: '',
        error: 'border-[color:var(--sp-error)] focus:ring-[color:var(--sp-error)]',
        success: 'border-[color:var(--sp-success)] focus:ring-[color:var(--sp-success)]',
      },
    },
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      validation: 'default',
    },
  }
);

export interface SelectV2Props
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  requiredMark?: boolean;
  placeholder?: string;
}

export const SelectV2 = React.forwardRef<HTMLSelectElement, SelectV2Props>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      requiredMark,
      appearance,
      size,
      validation,
      disabled,
      id,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = id || autoId;

    const finalValidation: 'default' | 'error' | 'success' = errorMessage
      ? 'error'
      : (validation as any) || 'default';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
            {label}
            {requiredMark && (
              <span className="text-[color:var(--sp-error)] ml-1" aria-label="requerido">*</span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              selectVariants({ appearance, size, validation: finalValidation }),
              // Oculta la flecha nativa y deja espacio para el ícono custom
              'appearance-none pr-10',
              {
                'cursor-not-allowed opacity-70': disabled,
              },
              className
            )}
            disabled={disabled}
            aria-invalid={!!errorMessage || undefined}
            aria-required={props.required ? true : undefined}
            aria-describedby={
              helperText || errorMessage ? `${selectId}-description` : undefined
            }
            {...props}
          >
            {placeholder ? (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            ) : null}
            {children}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)]">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </span>
        </div>

        {(helperText || errorMessage) && (
          <p
            id={`${selectId}-description`}
            className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

SelectV2.displayName = 'SelectV2';

export { selectVariants as selectV2Variants };
