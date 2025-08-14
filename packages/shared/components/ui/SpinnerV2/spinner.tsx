import React from 'react';
import { cn } from '../../../lib/utils';

export type SpinnerV2Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<SpinnerV2Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export interface SpinnerV2Props extends React.HTMLAttributes<SVGElement> {
  size?: SpinnerV2Size;
}

export const SpinnerV2 = React.forwardRef<SVGSVGElement, SpinnerV2Props>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <svg ref={ref} className={cn('animate-spin text-[color:var(--sp-primary-500)]', sizeMap[size], className)} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    );
  }
);

SpinnerV2.displayName = 'SpinnerV2';

export default SpinnerV2;
