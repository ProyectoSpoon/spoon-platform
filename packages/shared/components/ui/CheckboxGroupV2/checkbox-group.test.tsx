import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckboxGroupV2 } from './checkbox-group';

const OPTIONS = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
  { value: 'c', label: 'Opción C' },
];

test('renders group with label and helper', () => {
  render(<CheckboxGroupV2 name="g" label="Elige" helperText="ayuda" options={OPTIONS} />);
  expect(screen.getByText('Elige')).toBeInTheDocument();
  expect(screen.getByText('ayuda')).toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
});

test('uncontrolled toggle works and calls onChange', () => {
  const onChange = jest.fn();
  render(<CheckboxGroupV2 name="g" defaultValue={["a"]} options={OPTIONS} onChange={onChange} />);
  const [a, b] = screen.getAllByRole('checkbox');
  expect(a).toBeChecked();
  fireEvent.click(b);
  expect(onChange).toHaveBeenCalledWith(['a', 'b']);
});

test('controlled mode respects value and calls onChange', () => {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [vals, setVals] = React.useState<string[]>(['b']);
    return (
      <CheckboxGroupV2
        name="g"
        value={vals}
        onChange={(v) => {
          onChange(v);
          setVals(v);
        }}
        options={OPTIONS}
      />
    );
  };
  render(<Wrapper />);
  const [a, b] = screen.getAllByRole('checkbox');
  expect(b).toBeChecked();
  fireEvent.click(a);
  expect(onChange).toHaveBeenCalledWith(['b', 'a']);
});

test('aria-required se marca cuando requiredMark=true', () => {
  render(<CheckboxGroupV2 name="g" label="Elige" requiredMark options={OPTIONS} />);
  const group = screen.getByRole('group');
  expect(group).toHaveAttribute('aria-required', 'true');
});
