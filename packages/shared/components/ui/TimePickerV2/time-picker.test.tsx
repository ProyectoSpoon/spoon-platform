import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimePickerV2 } from './time-picker';

test('renders with label', () => {
  render(<TimePickerV2 id="tp" label="Hora" defaultValue="12:30" />);
  expect(screen.getByLabelText('Hora')).toBeInTheDocument();
});

test('controlled change calls onChange', () => {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [v, setV] = React.useState('12:30');
    return <TimePickerV2 id="tp" label="Hora" value={v} onChange={(val) => { onChange(val); setV(val); }} />;
  };
  render(<Wrapper />);
  const input = screen.getByLabelText('Hora', { exact: false }) as HTMLInputElement | null ?? (document.querySelector('#tp') as HTMLInputElement);
  fireEvent.change(input!, { target: { value: '13:45' } });
  expect(onChange).toHaveBeenCalledWith('13:45');
});

test('muestra error y aria-invalid', () => {
  render(<TimePickerV2 id="tp-err" label="Hora" errorMessage="Requerido" />);
  const input = screen.getByLabelText('Hora');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Requerido')).toBeInTheDocument();
});
