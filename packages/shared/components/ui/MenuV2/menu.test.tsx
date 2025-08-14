import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuV2 } from './menu';

describe('MenuV2', () => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma', disabled: true },
    { id: 'd', label: 'Delta' },
  ];

  test('opens on button click and navigates with arrows', () => {
    render(<MenuV2 items={items} buttonLabel="Menu" />);
    const btn = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    const options = screen.getAllByRole('menuitem');
    expect(options[0]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(options[1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    // skip disabled (Gamma)
    expect(options[3]).toHaveFocus();
  });

  test('typeahead jumps to matching item', () => {
    render(<MenuV2 items={items} buttonLabel="Menu" />);
    const btn = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(btn);
    fireEvent.keyDown(document, { key: 'd' });
    const options = screen.getAllByRole('menuitem');
    expect(options[3]).toHaveFocus();
  });

  test('escape closes and returns focus to button', () => {
    render(<MenuV2 items={items} buttonLabel="Menu" />);
    const btn = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(btn);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });
});
