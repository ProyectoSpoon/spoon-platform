import React, { useId } from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled' | 'readOnly';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    error = false,
    helperText,
    leftIcon,
    rightIcon,
    label,
    size = 'md',
    variant = 'default',
    disabled,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;

    const sizeClasses = {
      sm: 'h-9 px-3 text-[14px]',
      md: 'h-10 px-4 text-[14px]',
      lg: 'h-11 px-4 text-[14px]'
    };

    const variantClasses: Record<NonNullable<InputProps['variant']>, string> = {
      default: 'border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)]',
      outline: 'border-2 border-[color:var(--sp-border)] bg-transparent',
      filled: 'border border-[color:var(--sp-border)] bg-[color:var(--sp-neutral-50)]',
      readOnly: 'border border-[color:var(--sp-border)] bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-on-surface)]'
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[color:var(--sp-on-surface-variant)] mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)]">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-md transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:border-transparent",
              "placeholder:text-[color:var(--sp-on-surface-variant)] text-[color:var(--sp-on-surface)]",
              sizeClasses[size],
              variantClasses[variant],
              {
                'border-[color:var(--sp-error)] focus:ring-[color:var(--sp-error)]': error,
                'pl-10': leftIcon,
                'pr-10': rightIcon,
                // Non-editable visual state (disabled or readOnly variant)
                'cursor-default': disabled || variant === 'readOnly',
                'focus:ring-0': disabled || variant === 'readOnly',
              },
              className
            )}
            ref={ref}
            disabled={disabled}
            readOnly={variant === 'readOnly' ? true : props.readOnly}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)]">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={cn(
            "mt-2 text-[12px]",
            error ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-on-surface-variant)]'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };