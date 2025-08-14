import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TooltipV2 } from './tooltip';

describe('TooltipV2', () => {
  test('shows tooltip on hover and hides on leave', () => {
    render(
      <TooltipV2 content="Ayuda" placement="top">
        <button>Trigger</button>
      </TooltipV2>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Ayuda');
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('associates tooltip via aria-describedby', () => {
    render(
      <TooltipV2 content={<span>Info</span>}>
        <button>Trigger</button>
      </TooltipV2>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.mouseEnter(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });
});
