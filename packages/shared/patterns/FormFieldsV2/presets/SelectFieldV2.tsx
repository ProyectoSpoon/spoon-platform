import React from 'react';
import { SelectV2, type SelectV2Props } from '../../../components/ui/SelectV2';
import { FormControlV2 } from '../../FormControlV2';

export interface SelectFieldV2Props extends Omit<SelectV2Props, 'id' | 'label' | 'helperText' | 'errorMessage'> {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
}

export const SelectFieldV2: React.FC<SelectFieldV2Props> = ({ id, label, required, helperText, errorMessage, children, ...rest }) => {
  return (
    <FormControlV2 id={id} label={label} requiredMark={required} helperText={helperText} errorMessage={errorMessage}>
      {(props) => (
        <SelectV2
          id={props.id}
          aria-invalid={props['aria-invalid']}
          aria-describedby={props['aria-describedby']}
          required={required}
          {...rest}
        >
          {children}
        </SelectV2>
      )}
    </FormControlV2>
  );
};
