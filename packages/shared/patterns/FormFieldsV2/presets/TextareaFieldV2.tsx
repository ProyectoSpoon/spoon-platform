import React from 'react';
import { TextareaV2, type TextareaV2Props } from '../../../components/ui/TextareaV2';
import { FormControlV2 } from '../../FormControlV2';

export interface TextareaFieldV2Props extends Omit<TextareaV2Props, 'id' | 'label' | 'helperText' | 'errorMessage'> {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
}

export const TextareaFieldV2: React.FC<TextareaFieldV2Props> = ({ id, label, required, helperText, errorMessage, ...rest }) => {
  return (
    <FormControlV2 id={id} label={label} requiredMark={required} helperText={helperText} errorMessage={errorMessage}>
      {(props) => (
        <TextareaV2
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
