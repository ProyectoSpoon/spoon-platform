import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SkeletonV2 } from './skeleton';

const meta: Meta<typeof SkeletonV2> = {
  title: 'UI V2/SkeletonV2',
  component: SkeletonV2,
};
export default meta;

type Story = StoryObj<typeof SkeletonV2>;

export const Basico: Story = {
  render: () => (
    <div className="space-y-3">
      <SkeletonV2 className="w-48 h-4" variant="text" />
      <SkeletonV2 className="w-72 h-4" variant="text" />
      <SkeletonV2 className="w-24 h-24" variant="circle" />
      <SkeletonV2 className="w-full h-24" />
    </div>
  ),
};
