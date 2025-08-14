import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AlertV2 } from './alert';

const meta: Meta<typeof AlertV2> = {
  title: 'UI/AlertV2',
  component: AlertV2,
};

export default meta;

type Story = StoryObj<typeof AlertV2>;

export const Variants: Story = {
  render: (args) => (
    <div className="space-y-3">
      <AlertV2 {...args} variant="info" title="Información" description="Esto es un mensaje informativo." />
      <AlertV2 {...args} variant="success" title="Éxito" description="Operación completada correctamente." />
      <AlertV2 {...args} variant="warning" title="Advertencia" description="Revisa esta configuración." />
      <AlertV2 {...args} variant="error" title="Error" description="Algo salió mal." />
    </div>
  ),
};
