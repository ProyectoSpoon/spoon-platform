import React, { useId } from 'react';
import { cn } from '../../../lib/utils';

export interface TabV2Item {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsV2Props {
  items: TabV2Item[];
  activeId: string;
  onChange: (id: string) => void;
  fitted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const sizeMap = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
};

export const TabsV2: React.FC<TabsV2Props> = ({
  items,
  activeId,
  onChange,
  className,
  fitted = false,
  size = 'md',
}) => {
  const tabsId = useId();
  return (
  <div className={cn('w-full', className)}>
      <div role="tablist" aria-orientation="horizontal" className="flex border-b border-[color:var(--sp-neutral-200)] overflow-x-auto">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              role="tab"
              aria-selected={active}
              aria-controls={`${tabsId}-${it.id}-panel`}
              id={`${tabsId}-${it.id}-tab`}
              disabled={it.disabled}
              onClick={() => !it.disabled && onChange(it.id)}
              className={cn(
                'relative whitespace-nowrap font-medium border-b-2',
                sizeMap[size],
                fitted ? 'flex-1 text-center' : '',
                it.disabled && 'opacity-50 cursor-not-allowed',
                active
                  ? 'border-[color:var(--sp-primary-600)] text-[color:var(--sp-primary-700)]'
                  : 'border-transparent text-[color:var(--sp-neutral-600)] hover:text-[color:var(--sp-neutral-800)] hover:border-[color:var(--sp-neutral-300)]'
              )}
            >
              {it.icon}
              <span className={cn(it.icon ? 'ml-2' : '')}>{it.label}</span>
            </button>
          );
        })}
      </div>
      {/* Panels quedan a cargo del consumidor; este componente sólo gestiona la barra de tabs */}
    </div>
  );
};

export default TabsV2;
