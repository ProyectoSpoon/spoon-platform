import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownV2 } from './dropdown';

describe('DropdownV2', () => {
  test('renders and opens menu from MenuV2', () => {
    render(<DropdownV2 label="Más" items={[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]} />);
    const btn = screen.getByRole('button', { name: 'Más' });
    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
