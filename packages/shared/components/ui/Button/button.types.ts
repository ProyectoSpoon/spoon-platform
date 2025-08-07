// packages/shared/components/ui/Button/button.types.ts
import { ReactNode } from 'react';

export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link'
  | 'purple'
  | 'blue' 
  | 'green';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'full';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  asChild?: boolean;
}