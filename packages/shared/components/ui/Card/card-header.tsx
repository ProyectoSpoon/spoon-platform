// packages/shared/components/ui/Card/card-header.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
