import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabsV2 } from './tabs';

const items = [
  { id: 'uno', label: 'Uno' },
  { id: 'dos', label: 'Dos' },
];

describe('TabsV2', () => {
  it('renderiza tabs y cambia de activo', () => {
    const onChange = jest.fn();
    render(<TabsV2 items={items} activeId="uno" onChange={onChange} />);
    const uno = screen.getByRole('tab', { name: 'Uno' });
    const dos = screen.getByRole('tab', { name: 'Dos' });
    expect(uno).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(dos);
    expect(onChange).toHaveBeenCalledWith('dos');
  });
});
