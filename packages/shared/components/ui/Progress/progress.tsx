// packages/shared/components/ui/Progress/progress.tsx
import React from 'react';
import { cn } from '../../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = 'md', 
    variant = 'default',
    showPercentage = true,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    
    const variantClasses = {
      default: 'bg-[color:var(--sp-primary-600)]',
      success: 'bg-[color:var(--sp-success)]',
      warning: 'bg-[color:var(--sp-warning)]',
      error: 'bg-[color:var(--sp-error)]'
    };
    
    const textColor = {
      default: 'text-[color:var(--sp-primary)]',
      success: 'text-[color:var(--sp-success)]',
      warning: 'text-[color:var(--sp-warning)]',
      error: 'text-[color:var(--sp-error)]'
    };

    return (
      <div className="w-full" ref={ref} {...props}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-[color:var(--sp-neutral-700)]">{label}</span>
            )}
            {showPercentage && (
              <span className={cn("text-sm font-bold", textColor[variant])}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
    <div 
          className={cn(
      "w-full bg-[color:var(--sp-neutral-200)] rounded-full overflow-hidden",
            sizeClasses[size],
            className
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
