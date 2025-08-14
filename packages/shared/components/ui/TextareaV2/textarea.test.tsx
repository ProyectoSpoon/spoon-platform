import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextareaV2 } from './textarea';

describe('TextareaV2', () => {
  it('renders with label and required mark', () => {
    render(<TextareaV2 label="Notas" requiredMark placeholder="Escribe..." />);
    expect(screen.getByText('Notas')).toBeInTheDocument();
    expect(screen.getByLabelText('requerido')).toBeInTheDocument();
  });

  it('shows errorMessage and aria-invalid', () => {
    render(<TextareaV2 errorMessage="Requerido" aria-label="notas" />);
    const input = screen.getByLabelText('notas');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});
