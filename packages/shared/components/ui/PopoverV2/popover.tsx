import React from 'react';
import { cn } from '../../../lib/utils';

export interface PopoverV2Props {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  /**
   * Si el contenido es interactivo (botones, inputs), usa dialog+focus trap ligero.
   * Si es puramente informativo, usa tooltip para mejor a11y semántico.
   */
  mode?: 'dialog' | 'tooltip';
}

export const PopoverV2: React.FC<PopoverV2Props> = ({ children, content, placement = 'bottom', className, mode = 'dialog' }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const toggle = () => setOpen(v => !v);
  const close = () => setOpen(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        (triggerRef.current as HTMLElement | null)?.focus();
      } else if (e.key === 'Tab') {
        const root = panelRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (panelRef.current && !panelRef.current.contains(t) && triggerRef.current && !triggerRef.current.contains(t)) {
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onDown, true);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = panelRef.current;
        // focus panel or first focusable
        const focusable = el?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (focusable || el)?.focus?.();
      }, 0);
    }
  }, [open]);

  const positions: Record<NonNullable<PopoverV2Props['placement']>, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <span className={cn('relative inline-block', className)}>
      {React.cloneElement(children as any, {
        ref: (node: HTMLElement) => { (triggerRef as any).current = node; const { ref } = children as any; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; },
        'aria-haspopup': mode === 'tooltip' ? 'tooltip' : 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
        onClick: (e: React.MouseEvent) => { (children as any).props.onClick?.(e); toggle(); }
      })}
      {open && (
        <div
          role={mode === 'tooltip' ? 'tooltip' : 'dialog'}
          id={id}
          aria-modal={mode === 'dialog' ? false : undefined}
          ref={panelRef}
          tabIndex={-1}
          className={cn('absolute z-50 min-w-[12rem] rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] p-3 shadow-md outline-none', positions[placement])}
        >
          {content}
        </div>
      )}
    </span>
  );
};

export default PopoverV2;
