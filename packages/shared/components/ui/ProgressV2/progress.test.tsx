import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressV2 } from './progress';

describe('ProgressV2', () => {
  it('renderiza con role progressbar y valores ARIA', () => {
    render(<ProgressV2 value={40} max={80} label="Subida" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '80');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('muestra porcentaje redondeado', () => {
    render(<ProgressV2 value={33} max={100} showPercentage />);
    expect(screen.getByText(/33%/)).toBeInTheDocument();
  });
});
