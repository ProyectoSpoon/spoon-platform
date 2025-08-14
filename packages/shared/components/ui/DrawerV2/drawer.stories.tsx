import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DrawerV2 } from './drawer';

const meta: Meta<typeof DrawerV2> = {
  title: 'UI V2/DrawerV2',
  component: DrawerV2
};
export default meta;

type Story = StoryObj<typeof DrawerV2>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-10">
  <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Abrir drawer</button>
        <DrawerV2 open={open} onClose={() => setOpen(false)} title="Panel lateral">
          <p>Contenido dentro del drawer.</p>
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Guardar</button>
            <button className="px-3 py-2 rounded bg-[color:var(--sp-neutral-100)]">Cancelar</button>
          </div>
        </DrawerV2>
      </div>
    );
  }
};

export const SidesAndWidths: Story = {
  render: () => {
    const [open, setOpen] = React.useState<{side: 'left'|'right', width: 'sm'|'md'|'lg'}|null>(null);
    return (
      <div className="flex flex-wrap gap-3 p-10">
        {(['left','right'] as const).map(side => (
          (['sm','md','lg'] as const).map(width => (
            <button key={`${side}-${width}`} className="px-3 py-2 rounded bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-surface-inverted)]" onClick={() => setOpen({ side, width })}>
              {side} / {width}
            </button>
          ))
        ))}
        {open && (
          <DrawerV2 open={true} onClose={() => setOpen(null)} side={open.side} width={open.width} title="Ejemplo">
            <p>Drawer {open.side} - {open.width}</p>
          </DrawerV2>
        )}
      </div>
    );
  }
};
