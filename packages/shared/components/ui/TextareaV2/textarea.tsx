import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const textareaVariants = cva(
  [
    'w-full rounded-lg transition-all duration-200',
    'placeholder:text-[color:var(--sp-neutral-400)]',
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
        sm: 'text-sm p-3',
        md: 'text-base p-4',
        lg: 'text-lg p-4',
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

export interface TextareaV2Props
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  requiredMark?: boolean;
  rows?: number;
}

export const TextareaV2 = React.forwardRef<HTMLTextAreaElement, TextareaV2Props>(
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
      rows = 4,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const areaId = id || autoId;

    const finalValidation: 'default' | 'error' | 'success' = errorMessage
      ? 'error'
      : (validation as any) || 'default';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
            {label}
            {requiredMark && (
              <span className="text-[color:var(--sp-error)] ml-1" aria-label="requerido">*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          className={cn(
            textareaVariants({ appearance, size, validation: finalValidation }),
            {
              'cursor-not-allowed opacity-70': disabled,
            },
            className
          )}
          disabled={disabled}
          aria-required={props.required ? true : undefined}
          aria-invalid={!!errorMessage || undefined}
          aria-describedby={
            helperText || errorMessage ? `${areaId}-description` : undefined
          }
          {...props}
        />

        {(helperText || errorMessage) && (
          <p
            id={`${areaId}-description`}
            className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextareaV2.displayName = 'TextareaV2';

export { textareaVariants as textareaV2Variants };
