import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableV2 } from './table';

describe('TableV2', () => {
  type Row = { id: number; name: string };
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
  ];

  it('renders empty state', () => {
    render(<TableV2<Row> columns={columns as any} data={[]} emptyMessage="Sin datos" />);
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });

  it('renders rows', () => {
    render(<TableV2<Row> columns={columns as any} data={[{ id: 1, name: 'Ana' }]} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('renders loading skeletons', () => {
    render(<TableV2<Row> columns={columns as any} data={[]} loading />);
    expect(screen.getAllByRole('status')).toHaveLength(columns.length * 3);
  });
});
