// packages/shared/components/ui/Card/card.tsx
import React from 'react';
import { cn } from '../../../lib/utils';
import { CardProps } from './types';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', withHover = false, bordered = true, ...props }, ref) => (
  <div
      ref={ref}
  className={cn(
    // Base card per design system
  "rounded-lg bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]",
        // Optional subtle hover only when requested
        withHover && "transition-colors duration-200 hover:shadow-md",
        // Metric variants with left accent
  variant === 'accent' && 'border-l-4 border-l-[color:var(--sp-primary-600)]',
    bordered ? 'border border-[color:var(--sp-border)]' : 'border-0',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
