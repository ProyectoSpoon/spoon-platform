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
      default: 'border border-[#e2e8f0] bg-white',
      outline: 'border-2 border-[#e2e8f0] bg-transparent',
      filled: 'border border-[#e2e8f0] bg-[#f8fafc]',
      readOnly: 'border border-[#e2e8f0] bg-gray-50 text-gray-700'
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-md transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent",
              "placeholder:text-[#94a3b8] text-[#1e293b]",
              sizeClasses[size],
              variantClasses[variant],
              {
                'border-red-500 focus:ring-red-500': error,
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={cn(
            "mt-2 text-[12px]",
            error ? "text-red-600" : "text-[#94a3b8]"
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