// packages/shared/components/ui/Card/card.tsx
import React from 'react';
import { cn } from '../../../lib/utils';
import { CardProps } from './types';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', withHover = false, bordered = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-white text-gray-950",
        {
          'border border-gray-100': bordered,
          'shadow-sm': variant === 'default',
          'shadow-sm hover:shadow-lg transition-shadow duration-200': withHover || variant === 'hover',
          'shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden': variant === 'menu',
          'border-l-4 border-l-orange-500': variant === 'accent',
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
