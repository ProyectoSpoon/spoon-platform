"use client";

import * as React from 'react';
import { cn } from '../../../lib/utils';

export interface EmptyStateV2Props extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  heading: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyStateV2({ icon, heading, description, action, className, ...props }: EmptyStateV2Props) {
  return (
    <div className={cn('text-center py-16 px-4', className)} {...props}>
      {icon && <div className="mx-auto mb-4 w-12 h-12 text-[color:var(--sp-neutral-400)]">{icon}</div>}
      <div className="text-[color:var(--sp-neutral-600)]">{heading}</div>
      {description && <div className="text-sm text-[color:var(--sp-neutral-500)] mt-1">{description}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyStateV2;
