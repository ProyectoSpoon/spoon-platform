import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-lg transition-all duration-200',
  'placeholder:text-[color:var(--sp-on-surface-variant)]',
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
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-4 text-lg',
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

export interface InputV2Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  requiredMark?: boolean;
}

export const InputV2 = React.forwardRef<HTMLInputElement, InputV2Props>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      requiredMark,
      appearance,
      size,
      validation,
      disabled,
      readOnly,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id || autoId;

    const finalValidation: 'default' | 'error' | 'success' = errorMessage
      ? 'error'
      : validation || 'default';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[color:var(--sp-on-surface-variant)] mb-2">
            {label}
            {requiredMark && (
              <span className="text-[color:var(--sp-error)] ml-1" aria-label="requerido">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)] pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ appearance, size, validation: finalValidation }),
              {
                'pl-10': !!leftIcon,
                'pr-10': !!rightIcon || !!errorMessage,
                'cursor-not-allowed opacity-70': disabled,
                'cursor-default': readOnly,
                'focus:ring-0': readOnly,
              },
              className
            )}
            disabled={disabled}
            readOnly={readOnly}
            aria-required={props.required ? true : undefined}
            aria-invalid={!!errorMessage || undefined}
            aria-describedby={
              helperText || errorMessage ? `${inputId}-description` : undefined
            }
            {...props}
          />

          {rightIcon && !errorMessage && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)] pointer-events-none">
              {rightIcon}
            </div>
          )}

          {errorMessage && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-error)] pointer-events-none">
              {/* Simple error indicator */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
              </svg>
            </div>
          )}
        </div>

        {(helperText || errorMessage) && (
          <p
            id={`${inputId}-description`}
            className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-on-surface-variant)]')}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

InputV2.displayName = 'InputV2';

export { inputVariants as inputV2Variants };
