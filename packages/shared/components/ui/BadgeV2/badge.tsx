import React from 'react';
import { cn } from '../../../lib/utils';

export type BadgeV2Variant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
export type BadgeV2Size = 'sm' | 'md';

const variantMap: Record<BadgeV2Variant, string> = {
  primary: 'bg-[color:var(--sp-primary)]/10 text-[color:var(--sp-primary)] border border-[color:var(--sp-primary)]/30',
  success: 'bg-[color:var(--sp-success)]/10 text-[color:var(--sp-success)] border border-[color:var(--sp-success)]/30',
  warning: 'bg-[color:var(--sp-warning)]/10 text-[color:var(--sp-warning)] border border-[color:var(--sp-warning)]/30',
  error: 'bg-[color:var(--sp-error)]/10 text-[color:var(--sp-error)] border border-[color:var(--sp-error)]/30',
  neutral: 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)] border border-[color:var(--sp-neutral-200)]',
  outline: 'bg-transparent text-[color:var(--sp-neutral-700)] border border-[color:var(--sp-neutral-300)]',
};

const sizeMap: Record<BadgeV2Size, string> = {
  sm: 'text-xs py-0.5 px-2 rounded',
  md: 'text-sm py-1 px-2.5 rounded-md',
};

export interface BadgeV2Props extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeV2Variant;
  size?: BadgeV2Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const BadgeV2 = React.forwardRef<HTMLSpanElement, BadgeV2Props>(
  ({ className, variant = 'neutral', size = 'md', leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('inline-flex items-center gap-1 font-medium', variantMap[variant], sizeMap[size], className)} {...props}>
        {leftIcon && <span aria-hidden className="-ml-0.5">{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden className="-mr-0.5">{rightIcon}</span>}
      </span>
    );
  }
);

BadgeV2.displayName = 'BadgeV2';

export default BadgeV2;
