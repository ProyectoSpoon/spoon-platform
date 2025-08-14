import React from 'react';
import { InputV2 } from '../../../components/ui/InputV2';
import { FormControlV2 } from '../../FormControlV2';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label = 'Contraseña',
  required,
  helperText,
  errorMessage,
  name,
  value,
  onChange,
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <FormControlV2 id={id} label={label} requiredMark={required} helperText={helperText} errorMessage={errorMessage}>
      {(props) => (
        <div className="relative">
          <InputV2
            id={props.id}
            type={show ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={onChange}
            aria-invalid={props['aria-invalid']}
            aria-describedby={props['aria-describedby']}
            required={required}
            placeholder="••••••••"
            className="pr-10"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)]">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}
    </FormControlV2>
  );
};
