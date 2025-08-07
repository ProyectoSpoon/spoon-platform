// packages/shared/components/ui/Card/card-content.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div 
      className={cn("p-6 pt-0", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
