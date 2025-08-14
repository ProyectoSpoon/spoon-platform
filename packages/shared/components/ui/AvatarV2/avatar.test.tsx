import React from 'react';
import { render, screen } from '@testing-library/react';
import { AvatarV2 } from './avatar';

describe('AvatarV2', () => {
  it('renders initials when no src provided', () => {
    render(<AvatarV2 name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<AvatarV2 src="/avatar.png" alt="User avatar" />);
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
  });
});
