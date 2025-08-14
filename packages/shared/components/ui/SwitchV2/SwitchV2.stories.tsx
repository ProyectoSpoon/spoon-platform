import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SwitchV2 } from './switch';

const meta: Meta<typeof SwitchV2> = {
  title: 'UI/SwitchV2',
  component: SwitchV2,
};

export default meta;

type Story = StoryObj<typeof SwitchV2>;

export const Basic: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchV2 id="story-switch" label="Activar notificaciones" checked={checked} onChange={(e) => setChecked(e.target.checked)} {...args} />
    );
  },
};
