import React from 'react';
import { cn } from '../../../lib/utils';
import { CheckboxV2, type CheckboxV2Size } from '../CheckboxV2';

export interface CheckboxGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupV2Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  requiredMark?: boolean;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  size?: CheckboxV2Size;
}

function useControllableArray(
  controlled: string[] | undefined,
  defaultValue: string[] | undefined
) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? []);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const setValue = React.useCallback(
    (updater: React.SetStateAction<string[]>) => {
      if (isControlled) return; // noop in controlled mode
      setUncontrolled(updater);
    },
    [isControlled]
  );
  React.useEffect(() => {
    if (isControlled) return;
    // keep defaultValue updates in sync in rare cases
    if (defaultValue) setUncontrolled(defaultValue);
  }, [defaultValue, isControlled]);
  return [value, setValue] as const;
}

export const CheckboxGroupV2 = React.forwardRef<HTMLDivElement, CheckboxGroupV2Props>(
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
    const [internal, setInternal] = useControllableArray(value, defaultValue);
    const isSelected = React.useCallback((v: string) => internal.includes(v), [internal]);

    const handleToggle = (opt: CheckboxGroupOption) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      let next = internal;
      if (checked) {
        next = internal.includes(opt.value) ? internal : [...internal, opt.value];
      } else {
        next = internal.filter((v) => v !== opt.value);
      }
      // update uncontrolled state
      setInternal(next);
      // notify
      onChange?.(next);
    };

    return (
      <div
        id={id}
        ref={ref}
        role="group"
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
              <CheckboxV2
                key={opt.value}
                id={inputId}
                name={name}
                size={size}
                label={opt.label}
                checked={isSelected(opt.value)}
                onChange={handleToggle(opt)}
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

CheckboxGroupV2.displayName = 'CheckboxGroupV2';

export default CheckboxGroupV2;
