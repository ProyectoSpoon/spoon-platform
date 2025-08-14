import React from 'react';
import { InputV2, type InputV2Props } from '../../../components/ui/InputV2';
import { FormControlV2 } from '../../FormControlV2';

export interface InputFieldV2Props extends Omit<InputV2Props, 'id' | 'label' | 'helperText' | 'errorMessage'> {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
}

export const InputFieldV2: React.FC<InputFieldV2Props> = ({ id, label, required, helperText, errorMessage, ...rest }) => {
  return (
    <FormControlV2 id={id} label={label} requiredMark={required} helperText={helperText} errorMessage={errorMessage}>
      {(props) => (
        <InputV2
          id={props.id}
          aria-invalid={props['aria-invalid']}
          aria-describedby={props['aria-describedby']}
          required={required}
          {...rest}
        />
      )}
    </FormControlV2>
  );
};
