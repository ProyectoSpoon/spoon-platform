import React from 'react';
import { cn } from '../../../lib/utils';

export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface MenuV2Props {
  items: MenuItem[];
  buttonLabel?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

export const MenuV2: React.FC<MenuV2Props> = ({ items, buttonLabel = 'Abrir menú', placement = 'bottom-start', className }) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const id = React.useId();
  const typeaheadRef = React.useRef<string>('');
  const typeaheadTimer = React.useRef<number | null>(null);

  const focusItem = (index: number) => {
    setActiveIndex(index);
    const el = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[index];
    el?.focus();
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) buttonRef.current?.focus();
  };

  // openAndFocus no usado actualmente

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) e.preventDefault();
  const _enabledItems = items.filter(i => !i.disabled);
      switch (e.key) {
        case 'ArrowDown': {
          const next = findNextEnabledIndex(items, activeIndex, +1);
          if (next !== -1) focusItem(next);
          break;
        }
        case 'ArrowUp': {
          const prev = findNextEnabledIndex(items, activeIndex, -1);
          if (prev !== -1) focusItem(prev);
          break;
        }
        case 'Home': {
          const first = findNextEnabledIndex(items, -1, +1);
          if (first !== -1) focusItem(first);
          break;
        }
        case 'End': {
          const last = findNextEnabledIndex(items, items.length, -1);
          if (last !== -1) focusItem(last);
          break;
        }
        default: {
          if (e.key.length === 1 && /[^\s]/.test(e.key)) {
            // typeahead
            typeaheadRef.current += e.key.toLowerCase();
            if (typeaheadTimer.current) window.clearTimeout(typeaheadTimer.current);
            typeaheadTimer.current = window.setTimeout(() => { typeaheadRef.current = ''; }, 500);
            const idx = items.findIndex(i => !i.disabled && i.label.toLowerCase().startsWith(typeaheadRef.current));
            if (idx !== -1) focusItem(idx);
          }
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (menuRef.current && !menuRef.current.contains(t) && buttonRef.current && !buttonRef.current.contains(t)) {
        close(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick, true);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick, true); };
  }, [open, activeIndex, items]);

  const positions: Record<NonNullable<MenuV2Props['placement']>, string> = {
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2'
  };

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setTimeout(() => focusItem(findNextEnabledIndex(items, -1, +1)), 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setTimeout(() => focusItem(findNextEnabledIndex(items, items.length, -1)), 0); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
  };

  const onItemClick = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    item.onSelect?.();
    close(true);
  };

  return (
    <div className={cn('relative inline-block', className)}>
  <button
        ref={buttonRef}
        id={`menu-btn-${id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `menu-${id}` : undefined}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onButtonKeyDown}
  className="px-3 py-2 rounded bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]"
      >
        {buttonLabel}
      </button>

      {open && (
  <ul
          ref={menuRef}
          id={`menu-${id}`}
          role="menu"
          aria-labelledby={`menu-btn-${id}`}
      className={cn('absolute z-50 min-w-40 rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] py-1 shadow-md outline-none', positions[placement])}
        >
          {items.map((item, i) => (
            <li key={item.id} role="none">
              <button
                role="menuitem"
                tabIndex={i === activeIndex ? 0 : -1}
                disabled={item.disabled}
                onClick={() => onItemClick(i)}
        className={cn('w-full text-left px-3 py-2 text-sm', item.disabled ? 'text-[color:var(--sp-neutral-400)] cursor-not-allowed' : 'hover:bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-on-surface)]', i === activeIndex && 'bg-[color:var(--sp-neutral-50)]')}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function findNextEnabledIndex(items: MenuItem[], start: number, step: 1 | -1): number {
  for (let i = start + step; i >= 0 && i < items.length; i += step) {
    if (!items[i].disabled) return i;
  }
  return -1;
}

export default MenuV2;
