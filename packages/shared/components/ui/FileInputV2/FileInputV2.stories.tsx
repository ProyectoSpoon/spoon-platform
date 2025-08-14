import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FileInputV2 } from './file-input';

const meta: Meta<typeof FileInputV2> = {
  title: 'UI V2/FileInputV2',
  component: FileInputV2,
};
export default meta;

type Story = StoryObj<typeof FileInputV2>;

export const Single: Story = {
  render: (args) => <FileInputV2 {...args} />,
  args: {
    id: 'fi1',
    label: 'Sube un archivo',
    helperText: 'PNG o JPG',
  },
};

export const Multiple: Story = {
  render: (args) => <FileInputV2 {...args} />,
  args: {
    id: 'fi2',
    label: 'Sube múltiples archivos',
    multiple: true,
  },
};

export const ErrorState: Story = {
  render: (args) => <FileInputV2 {...args} />,
  args: {
    id: 'fi3',
    label: 'Con error',
    errorMessage: 'Archivo inválido',
    requiredMark: true,
  },
};

export const Disabled: Story = {
  render: (args) => <FileInputV2 {...args} />,
  args: {
    id: 'fi4',
    label: 'Deshabilitado',
    helperText: 'No disponible',
    disabled: true,
  },
};

export const AcceptImagesOnly: Story = {
  render: (args) => <FileInputV2 {...args} />,
  args: {
    id: 'fi5',
    label: 'Solo imágenes',
    helperText: 'Formatos: PNG, JPG',
    multiple: true,
    accept: 'image/png,image/jpeg',
  },
};
