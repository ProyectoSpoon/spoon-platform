import React from 'react';
import { render, screen } from '@testing-library/react';
import { ButtonV2 } from './button';

describe('ButtonV2', () => {
  it('renders primary variant by default', () => {
    render(<ButtonV2>Save</ButtonV2>);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('shows loading text when loading', () => {
    render(<ButtonV2 loading loadingText="Procesando...">Save</ButtonV2>);
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });
});
