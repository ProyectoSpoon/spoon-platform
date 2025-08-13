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
    <div className={cn('flex border-b border-gray-200 overflow-x-auto', className)}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap',
            activeId === it.id
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
