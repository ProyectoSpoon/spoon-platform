import React from 'react';
import { cn } from '../../../lib/utils';

export type AlertV2Variant = 'info' | 'success' | 'warning' | 'error';

const variants: Record<AlertV2Variant, { container: string; icon: string }> = {
  info: { container: 'bg-[color:var(--sp-info)]/10 border-l-4 border-[color:var(--sp-info)]/40 text-[color:var(--sp-info)]', icon: 'text-[color:var(--sp-info)]' },
  success: { container: 'bg-[color:var(--sp-success)]/10 border-l-4 border-[color:var(--sp-success)]/40 text-[color:var(--sp-success)]', icon: 'text-[color:var(--sp-success)]' },
  warning: { container: 'bg-[color:var(--sp-warning)]/10 border-l-4 border-[color:var(--sp-warning)]/40 text-[color:var(--sp-warning)]', icon: 'text-[color:var(--sp-warning)]' },
  error: { container: 'bg-[color:var(--sp-error)]/10 border-l-4 border-[color:var(--sp-error)]/40 text-[color:var(--sp-error)]', icon: 'text-[color:var(--sp-error)]' },
};

export interface AlertV2Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertV2Variant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const AlertV2 = React.forwardRef<HTMLDivElement, AlertV2Props>(
  ({ className, variant = 'info', title, description, icon, action, children, ...props }, ref) => {
    const v = variants[variant];
    return (
      <div ref={ref} role="alert" className={cn('p-4 rounded-md flex items-start gap-3', v.container, className)} {...props}>
        <div className={cn('mt-0.5', v.icon)} aria-hidden>
          {icon ?? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {description && <p className="text-sm">{description}</p>}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }
);

AlertV2.displayName = 'AlertV2';

export default AlertV2;
