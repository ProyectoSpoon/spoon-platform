/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderTabsAndActions from '../components/HeaderTabsAndActions';

describe('HeaderTabsAndActions', () => {
  it('cambia de tab y dispara acciones', () => {
    const onChangeTab = jest.fn();
    const onActualizar = jest.fn();
    const onNuevoPedido = jest.fn();

    render(
      <HeaderTabsAndActions
        tab="hoy"
        registros={5}
        limit={10}
        descripcion="desc"
        onChangeTab={onChangeTab}
        onActualizar={onActualizar}
        onNuevoPedido={onNuevoPedido}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /actualizar/i }));
    expect(onActualizar).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /nuevo pedido/i }));
    expect(onNuevoPedido).toHaveBeenCalled();
  });
});
