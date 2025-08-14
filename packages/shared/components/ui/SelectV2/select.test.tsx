import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectV2 } from './select';

describe('SelectV2', () => {
  it('renders with label and required mark', () => {
    render(
      <SelectV2 label="Zona" requiredMark placeholder="Selecciona">
        <option value="p">Principal</option>
      </SelectV2>
    );
    expect(screen.getByText('Zona')).toBeInTheDocument();
    expect(screen.getByLabelText('requerido')).toBeInTheDocument();
  });

  it('shows errorMessage and aria-invalid', () => {
    render(
      <SelectV2 errorMessage="Requerido" aria-label="zona">
        <option value="p">Principal</option>
      </SelectV2>
    );
    const sel = screen.getByLabelText('zona');
    expect(sel).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});
