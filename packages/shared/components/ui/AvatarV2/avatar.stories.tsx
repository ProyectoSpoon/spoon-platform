import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AvatarV2 } from './avatar';

const meta: Meta<typeof AvatarV2> = {
  title: 'UI V2/AvatarV2',
  component: AvatarV2,
  args: {
    name: 'Ada Lovelace',
    size: 'md',
    rounded: 'full'
  }
};
export default meta;

type Story = StoryObj<typeof AvatarV2>;

export const Initials: Story = {};

export const Image: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    alt: 'Avatar example'
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs','sm','md','lg','xl'] as const).map(s => (
        <div key={s} className="flex flex-col items-center gap-2">
          <AvatarV2 name="Ada Lovelace" size={s} />
          <span className="text-xs">{s}</span>
        </div>
      ))}
    </div>
  )
};
