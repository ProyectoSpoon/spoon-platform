import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ActionBarV2 } from './action-bar';

const meta: Meta<typeof ActionBarV2> = {
  title: 'UI/ActionBarV2',
  component: ActionBarV2,
};

export default meta;

type Story = StoryObj<typeof ActionBarV2>;

export const Basic: Story = {
  render: () => (
    <div style={{ minHeight: 200 }}>
      <ActionBarV2
        secondary={{ label: 'Cancelar', onClick: () => {} }}
        primary={{ label: 'Guardar', onClick: () => {} }}
      />
    </div>
  ),
};

export const Danger: Story = {
  render: () => (
    <div style={{ minHeight: 200 }}>
      <ActionBarV2
        secondary={{ label: 'Atrás', onClick: () => {}, variant: 'outline' }}
        primary={{ label: 'Eliminar', onClick: () => {}, color: 'danger' }}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ minHeight: 200 }}>
      <ActionBarV2
        secondary={{ label: 'Cancelar', onClick: () => {}, disabled: true }}
        primary={{ label: 'Guardar', onClick: () => {}, disabled: true }}
      />
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{ minHeight: 200, display: 'grid', gap: 16 }}>
      <ActionBarV2 primary={{ label: 'Primario', onClick: () => {}, color: 'primary' }} />
      <ActionBarV2 primary={{ label: 'Peligro', onClick: () => {}, color: 'danger' }} />
      <ActionBarV2 primary={{ label: 'Éxito', onClick: () => {}, color: 'success' }} />
      <ActionBarV2 primary={{ label: 'Neutro', onClick: () => {}, color: 'neutral' }} />
    </div>
  ),
};

export const A11yFocusAndOutline: Story = {
  render: () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      setTimeout(() => ref.current?.focus(), 100);
    }, []);
    return (
      <div style={{ minHeight: 240, display: 'grid', gap: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--sp-neutral-600)' }}>
          Prueba: focus ring (usa Tab) y botón secundario outline.
        </div>
        <ActionBarV2
          secondary={{ label: 'Cancelar', onClick: () => {}, variant: 'outline' }}
          primary={{ label: 'Guardar', onClick: () => {}, color: 'primary', className: '', /* ref por wrapper */ }}
        />
        <ActionBarV2
          secondary={{ label: 'Atrás', onClick: () => {}, variant: 'default' }}
          primary={{ label: 'Eliminar', onClick: () => {}, color: 'danger' }}
        />
      </div>
    );
  },
};

export const A11yDisabledStates: Story = {
  render: () => (
    <div style={{ minHeight: 200, display: 'grid', gap: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--sp-neutral-600)' }}>
        Prueba: estados disabled para contraste/legibilidad.
      </div>
      <ActionBarV2
        secondary={{ label: 'Cancelar', onClick: () => {}, disabled: true, variant: 'outline' }}
        primary={{ label: 'Guardar', onClick: () => {}, disabled: true, color: 'primary' }}
      />
    </div>
  ),
};
