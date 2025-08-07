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
      default: 'bg-orange-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    
    const textColor = {
      default: 'text-orange-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };

    return (
      <div className="w-full" ref={ref} {...props}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-gray-700">{label}</span>
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
            "w-full bg-gray-200 rounded-full overflow-hidden",
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
