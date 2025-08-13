/**
 * TESTS PARA COMPONENTE MesaDetailsHeader
 * Testing para header de detalles de mesa
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MesaDetailsHeader from '../components/MesaDetailsHeader';
import { Mesa } from '@spoon/shared/types/mesas';

const mockMesa: Mesa = {
  id: 'mesa-1',
  numero: 5,
  nombre: 'VIP Terraza',
  zona: 'Terraza',
  capacidad: 6,
  estado: 'libre',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('MesaDetailsHeader', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza información básica de la mesa', () => {
    render(
      <MesaDetailsHeader mesa={mockMesa} onClose={mockOnClose} />
    );

    expect(screen.getByText('VIP Terraza (#5)')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
    expect(screen.getByText('6 personas')).toBeInTheDocument();
    expect(screen.getByText('• Terraza')).toBeInTheDocument();
  });

  test('no muestra zona si es Principal', () => {
    const mesaPrincipal = { ...mockMesa, zona: 'Principal' };
    
    render(
      <MesaDetailsHeader mesa={mesaPrincipal} onClose={mockOnClose} />
    );

    expect(screen.queryByText('• Principal')).not.toBeInTheDocument();
  });

  test('usa color correcto según estado', () => {
    const { container } = render(
      <MesaDetailsHeader mesa={mockMesa} onClose={mockOnClose} />
    );

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('bg-green-600');
  });

  test('botón cerrar funciona correctamente', () => {
    render(
      <MesaDetailsHeader mesa={mockMesa} onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: /cerrar panel/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('maneja mesa sin nombre personalizado', () => {
    const mesaSinNombre = { ...mockMesa, nombre: undefined };
    
    render(
      <MesaDetailsHeader mesa={mesaSinNombre} onClose={mockOnClose} />
    );

    expect(screen.getByText('Mesa 5')).toBeInTheDocument();
  });

  test('diferentes estados usan colores correctos', () => {
    const estados = [
      { estado: 'ocupada' as const, colorClass: 'bg-red-600' },
      { estado: 'reservada' as const, colorClass: 'bg-yellow-600' },
      { estado: 'inactiva' as const, colorClass: 'bg-gray-700' },
      { estado: 'mantenimiento' as const, colorClass: 'bg-orange-600' }
    ];

    estados.forEach(({ estado, colorClass }) => {
      const mesaConEstado = { ...mockMesa, estado };
      const { container } = render(
        <MesaDetailsHeader mesa={mesaConEstado} onClose={mockOnClose} />
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass(colorClass);
    });
  });
});
