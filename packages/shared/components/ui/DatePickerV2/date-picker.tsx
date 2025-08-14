import React from 'react';
import { cn } from '../../../lib/utils';
import { InputV2, type InputV2Props } from '../InputV2';

export interface DatePickerV2Props
  extends Omit<InputV2Props, 'type' | 'onChange' | 'value' | 'defaultValue'> {
  value?: string; // yyyy-mm-dd
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const DatePickerV2 = React.forwardRef<HTMLInputElement, DatePickerV2Props>(
  (
    { id, className, label, helperText, errorMessage, requiredMark, disabled, value, defaultValue, onChange, ...props },
    ref
  ) => {
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
    const isControlled = value !== undefined;
    const val = isControlled ? value : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternal(e.target.value);
      onChange?.(e.target.value);
    };

    return (
      <div className={cn('w-full', className)}>
  <InputV2
          id={id}
          ref={ref}
          type="date"
          label={label}
          helperText={helperText}
          errorMessage={errorMessage}
          requiredMark={requiredMark}
          disabled={disabled}
          value={val}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

DatePickerV2.displayName = 'DatePickerV2';

export default DatePickerV2;
