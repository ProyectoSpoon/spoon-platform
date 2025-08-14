import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { RadioV2 } from './radio';

const meta: Meta<typeof RadioV2> = {
  title: 'UI/RadioV2',
  component: RadioV2,
};

export default meta;

type Story = StoryObj<typeof RadioV2>;

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('a');
    const name = 'sample-group';
    return (
      <div className="flex flex-col gap-3">
        <RadioV2 id="r1" name={name} label="Opción A" value="a" checked={value==='a'} onChange={(e) => setValue(e.target.value)} />
        <RadioV2 id="r2" name={name} label="Opción B" value="b" checked={value==='b'} onChange={(e) => setValue(e.target.value)} />
        <RadioV2 id="r3" name={name} label="Opción C" value="c" checked={value==='c'} onChange={(e) => setValue(e.target.value)} />
      </div>
    );
  },
};
