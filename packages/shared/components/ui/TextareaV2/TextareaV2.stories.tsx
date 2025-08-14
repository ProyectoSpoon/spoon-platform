import type { Meta, StoryObj } from '@storybook/react';
import { TextareaV2 } from './textarea';

const meta: Meta<typeof TextareaV2> = {
  title: 'UI V2/Textarea',
  component: TextareaV2,
};
export default meta;

type Story = StoryObj<typeof TextareaV2>;

export const Default: Story = {
  args: {
    label: 'Notas',
    placeholder: 'Escribe una nota...',
  },
};

export const Error: Story = {
  args: {
    label: 'Notas',
    errorMessage: 'La nota es requerida',
  },
};
