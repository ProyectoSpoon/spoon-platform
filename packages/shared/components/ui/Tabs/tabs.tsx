import React from 'react';
import { cn } from '../../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className }) => {
  return (
  <div className={cn('flex border-b border-[color:var(--sp-border)] overflow-x-auto', className)}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap',
      activeId === it.id
    ? 'border-[color:var(--sp-primary-600)] text-[color:var(--sp-primary-600)]'
    : 'border-transparent text-[color:var(--sp-neutral-500)] hover:text-[color:var(--sp-neutral-700)] hover:border-[color:var(--sp-neutral-300)]'
          )}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
