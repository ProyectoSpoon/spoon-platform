import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RadioGroupV2 } from './radio-group';

const meta: Meta<typeof RadioGroupV2> = {
  title: 'UI V2/RadioGroupV2',
  component: RadioGroupV2,
};
export default meta;

type Story = StoryObj<typeof RadioGroupV2>;

const OPTIONS = [
  { value: 'x', label: 'Opción X' },
  { value: 'y', label: 'Opción Y' },
  { value: 'z', label: 'Opción Z' },
];

export const Vertical: Story = {
  render: (args) => <RadioGroupV2 {...args} />,
  args: {
    name: 'rg1',
    label: 'Selecciona una opción',
    helperText: 'Elige solo una',
    options: OPTIONS,
    defaultValue: 'y',
    direction: 'vertical',
  },
};

export const Horizontal: Story = {
  render: (args) => <RadioGroupV2 {...args} />,
  args: {
    name: 'rg2',
    label: 'Horizontal',
    options: OPTIONS,
    direction: 'horizontal',
  },
};

export const ErrorState: Story = {
  render: (args) => <RadioGroupV2 {...args} />,
  args: {
    name: 'rg3',
    label: 'Con error',
    options: OPTIONS,
    errorMessage: 'Este campo es requerido',
    requiredMark: true,
  },
};
