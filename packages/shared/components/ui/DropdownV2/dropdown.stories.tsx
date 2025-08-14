import type { Meta, StoryObj } from '@storybook/react';
import { DropdownV2 } from './dropdown';

const meta: Meta<typeof DropdownV2> = {
  title: 'UI V2/DropdownV2',
  component: DropdownV2
};
export default meta;

type Story = StoryObj<typeof DropdownV2>;

export const Basic: Story = {
  args: {
    label: 'Opciones',
    items: [
      { id: 'edit', label: 'Editar' },
      { id: 'duplicate', label: 'Duplicar' },
      { id: 'archive', label: 'Archivar' },
      { id: 'delete', label: 'Eliminar' }
    ]
  }
};

export const EndPlacement: Story = {
  args: {
    label: 'Menú',
    placement: 'bottom-end',
    items: [
      { id: 'view', label: 'Ver' },
      { id: 'download', label: 'Descargar' },
      { id: 'share', label: 'Compartir' }
    ]
  }
};
