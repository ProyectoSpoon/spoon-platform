import type { Meta, StoryObj } from '@storybook/react';
import { FormSection } from './FormSection';
import { InputV2 } from '../../components/ui/InputV2';

const meta: Meta<typeof FormSection> = {
  title: 'Patterns/FormSection',
  component: FormSection,
};
export default meta;

type Story = StoryObj<typeof FormSection>;

export const Editable: Story = {
  args: {
    title: 'Información General',
    description: 'Datos básicos de tu restaurante',
    readonly: false,
  },
  render: (args) => (
    <FormSection {...args} onSubmit={() => {}} onCancel={() => {}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputV2 label="Nombre del restaurante" placeholder="La Cocina de María" requiredMark />
        <InputV2 label="Teléfono" placeholder="+57 300 123 4567" />
      </div>
    </FormSection>
  ),
};

export const Readonly: Story = {
  args: {
    title: 'Información General',
    description: 'Datos básicos de tu restaurante',
    readonly: true,
  },
  render: (args) => (
    <FormSection {...args} onEdit={() => {}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputV2 label="Nombre del restaurante" value="La Cocina de María" readOnly />
        <InputV2 label="Teléfono" value="+57 300 123 4567" readOnly />
      </div>
    </FormSection>
  ),
};
