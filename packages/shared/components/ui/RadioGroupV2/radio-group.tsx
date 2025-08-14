import React from 'react';
import { cn } from '../../../lib/utils';
import { RadioV2, type RadioV2Size } from '../RadioV2';

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupV2Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  requiredMark?: boolean;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  size?: RadioV2Size;
}

function useControllable<T>(controlled: T | undefined, defaultValue: T | undefined) {
  const [uncontrolled, setUncontrolled] = React.useState<T | undefined>(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const setValue = (next: T) => {
    if (!isControlled) setUncontrolled(next);
  };
  return [value, setValue] as const;
}

export const RadioGroupV2 = React.forwardRef<HTMLDivElement, RadioGroupV2Props>(
  (
    {
      id,
      className,
      name,
      options,
      value,
      defaultValue,
      onChange,
      label,
      helperText,
      errorMessage,
      requiredMark,
      disabled,
      direction = 'vertical',
      size = 'md',
      ...rest
    },
    ref
  ) => {
    const labelId = label ? `${id || name}-label` : undefined;
    const descriptionId = helperText || errorMessage ? `${id || name}-description` : undefined;
    const [internal, setInternal] = useControllable<string | undefined>(value, defaultValue);

    const handleChange = (opt: RadioGroupOption) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) return;
      setInternal(opt.value);
      onChange?.(opt.value);
    };

    return (
      <div
        id={id}
        ref={ref}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
  aria-required={requiredMark || undefined}
        aria-invalid={!!errorMessage || undefined}
        className={cn('w-full', className)}
        {...rest}
      >
        {label && (
          <div id={labelId} className="mb-2 text-sm font-medium text-[color:var(--sp-neutral-900)]">
            {label}
            {requiredMark && <span className="text-[color:var(--sp-error)] ml-1">*</span>}
          </div>
        )}
        <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}>
          {options.map((opt, idx) => {
            const inputId = `${id || name}-opt-${idx}`;
            return (
              <RadioV2
                key={opt.value}
                id={inputId}
                name={name}
                size={size}
                label={opt.label}
                checked={internal === opt.value}
                onChange={handleChange(opt)}
                disabled={disabled || opt.disabled}
                aria-describedby={descriptionId}
                value={opt.value}
              />
            );
          })}
        </div>
        {(helperText || errorMessage) && (
          <p
            id={descriptionId}
            className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

RadioGroupV2.displayName = 'RadioGroupV2';

export default RadioGroupV2;
