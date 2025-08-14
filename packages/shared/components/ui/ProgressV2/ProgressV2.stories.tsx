import type { Meta, StoryObj } from '@storybook/react';
import { ProgressV2 } from './progress';

const meta: Meta<typeof ProgressV2> = {
  title: 'UI/ProgressV2',
  component: ProgressV2,
  args: {
    value: 40,
    max: 100,
    label: 'Progreso',
    showPercentage: true,
  },
};

export default meta;

type Story = StoryObj<typeof ProgressV2>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Success: Story = {
  args: { variant: 'success', value: 80 },
};

export const Warning: Story = {
  args: { variant: 'warning', value: 65 },
};

export const Error: Story = {
  args: { variant: 'error', value: 25 },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressV2 value={20} size="sm" label="Pequeño" />
      <ProgressV2 value={50} size="md" label="Mediano" />
      <ProgressV2 value={80} size="lg" label="Grande" />
    </div>
  ),
};
