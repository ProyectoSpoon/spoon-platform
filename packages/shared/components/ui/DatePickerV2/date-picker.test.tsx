import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePickerV2 } from './date-picker';

test('renders with label and helper', () => {
  render(<DatePickerV2 id="dp" label="Fecha" helperText="elige fecha" defaultValue="2025-08-13" />);
  expect(screen.getByLabelText('Fecha')).toBeInTheDocument();
});

test('controlled change calls onChange', () => {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [v, setV] = React.useState('2025-08-13');
    return <DatePickerV2 id="dp" label="Fecha" value={v} onChange={(val) => { onChange(val); setV(val); }} />;
  };
  render(<Wrapper />);
  const input = screen.getByLabelText('Fecha', { exact: false }) as HTMLInputElement | null ?? (document.querySelector('#dp') as HTMLInputElement);
  fireEvent.change(input!, { target: { value: '2025-08-14' } });
  expect(onChange).toHaveBeenCalledWith('2025-08-14');
});

test('muestra error y aria-invalid', () => {
  render(<DatePickerV2 id="dp-err" label="Fecha" errorMessage="Requerido" />);
  const input = screen.getByLabelText('Fecha');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Requerido')).toBeInTheDocument();
});
