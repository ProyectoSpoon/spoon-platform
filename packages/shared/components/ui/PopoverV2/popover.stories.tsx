import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PopoverV2 } from './popover';

const meta: Meta<typeof PopoverV2> = {
  title: 'UI V2/PopoverV2',
  component: PopoverV2
};
export default meta;

type Story = StoryObj<typeof PopoverV2>;

export const Basic: Story = {
  render: () => (
    <div className="flex justify-center p-10">
  <PopoverV2 mode="dialog" content={<div><div className="font-medium mb-2">Acciones</div><div className="flex gap-2"><button className="px-2 py-1 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded">Guardar</button><button className="px-2 py-1 bg-[color:var(--sp-neutral-100)] rounded">Cancelar</button></div></div>}>
        <button className="px-4 py-2 rounded bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]">Abrir popover</button>
      </PopoverV2>
    </div>
  )
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 place-items-center p-16">
      {(['top','bottom','left','right'] as const).map(p => (
  <PopoverV2 key={p} placement={p} mode="tooltip" content={<div>Colocado: {p}</div>}>
          <button className="px-3 py-1 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">{p}</button>
        </PopoverV2>
      ))}
    </div>
  )
};
