import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InputFieldV2 } from './presets/InputFieldV2';
import { SelectFieldV2 } from './presets/SelectFieldV2';
import { TextareaFieldV2 } from './presets/TextareaFieldV2';

const meta: Meta = {
  title: 'Patterns/FormFieldsV2/Wrappers',
  parameters: {
    a11y: { disable: false },
    controls: { expanded: true },
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<any>;

export const Input: Story = {
  render: (args) => (
    <div className="max-w-md">
      <InputFieldV2 id="story-input" {...args} />
    </div>
  ),
  args: {
    label: 'Nombre',
    required: false,
    placeholder: 'Escribe tu nombre',
    helperText: 'Texto de ayuda opcional',
    errorMessage: '',
  },
};

export const Select: Story = {
  render: (args) => (
    <div className="max-w-md">
      <SelectFieldV2 id="story-select" {...args}>
        <option value="">Seleccione una opción</option>
        <option value="a">Opción A</option>
        <option value="b">Opción B</option>
        <option value="c">Opción C</option>
      </SelectFieldV2>
    </div>
  ),
  args: {
    label: 'Categoría',
    required: false,
    helperText: 'Elegir una categoría',
    errorMessage: '',
    placeholder: undefined,
  },
};

export const Textarea: Story = {
  render: (args) => (
    <div className="max-w-md">
      <TextareaFieldV2 id="story-textarea" {...args} />
    </div>
  ),
  args: {
    label: 'Descripción',
    required: false,
    placeholder: 'Escribe una descripción…',
    helperText: 'Hasta 200 caracteres',
    errorMessage: '',
    rows: 4,
  },
};
