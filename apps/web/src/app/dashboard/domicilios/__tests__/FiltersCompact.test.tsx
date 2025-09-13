/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltersCompact from '../components/FiltersCompact';

describe('FiltersCompact', () => {
  it('dispara callbacks de filtros y aplicar', () => {
    const onUpdate = jest.fn();
    const onAplicar = jest.fn();

    render(
      <FiltersCompact
        tab="hoy"
        filtros={{ estado: 'todos', domiciliario: 'todos', fecha: 'hoy', buscar: '' }}
        domiciliarios={[{ id: '1', nombre: 'Juan' } as any]}
        onUpdateFiltros={onUpdate}
        onAplicar={onAplicar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));
    expect(onAplicar).toHaveBeenCalled();
  });
});
