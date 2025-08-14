import React from 'react';
import { cn } from '../../../lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbV2Props {
  items: Crumb[];
  separator?: React.ReactNode;
  className?: string;
}

export const BreadcrumbV2: React.FC<BreadcrumbV2Props> = ({ items, separator = '/', className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-[color:var(--sp-neutral-600)]', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {item.href ? (
              <a href={item.href} className="text-[color:var(--sp-primary-700)] hover:underline">{item.label}</a>
            ) : (
              <span aria-current="page" className="text-[color:var(--sp-neutral-900)]">{item.label}</span>
            )}
            {idx < items.length - 1 && <span aria-hidden>{separator}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbV2;
