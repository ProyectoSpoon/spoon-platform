import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SelectV2 } from './select';

const meta: Meta<typeof SelectV2> = {
  title: 'UI V2/Select',
  component: SelectV2,
};
export default meta;

type Story = StoryObj<typeof SelectV2>;

export const Default: Story = {
  args: {
    label: 'Zona',
    placeholder: 'Selecciona una zona',
    children: [
      <option key="p" value="principal">Principal</option>,
      <option key="t" value="terraza">Terraza</option>,
      <option key="b" value="bar">Bar</option>,
    ],
  },
};

export const Error: Story = {
  args: {
    label: 'Zona',
    errorMessage: 'Campo requerido',
    children: [
      <option key="p" value="principal">Principal</option>,
      <option key="t" value="terraza">Terraza</option>,
    ],
  },
};
