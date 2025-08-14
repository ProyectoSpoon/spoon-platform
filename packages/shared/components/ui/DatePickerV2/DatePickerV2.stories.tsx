import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DatePickerV2 } from './date-picker';

const meta: Meta<typeof DatePickerV2> = {
  title: 'UI V2/DatePickerV2',
  component: DatePickerV2,
};
export default meta;

type Story = StoryObj<typeof DatePickerV2>;

export const Basic: Story = {
  render: (args) => <DatePickerV2 {...args} />,
  args: {
    id: 'dp1',
    label: 'Fecha',
    helperText: 'Selecciona una fecha',
    defaultValue: '2025-08-13',
  },
};

export const ErrorState: Story = {
  render: (args) => <DatePickerV2 {...args} />,
  args: {
    id: 'dp2',
    label: 'Con error',
    errorMessage: 'Fecha requerida',
    requiredMark: true,
  },
};

export const Disabled: Story = {
  render: (args) => <DatePickerV2 {...args} />,
  args: {
    id: 'dp3',
    label: 'Deshabilitado',
    disabled: true,
    defaultValue: '2025-08-13',
  },
};

export const WithConstraints: Story = {
  render: (args) => <DatePickerV2 {...args} />,
  args: {
    id: 'dp4',
    label: 'Con restricciones',
    helperText: 'Rango 2025-08-10 a 2025-08-20',
    min: '2025-08-10',
    max: '2025-08-20',
  },
};
