import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DialogV2 } from './dialog';

const meta: Meta<typeof DialogV2> = {
  title: 'UI V2/DialogV2',
  component: DialogV2,
};
export default meta;

type Story = StoryObj<typeof DialogV2>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
  <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Abrir diálogo</button>
        <DialogV2
          open={open}
          onClose={() => setOpen(false)}
          title="Título del diálogo"
          description="Breve descripción del contenido del diálogo."
        >
          <p>Contenido de ejemplo dentro del modal.</p>
        </DialogV2>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [open, setOpen] = useState<'sm' | 'md' | 'lg' | null>(null);
    return (
      <div className="flex gap-3">
        {(['sm','md','lg'] as const).map(s => (
          <button key={s} onClick={() => setOpen(s)} className="px-3 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] capitalize">{s}</button>
        ))}
        {(['sm','md','lg'] as const).map(s => (
          <DialogV2 key={s} open={open === s} onClose={() => setOpen(null)} title={`Dialog ${s}`} description={`Ejemplo tamaño ${s}`} size={s}>
            <p>Contenido de ejemplo</p>
          </DialogV2>
        ))}
      </div>
    );
  },
};

export const A11yFocusAndEscape: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-4">
        <p>Prueba: el foco debe quedar atrapado dentro del diálogo, y la tecla Escape debe cerrarlo.</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-[color:var(--sp-neutral-100)]" onClick={() => alert('Botón fuera 1')}>Fuera 1</button>
          <button className="px-3 py-2 rounded bg-[color:var(--sp-neutral-100)]" onClick={() => alert('Botón fuera 2')}>Fuera 2</button>
          <button className="px-3 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]" onClick={() => setOpen(true)}>Abrir</button>
        </div>
        <DialogV2 open={open} onClose={() => setOpen(false)} title="Prueba a11y" description="Tabulando no debe salir del modal.">
          <div className="flex flex-col gap-3">
            <input className="border rounded px-2 py-1" placeholder="Input 1" />
            <button className="px-3 py-2 rounded bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]">Acción primaria</button>
            <a href="#" className="underline text-[color:var(--sp-primary-700)]">Enlace</a>
          </div>
        </DialogV2>
      </div>
    );
  },
};
