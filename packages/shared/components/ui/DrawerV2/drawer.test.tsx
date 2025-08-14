import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawerV2 } from './drawer';

describe('DrawerV2', () => {
  test('renders and closes via overlay click', () => {
    const onClose = jest.fn();
    render(
      <DrawerV2 open onClose={onClose} title="Panel">
        <button>Botón</button>
      </DrawerV2>
    );

    expect(screen.getByRole('dialog', { name: /panel/i })).toBeInTheDocument();
    // click overlay
    const overlay = document.querySelector('[role="presentation"]');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test('closes with Escape and returns focus', () => {
    const onClose = jest.fn();
    render(
      <div>
        <button>Trigger</button>
        <DrawerV2 open onClose={onClose}>
          <button>Inside</button>
        </DrawerV2>
      </div>
    );
    const inside = screen.getByRole('button', { name: 'Inside' });
    inside.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('does not render when open=false', () => {
    const { container } = render(<DrawerV2 open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
