import React from 'react';
import { InputV2 } from '../../../components/ui/InputV2';
import { FormControlV2 } from '../../FormControlV2';

export interface EmailFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  id,
  label = 'Correo electrónico',
  required,
  helperText,
  errorMessage,
  name,
  value,
  onChange,
}) => {
  return (
    <FormControlV2 id={id} label={label} requiredMark={required} helperText={helperText} errorMessage={errorMessage}>
      {(props) => (
        <InputV2
          id={props.id}
          type="email"
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={props['aria-invalid']}
          aria-describedby={props['aria-describedby']}
          required={required}
          placeholder="nombre@dominio.com"
        />
      )}
    </FormControlV2>
  );
};
