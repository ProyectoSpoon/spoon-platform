import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationV2 } from './pagination';

describe('PaginationV2', () => {
  test('renders window of pages and handles navigation', () => {
    const onChange = jest.fn();
    render(<PaginationV2 page={3} pageCount={10} onPageChange={onChange} />);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test('current page has aria-current=page', () => {
    const { rerender } = render(<PaginationV2 page={1} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    rerender(<PaginationV2 page={2} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });
});
