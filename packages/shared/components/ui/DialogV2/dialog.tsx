"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';
import { useScrollLock } from '../../../lib/useScrollLock';
import { useAriaHiddenOthers } from '../../../lib/useAriaHiddenOthers';

export interface DialogV2Props {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const DialogV2: React.FC<DialogV2Props> = ({ open, onClose, title, description, children, size = 'md' }) => {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocused = React.useRef<Element | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // SSR-safe mount flag
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while dialog is open on client
  useScrollLock(open && mounted);
  // Hide background from assistive tech and make it inert
  useAriaHiddenOthers(dialogRef as React.RefObject<HTMLElement>, open && mounted);

  React.useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      // Defer focus to ensure element is in DOM
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 0);
    } else if (previouslyFocused.current instanceof HTMLElement) {
      previouslyFocused.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        // Basic focus trap inside dialog
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[color:var(--sp-overlay)] transition-opacity duration-150" aria-hidden role="presentation" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-desc' : undefined}
          className={cn('w-full rounded-lg bg-[color:var(--sp-surface)] shadow-xl outline-none transition-transform duration-150 motion-safe:animate-[dialogIn_150ms_ease-out] border border-[color:var(--sp-border)]', sizeMap[size])}
          ref={dialogRef}
          tabIndex={-1}
        >
          {title && (
            <div className="px-6 py-4 border-b border-[color:var(--sp-border)] flex items-center justify-between">
              <h3 id="dialog-title" className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar diálogo"
                className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-[color:var(--sp-neutral-600)] hover:bg-[color:var(--sp-neutral-50)] hover:text-[color:var(--sp-neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2"
              >
                ✕
              </button>
            </div>
          )}
          {description && <div className="px-6 pt-3 text-[color:var(--sp-neutral-700)]" id="dialog-desc">{description}</div>}
          <div className="px-6 py-4">{children}</div>
          <div className="px-6 py-3 border-t border-[color:var(--sp-border)] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DialogV2;
