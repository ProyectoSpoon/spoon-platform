import type { Meta, StoryObj } from '@storybook/react';
import { InputV2 } from './input';

const meta: Meta<typeof InputV2> = {
  title: 'Primitives/InputV2',
  component: InputV2,
  args: { placeholder: 'Escribe aquí...' },
};
export default meta;

type Story = StoryObj<typeof InputV2>;

export const Default: Story = { args: { label: 'Nombre' } };
export const Filled: Story = { args: { label: 'Nombre', appearance: 'filled' } };
export const Error: Story = { args: { label: 'Email', errorMessage: 'Email inválido' } };
export const Success: Story = { args: { label: 'Código', validation: 'success' } };
