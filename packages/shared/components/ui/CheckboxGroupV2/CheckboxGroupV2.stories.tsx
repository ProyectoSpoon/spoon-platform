import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CheckboxGroupV2 } from './checkbox-group';

const meta: Meta<typeof CheckboxGroupV2> = {
  title: 'UI V2/CheckboxGroupV2',
  component: CheckboxGroupV2,
};
export default meta;

type Story = StoryObj<typeof CheckboxGroupV2>;

const OPTIONS = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
  { value: 'c', label: 'Opción C' },
];

export const Vertical: Story = {
  render: (args) => <CheckboxGroupV2 {...args} />,
  args: {
    name: 'group1',
    label: 'Selecciona opciones',
    helperText: 'Puedes elegir varias',
    options: OPTIONS,
    defaultValue: ['a'],
    direction: 'vertical',
  },
};

export const Horizontal: Story = {
  render: (args) => <CheckboxGroupV2 {...args} />,
  args: {
    name: 'group2',
    label: 'Horizontal',
    options: OPTIONS,
    direction: 'horizontal',
  },
};

export const ErrorState: Story = {
  render: (args) => <CheckboxGroupV2 {...args} />,
  args: {
    name: 'group3',
    label: 'Con error',
    options: OPTIONS,
    errorMessage: 'Este campo es requerido',
    requiredMark: true,
  },
};
