import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputV2 } from './input';

describe('InputV2', () => {
  it('renders with label and required mark', () => {
    render(<InputV2 label="Nombre" requiredMark placeholder="Tu nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('requerido')).toBeInTheDocument();
  });

  it('shows errorMessage and aria-invalid', () => {
    render(<InputV2 errorMessage="Requerido" aria-label="nombre" />);
    const input = screen.getByLabelText('nombre');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});
