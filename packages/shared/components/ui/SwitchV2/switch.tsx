import React from 'react';
import { cn } from '../../../lib/utils';

export type SwitchV2Size = 'sm' | 'md' | 'lg';

export interface SwitchV2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  size?: SwitchV2Size;
}

const sizeMap: Record<SwitchV2Size, { track: string; thumb: string; translate: string }> = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
};

export const SwitchV2 = React.forwardRef<HTMLInputElement, SwitchV2Props>(
  ({ id, className, label, size = 'md', disabled, checked, ...props }, ref) => {
    const { track, thumb, translate } = sizeMap[size];
    return (
      <label htmlFor={id} className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'cursor-not-allowed opacity-70', className)}>
        <span className={cn('relative inline-flex items-center rounded-full transition-colors duration-200', track, checked ? 'bg-[color:var(--sp-primary-500)]' : 'bg-[color:var(--sp-neutral-300)]')}>
          <input ref={ref} id={id} type="checkbox" className="sr-only" checked={checked} disabled={disabled} {...props} />
          <span className={cn('absolute left-1 top-1 rounded-full bg-[color:var(--sp-surface)] transition-transform duration-200', thumb, checked ? translate : 'translate-x-0')} />
        </span>
        {label && <span className="text-sm text-[color:var(--sp-neutral-800)]">{label}</span>}
      </label>
    );
  }
);

SwitchV2.displayName = 'SwitchV2';

export default SwitchV2;
