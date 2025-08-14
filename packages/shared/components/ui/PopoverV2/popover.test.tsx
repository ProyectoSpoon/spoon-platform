import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopoverV2 } from './popover';

describe('PopoverV2', () => {
  test('opens on trigger click and closes on outside click', () => {
    render(
      <div>
        <PopoverV2 content={<div>Contenido</div>}>
          <button>Trigger</button>
        </PopoverV2>
        <button>Outside</button>
      </div>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const outside = screen.getByRole('button', { name: 'Outside' });
    fireEvent.mouseDown(outside);
    // mousedown listener closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('Escape closes and returns focus to trigger', () => {
    render(
      <PopoverV2 content={<div>Contenido</div>}>
        <button>Trigger</button>
      </PopoverV2>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
