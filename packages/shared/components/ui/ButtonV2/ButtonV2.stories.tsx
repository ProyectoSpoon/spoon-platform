import type { Meta, StoryObj } from '@storybook/react';
import { ButtonV2 } from './button';

const meta: Meta<typeof ButtonV2> = {
  title: 'Primitives/ButtonV2',
  component: ButtonV2,
  args: { children: 'Guardar' },
};
export default meta;

type Story = StoryObj<typeof ButtonV2>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Loading: Story = { args: { loading: true, loadingText: 'Procesando...' } };
