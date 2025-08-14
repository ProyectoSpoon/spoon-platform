import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FormControlV2 } from './FormControlV2';

const meta: Meta<typeof FormControlV2> = {
  title: 'Patterns/FormControlV2',
  component: FormControlV2,
};

export default meta;

type Story = StoryObj<typeof FormControlV2>;

export const WithInput: Story = {
  render: () => (
    <FormControlV2 label="Nombre" helperText="Tu nombre de pila">
      {(props) => (
        <input id={props.id} aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']} className="mt-1 block w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md" />
      )}
    </FormControlV2>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormControlV2 label="Correo" errorMessage="Correo inválido" requiredMark>
      {(props) => (
        <input id={props.id} aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']} className="mt-1 block w-full px-3 py-2 border border-[color:var(--sp-error)] rounded-md" />
      )}
    </FormControlV2>
  ),
};
