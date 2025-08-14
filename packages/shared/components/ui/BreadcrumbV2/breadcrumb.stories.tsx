import type { Meta, StoryObj } from '@storybook/react';
import { BreadcrumbV2 } from './breadcrumb';

const meta: Meta<typeof BreadcrumbV2> = {
  title: 'UI V2/BreadcrumbV2',
  component: BreadcrumbV2
};
export default meta;

type Story = StoryObj<typeof BreadcrumbV2>;

export const Basic: Story = {
  args: {
    items: [
      { label: 'Inicio', href: '#' },
      { label: 'Productos', href: '#' },
      { label: 'Cafeteras' }
    ]
  }
};

export const CustomSeparator: Story = {
  args: {
    separator: '>' ,
    items: [
      { label: 'A', href: '#' },
      { label: 'B', href: '#' },
      { label: 'C' }
    ]
  }
};
