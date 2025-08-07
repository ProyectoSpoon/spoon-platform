// packages/shared/components/ui/Card/types.ts
import { ReactNode } from 'react';

export type CardVariant = 'default' | 'hover' | 'menu' | 'accent';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  withHover?: boolean;
  bordered?: boolean;
}
