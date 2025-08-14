// packages/shared/components/ui/Card/card-description.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p
  className={cn("text-[13px] text-[color:var(--sp-neutral-600)]", className)}
      {...props}
    >
      {children}
    </p>
  );
}
