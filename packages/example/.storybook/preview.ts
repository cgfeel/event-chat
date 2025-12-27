import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import { sb } from 'storybook/test';
import '../src/App.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'dark',
  }),
];

// Provide a simple module mock to validate the new mocking pipeline.
// This swaps src/stories/utils/greeting.ts with its __mocks__ implementation.
sb.mock('../src/stories/utils/greeting.ts');

export default preview;
