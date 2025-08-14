import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBarV2 } from './action-bar';

describe('ActionBarV2', () => {
  it('renderiza botones y dispara callbacks', () => {
    const onPrimary = jest.fn();
    const onSecondary = jest.fn();
    render(
      <ActionBarV2
        primary={{ label: 'Guardar', onClick: onPrimary }}
        secondary={{ label: 'Cancelar', onClick: onSecondary }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onSecondary).toHaveBeenCalled();
    expect(onPrimary).toHaveBeenCalled();
  });
});
