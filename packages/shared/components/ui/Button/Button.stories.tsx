import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button (legacy)',
  component: Button,
  args: { children: 'Button' },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="default">default</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
        <Button variant="purple">purple</Button>
        <Button variant="blue">blue</Button>
        <Button variant="green">green</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button disabled>default disabled</Button>
        <Button variant="destructive" disabled>
          destructive disabled
        </Button>
        <Button variant="outline" disabled>
          outline disabled
        </Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="full">full width</Button>
      <div style={{ width: 40 }}>
        <Button size="icon" aria-label="icon button">★</Button>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => <Button loading>Loading</Button>,
};

export const A11yStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--sp-neutral-600)' }}>
        Prueba: contraste, focus ring (usa Tab), disabled y hover.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button autoFocus>default (autoFocus)</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="secondary">secondary</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button disabled>default disabled</Button>
        <Button variant="destructive" disabled>
          destructive disabled
        </Button>
        <Button variant="outline" disabled>
          outline disabled
        </Button>
        <Button variant="ghost" disabled>
          ghost disabled
        </Button>
        <Button variant="link" disabled>
          link disabled
        </Button>
      </div>
    </div>
  ),
};

export const KeyboardFocus: Story = {
  render: () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      // Enfocar tras montar para visualizar el focus ring
      setTimeout(() => ref.current?.focus(), 100);
    }, []);
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button ref={ref}>focus visible</Button>
        <span style={{ fontSize: 12, color: 'var(--sp-neutral-600)' }}>
          Consejo: usa Tab/Shift+Tab para navegar y ver el anillo de foco.
        </span>
      </div>
    );
  },
};
