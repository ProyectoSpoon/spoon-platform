import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TabsV2 } from './tabs';

const meta: Meta<typeof TabsV2> = {
  title: 'UI/TabsV2',
  component: TabsV2,
};

export default meta;

type Story = StoryObj<typeof TabsV2>;

export const Basic: Story = {
  render: () => {
    const [active, setActive] = React.useState('uno');
    return (
      <TabsV2
        items={[
          { id: 'uno', label: 'Uno' },
          { id: 'dos', label: 'Dos' },
          { id: 'tres', label: 'Tres', disabled: true },
        ]}
        activeId={active}
        onChange={setActive}
      />
    );
  }
};

export const Fitted: Story = {
  render: () => {
    const [active, setActive] = React.useState('uno');
    return (
      <TabsV2
        fitted
        items={[
          { id: 'uno', label: 'General' },
          { id: 'dos', label: 'Detalles' },
          { id: 'tres', label: 'Ajustes' },
        ]}
        activeId={active}
        onChange={setActive}
      />
    );
  }
};
