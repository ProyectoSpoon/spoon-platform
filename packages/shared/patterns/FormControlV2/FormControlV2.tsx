import React, { useId } from 'react';
import { cn } from '../../lib/utils';

export interface FormControlV2Props {
  id?: string;
  label?: string;
  requiredMark?: boolean;
  helperText?: string;
  errorMessage?: string;
  className?: string;
  children: (controlProps: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    required?: boolean;
  }) => React.ReactNode;
}

export const FormControlV2: React.FC<FormControlV2Props> = ({
  id,
  label,
  requiredMark,
  helperText,
  errorMessage,
  className,
  children,
}) => {
  const autoId = useId();
  const controlId = id || autoId;
  const descId = (helperText || errorMessage) ? `${controlId}-description` : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={controlId} className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
          {label}
          {requiredMark && (
            <span className="text-[color:var(--sp-error)] ml-1" aria-label="requerido">*</span>
          )}
        </label>
      )}
      {children({ id: controlId, 'aria-invalid': !!errorMessage || undefined, 'aria-describedby': descId })}
      {(helperText || errorMessage) && (
        <p id={descId} className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}>
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
};

export default FormControlV2;
