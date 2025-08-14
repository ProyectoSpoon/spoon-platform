import React from 'react';
import { render, screen } from '@testing-library/react';
import { SkeletonV2 } from './skeleton';

describe('SkeletonV2', () => {
  it('renders with role status and aria-label', () => {
    render(<SkeletonV2 className="w-20 h-4" />);
    const el = screen.getByRole('status', { name: /cargando/i });
    expect(el).toBeInTheDocument();
  });

  it('supports circle variant and custom sizes', () => {
    render(<SkeletonV2 variant="circle" width={40} height={40} />);
    const el = screen.getByRole('status');
    expect(el).toBeInTheDocument();
  });
});
