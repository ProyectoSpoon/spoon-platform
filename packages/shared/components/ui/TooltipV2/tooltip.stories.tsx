import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TooltipV2 } from './tooltip';

const meta: Meta<typeof TooltipV2> = {
  title: 'UI V2/TooltipV2',
  component: TooltipV2
};
export default meta;

type Story = StoryObj<typeof TooltipV2>;

export const Basic: Story = {
  render: () => (
    <div className="p-10 flex justify-center">
      <TooltipV2 content="Información contextual" placement="top">
  <button className="px-4 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Pasa el cursor</button>
      </TooltipV2>
    </div>
  )
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 place-items-center p-16">
  <TooltipV2 content="Arriba" placement="top"><button className="px-3 py-1 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Top</button></TooltipV2>
  <TooltipV2 content="Abajo" placement="bottom"><button className="px-3 py-1 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Bottom</button></TooltipV2>
  <TooltipV2 content="Izquierda" placement="left"><button className="px-3 py-1 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Left</button></TooltipV2>
  <TooltipV2 content="Derecha" placement="right"><button className="px-3 py-1 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Right</button></TooltipV2>
    </div>
  )
};
