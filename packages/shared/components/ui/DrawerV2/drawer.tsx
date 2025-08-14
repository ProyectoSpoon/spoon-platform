"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';
import { useScrollLock } from '../../../lib/useScrollLock';
import { useAriaHiddenOthers } from '../../../lib/useAriaHiddenOthers';

export interface DrawerV2Props {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: React.ReactNode;
  children?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widthMap: Record<NonNullable<DrawerV2Props['width']>, string> = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[32rem]'
};

export const DrawerV2: React.FC<DrawerV2Props> = ({ open, onClose, side = 'right', title, children, width = 'md' }) => {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocused = React.useRef<Element | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while drawer is open on client
  useScrollLock(open && mounted);
  // Hide background from assistive tech and make it inert
  useAriaHiddenOthers(panelRef as React.RefObject<HTMLElement>, open && mounted);

  React.useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      setTimeout(() => panelRef.current?.focus(), 0);
    } else if (previouslyFocused.current instanceof HTMLElement) {
      previouslyFocused.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      else if (e.key === 'Tab') {
        const root = panelRef.current; if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0]; const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (panelRef.current && !panelRef.current.contains(t)) onClose();
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('mousedown', onDown, true); };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[color:var(--sp-overlay)]" role="presentation" aria-hidden onClick={onClose} />
      <div className={cn('absolute inset-y-0 flex', side === 'right' ? 'right-0' : 'left-0')}>
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
      className={cn('h-full bg-[color:var(--sp-surface)] shadow-xl outline-none flex flex-col transition-transform duration-150 motion-safe:animate-[drawerIn_180ms_ease-out]', widthMap[width])}
        >
          {title ? (
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 id="drawer-title" className="text-base font-semibold text-[color:var(--sp-neutral-900)]">{title}</h3>
        <button onClick={onClose} aria-label="Cerrar" className="px-2 py-1 rounded bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)]">×</button>
            </div>
          ) : (
            <div className="flex justify-end border-b px-4 py-3">
        <button onClick={onClose} aria-label="Cerrar" className="px-2 py-1 rounded bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)]">×</button>
            </div>
          )}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DrawerV2;
