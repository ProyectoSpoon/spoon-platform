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
      className={cn("flex flex-col space-y-2 p-4 pb-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
