import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TimePickerV2 } from './time-picker';

const meta: Meta<typeof TimePickerV2> = {
  title: 'UI V2/TimePickerV2',
  component: TimePickerV2,
};
export default meta;

type Story = StoryObj<typeof TimePickerV2>;

export const Basic: Story = {
  render: (args) => <TimePickerV2 {...args} />,
  args: {
    id: 'tp1',
    label: 'Hora',
    helperText: 'Selecciona una hora',
    defaultValue: '12:30',
  },
};

export const ErrorState: Story = {
  render: (args) => <TimePickerV2 {...args} />,
  args: {
    id: 'tp2',
    label: 'Con error',
    errorMessage: 'Hora requerida',
    requiredMark: true,
  },
};

export const Disabled: Story = {
  render: (args) => <TimePickerV2 {...args} />,
  args: {
    id: 'tp3',
    label: 'Deshabilitado',
    disabled: true,
    defaultValue: '12:30',
  },
};

export const WithStep: Story = {
  render: (args) => <TimePickerV2 {...args} />,
  args: {
    id: 'tp4',
    label: 'Con intervalo de 5 min',
    helperText: 'step=300 (5 minutos)',
    step: 300,
  },
};
