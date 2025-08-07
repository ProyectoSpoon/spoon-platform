import React, { useId } from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
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
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-base'
    };

    const variantClasses = {
      default: 'border border-gray-300 bg-white',
      outline: 'border-2 border-gray-300 bg-transparent',
      filled: 'border-0 bg-gray-100'
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
              "w-full rounded-lg transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
              "placeholder:text-gray-400",
              sizeClasses[size],
              variantClasses[variant],
              {
                'border-red-500 focus:ring-red-500': error,
                'pl-10': leftIcon,
                'pr-10': rightIcon,
                'opacity-60 cursor-not-allowed': disabled,
              },
              className
            )}
            ref={ref}
            disabled={disabled}
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
            "mt-2 text-xs",
            error ? "text-red-600" : "text-gray-500"
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