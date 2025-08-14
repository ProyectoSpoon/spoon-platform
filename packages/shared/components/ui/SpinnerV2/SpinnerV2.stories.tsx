import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SpinnerV2 } from './spinner';

const meta: Meta<typeof SpinnerV2> = {
  title: 'UI/SpinnerV2',
  component: SpinnerV2,
};

export default meta;

type Story = StoryObj<typeof SpinnerV2>;

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <SpinnerV2 {...args} size="sm" />
      <SpinnerV2 {...args} size="md" />
      <SpinnerV2 {...args} size="lg" />
    </div>
  ),
};
