import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckboxV2 } from './checkbox';

describe('CheckboxV2', () => {
  it('renders with label and toggles checked state', () => {
    const Wrapper = () => {
      const [checked, setChecked] = React.useState(false);
      return (
        <CheckboxV2 id="cb" label="Aceptar" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      );
    };
    render(<Wrapper />);
    const label = screen.getByText('Aceptar');
    fireEvent.click(label);
    const input = screen.getByLabelText('Aceptar') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });
});
