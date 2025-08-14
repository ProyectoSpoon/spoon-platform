import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EmailField, PasswordField } from './index';

const meta: Meta = {
  title: 'Patterns/FormFieldsV2',
  parameters: {
    a11y: { disable: false },
    controls: { expanded: true },
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj;

export const Fields: Story = {
  render: (args: any) => (
    <div className="space-y-4">
      <EmailField {...args} />
      <PasswordField {...args} />
    </div>
  ),
  args: {
    label: undefined,
    required: false,
    helperText: 'Texto de ayuda opcional',
    errorMessage: '',
  },
};
