// packages/shared/components/ui/Progress/types.ts
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showPercentage?: boolean;
  label?: string;
}