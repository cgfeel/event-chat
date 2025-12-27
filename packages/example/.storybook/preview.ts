import type { Preview } from '@storybook/react';
import { sb } from 'storybook/test';
import '../src/App.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        // 👇 Default options
        dark: { name: 'Dark', value: '#333' },
        light: { name: 'Light', value: '#F7F9F2' },
        // 👇 Add your own
        maroon: { name: 'Maroon', value: '#400' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  initialGlobals: {
    // 👇 Set the initial background color
    backgrounds: { value: 'Maroon' },
  },
};

// Provide a simple module mock to validate the new mocking pipeline.
// This swaps src/stories/utils/greeting.ts with its __mocks__ implementation.
sb.mock('../src/stories/utils/greeting.ts');

export default preview;
