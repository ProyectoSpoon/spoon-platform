import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MenuV2 } from './menu';

const meta: Meta<typeof MenuV2> = {
  title: 'UI V2/MenuV2',
  component: MenuV2
};
export default meta;

type Story = StoryObj<typeof MenuV2>;

export const Basic: Story = {
  render: () => (
    <div className="p-10">
      <MenuV2
        buttonLabel="Opciones"
        items={[
          { id: 'edit', label: 'Editar', onSelect: () => console.log('Editar') },
          { id: 'duplicate', label: 'Duplicar', onSelect: () => console.log('Duplicar') },
          { id: 'archive', label: 'Archivar', onSelect: () => console.log('Archivar') },
          { id: 'delete', label: 'Eliminar', onSelect: () => console.log('Eliminar') }
        ]}
      />
    </div>
  )
};

export const WithDisabled: Story = {
  render: () => (
    <div className="p-10">
      <MenuV2
        buttonLabel="Acciones"
        placement="bottom-end"
        items={[
          { id: 'view', label: 'Ver' },
          { id: 'download', label: 'Descargar' },
          { id: 'rename', label: 'Renombrar', disabled: true },
          { id: 'delete', label: 'Eliminar' }
        ]}
      />
    </div>
  )
};
