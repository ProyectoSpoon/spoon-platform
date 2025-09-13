import React from 'react';
import { cn } from '../../../lib/utils';

export interface TooltipV2Props {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const TooltipV2: React.FC<TooltipV2Props> = ({ content, children, placement = 'top' }) => {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const positions: Record<typeof placement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  } as const;

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.cloneElement(children as any, {
        'aria-describedby': open ? id : undefined
      })}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] px-2 py-1 text-xs text-[color:var(--sp-on-surface)] shadow-md',
            positions[placement]
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default TooltipV2;
