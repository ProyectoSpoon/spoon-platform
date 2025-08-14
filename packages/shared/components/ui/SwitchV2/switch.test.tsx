import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwitchV2 } from './switch';

describe('SwitchV2', () => {
  it('toggles checked state on click', () => {
    const Wrapper = () => {
      const [checked, setChecked] = React.useState(false);
      return <SwitchV2 id="sw" label="Switch" checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
    };
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Switch'));
    const input = screen.getByLabelText('Switch') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });
});
