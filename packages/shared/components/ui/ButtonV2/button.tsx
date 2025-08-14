import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-lg',
    'font-medium transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'relative',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[color:var(--sp-primary-500)] text-[color:var(--sp-on-primary)]',
          'hover:bg-[color:var(--sp-primary-600)] active:bg-[color:var(--sp-primary-700)]',
          'border border-[color:var(--sp-primary-500)]',
        ],
        secondary: [
          'bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)]',
          'hover:bg-[color:var(--sp-neutral-100)] active:bg-[color:var(--sp-neutral-200)]',
          'border border-[color:var(--sp-border)]',
        ],
        outline: [
          'bg-transparent text-[color:var(--sp-primary-600)]',
          'hover:bg-[color:var(--sp-primary-50)] active:bg-[color:var(--sp-primary-100)]',
          'border border-[color:var(--sp-primary-300)]',
        ],
        ghost: [
          'bg-transparent text-[color:var(--sp-neutral-700)]',
          'hover:bg-[color:var(--sp-neutral-100)] active:bg-[color:var(--sp-neutral-200)]',
          'border border-transparent',
        ],
        destructive: [
          'bg-[color:var(--sp-error)] text-[color:var(--sp-on-error)]',
          'hover:opacity-90 active:opacity-80',
          'border border-[color:var(--sp-error)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-2',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-3',
        icon: 'h-10 w-10',
      },
      state: {
        default: '',
        loading: 'cursor-wait',
        disabled: 'cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      state: 'default',
    },
  }
);

export interface ButtonV2Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonV2Props>(
  (
    {
      className,
      variant,
      size,
      children,
      loading = false,
      loadingText = 'Cargando...',
      leftIcon,
      rightIcon,
      disabled,
      state,
      ...props
    },
    ref
  ) => {
    const finalState = loading ? 'loading' : disabled ? 'disabled' : state;
    return (
      <button
        className={cn(buttonVariants({ variant, size, state: finalState }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{loadingText}</span>
          </span>
        ) : (
          <>
            {leftIcon ? <span className="mr-2" aria-hidden>{leftIcon}</span> : null}
            <span>{children}</span>
            {rightIcon ? <span className="ml-2" aria-hidden>{rightIcon}</span> : null}
          </>
        )}
      </button>
    );
  }
);

ButtonV2.displayName = 'ButtonV2';

export { buttonVariants as buttonV2Variants };
