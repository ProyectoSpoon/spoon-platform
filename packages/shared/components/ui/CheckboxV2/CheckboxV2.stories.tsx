import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { CheckboxV2 } from './checkbox';

const meta: Meta<typeof CheckboxV2> = {
  title: 'UI/CheckboxV2',
  component: CheckboxV2,
};

export default meta;

type Story = StoryObj<typeof CheckboxV2>;

export const Basic: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxV2
        id="story-checkbox"
        label="Aceptar términos"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        helperText="Puedes cambiarlo más tarde"
        {...args}
      />
    );
  },
  args: {
    requiredMark: false,
  },
};
