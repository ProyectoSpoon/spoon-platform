import type { Preview } from '@storybook/react';
import './tailwind.css';
import React from 'react';
import type { Decorator } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0b0b0b' },
      ],
    },
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'focus-visible', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Tema global',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
};

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals as any).theme as 'light' | 'dark';
  const className = theme === 'dark'
    ? 'dark bg-neutral-900 text-white min-h-screen p-6'
    : 'bg-white text-black min-h-screen p-6';
  return React.createElement(
    'div',
    { className },
    React.createElement(Story as unknown as React.ComponentType)
  );
};

export const decorators = [withTheme];

export default preview;
