import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TableV2 } from './table';

interface Person {
  name: string;
  email: string;
  role: string;
}

const meta: Meta<typeof TableV2<Person>> = {
  title: 'UI V2/TableV2',
  component: TableV2 as any,
};
export default meta;

type Story = StoryObj<typeof TableV2<Person>>;

const columns = [
  { key: 'name', header: 'Nombre' },
  { key: 'email', header: 'Correo' },
  { key: 'role', header: 'Rol' },
] as const;

const data: Person[] = [
  { name: 'Ana', email: 'ana@example.com', role: 'Admin' },
  { name: 'Luis', email: 'luis@example.com', role: 'User' },
];

export const Basico: Story = {
  render: () => <TableV2 columns={columns as any} data={data} />,
};

export const Vacio: Story = {
  render: () => <TableV2 columns={columns as any} data={[]} emptyMessage="No hay registros" />,
};

export const Cargando: Story = {
  render: () => <TableV2 columns={columns as any} data={[]} loading />,
};
