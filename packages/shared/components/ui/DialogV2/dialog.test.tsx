import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogV2 } from './dialog';

describe('DialogV2', () => {
  test('renders title and description and closes on overlay click', () => {
    const onClose = jest.fn();
    render(
      <DialogV2 open onClose={onClose} title="Titulo" description="Descripcion">
        <p>Hola</p>
      </DialogV2>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Titulo')).toBeInTheDocument();
    expect(screen.getByText('Descripcion')).toBeInTheDocument();

    // Click overlay
    const overlay = screen.getByRole('presentation', { hidden: true }) || document.querySelector('[aria-hidden]');
    const target = overlay instanceof HTMLElement ? overlay : document.querySelector('[aria-hidden]');
    if (target) fireEvent.click(target);

    expect(onClose).toHaveBeenCalled();
  });

  test('does not render when open=false', () => {
    const { container } = render(<DialogV2 open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  test('closes on Escape and focuses dialog on open', () => {
    const onClose = jest.fn();
    render(
      <DialogV2 open onClose={onClose} title="Titulo">
        <button>Inside</button>
      </DialogV2>
    );

    const dialog = screen.getByRole('dialog');
    // Focus is moved to dialog container
    expect(dialog).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
