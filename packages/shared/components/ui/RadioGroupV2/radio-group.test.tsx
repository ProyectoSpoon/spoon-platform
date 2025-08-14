import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroupV2 } from './radio-group';

const OPTIONS = [
  { value: 'x', label: 'Opción X' },
  { value: 'y', label: 'Opción Y' },
];

test('renders radiogroup with label and helper', () => {
  render(<RadioGroupV2 name="rg" label="Elige" helperText="ayuda" options={OPTIONS} />);
  expect(screen.getByText('Elige')).toBeInTheDocument();
  expect(screen.getByText('ayuda')).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(2);
});

test('uncontrolled select works and calls onChange', () => {
  const onChange = jest.fn();
  render(<RadioGroupV2 name="rg" defaultValue="x" options={OPTIONS} onChange={onChange} />);
  const [, y] = screen.getAllByRole('radio');
  expect(screen.getByDisplayValue('x')).toBeChecked();
  fireEvent.click(y);
  expect(onChange).toHaveBeenCalledWith('y');
});

test('controlled mode respects value and calls onChange', () => {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [val, setVal] = React.useState<string>('x');
    return (
      <RadioGroupV2
        name="rg"
        value={val}
        onChange={(v) => {
          onChange(v);
          setVal(v);
        }}
        options={OPTIONS}
      />
    );
  };
  render(<Wrapper />);
  const [, y] = screen.getAllByRole('radio');
  expect(screen.getByDisplayValue('x')).toBeChecked();
  fireEvent.click(y);
  expect(onChange).toHaveBeenCalledWith('y');
});

test('aria-required se marca cuando requiredMark=true', () => {
  render(<RadioGroupV2 name="rg" label="Elige" requiredMark options={OPTIONS} />);
  const group = screen.getByRole('radiogroup');
  expect(group).toHaveAttribute('aria-required', 'true');
});
