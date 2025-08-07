// packages/shared/components/ui/Card/card-title.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
  className,
  children,
  as: Component = 'h3',
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn("text-xl font-bold text-gray-900", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
