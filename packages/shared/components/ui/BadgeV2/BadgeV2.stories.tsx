import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BadgeV2 } from './badge';

const meta: Meta<typeof BadgeV2> = {
  title: 'UI/BadgeV2',
  component: BadgeV2,
};

export default meta;

type Story = StoryObj<typeof BadgeV2>;

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <BadgeV2 {...args} variant="primary">Primario</BadgeV2>
      <BadgeV2 {...args} variant="success">Éxito</BadgeV2>
      <BadgeV2 {...args} variant="warning">Advertencia</BadgeV2>
      <BadgeV2 {...args} variant="error">Error</BadgeV2>
      <BadgeV2 {...args} variant="neutral">Neutro</BadgeV2>
      <BadgeV2 {...args} variant="outline">Borde</BadgeV2>
    </div>
  ),
};
