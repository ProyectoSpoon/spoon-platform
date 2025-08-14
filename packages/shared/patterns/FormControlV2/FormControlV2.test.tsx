import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormControlV2 } from './FormControlV2';

describe('FormControlV2', () => {
  it('propaga id y aria al control', () => {
    render(
      <FormControlV2 label="Email" helperText="Usa tu email corporativo">
        {(props) => <input id={props.id} aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']} />}
      </FormControlV2>
    );
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
    const descId = input.getAttribute('aria-describedby');
    if (descId) {
      expect(document.getElementById(descId)).toBeTruthy();
    }
  });
});
