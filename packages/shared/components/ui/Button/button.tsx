// packages/shared/components/ui/Button/button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-[14px] font-medium transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)] active:bg-[color:var(--sp-primary-800)]",
        destructive: "bg-[color:var(--sp-error-600)] text-[color:var(--sp-on-error)] hover:bg-[color:var(--sp-error-700)] active:bg-[color:var(--sp-error-800)]",
        outline: "border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] hover:bg-[color:var(--sp-neutral-50)] active:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-on-surface)]",
        secondary: "bg-[color:var(--sp-success-600)] text-[color:var(--sp-on-success)] hover:bg-[color:var(--sp-success-700)] active:bg-[color:var(--sp-success-800)]",
        ghost: "bg-transparent hover:bg-[color:var(--sp-neutral-50)] active:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-on-surface)]",
        link: "text-[color:var(--sp-primary-600)] underline-offset-4 hover:underline bg-transparent",
        purple: "bg-[color:var(--sp-info-600)] text-[color:var(--sp-on-info)] hover:bg-[color:var(--sp-info-700)] active:bg-[color:var(--sp-info-800)]",
        blue: "bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)] active:bg-[color:var(--sp-primary-800)]",
        green: "bg-[color:var(--sp-success-600)] text-[color:var(--sp-on-success)] hover:bg-[color:var(--sp-success-700)] active:bg-[color:var(--sp-success-800)]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 text-[14px]",
        lg: "h-11 px-5 text-[14px] font-semibold",
        icon: "h-10 w-10",
        full: "h-11 px-5 text-[14px] font-semibold w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
