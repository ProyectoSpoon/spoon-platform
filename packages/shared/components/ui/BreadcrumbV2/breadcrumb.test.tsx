import React from 'react';
import { render, screen } from '@testing-library/react';
import { BreadcrumbV2 } from './breadcrumb';

describe('BreadcrumbV2', () => {
  test('renders items with current page', () => {
    render(<BreadcrumbV2 items={[{ label: 'Inicio', href: '#' }, { label: 'Lista', href: '#' }, { label: 'Detalle' }]} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toHaveAttribute('aria-current', 'page');
  });
});
