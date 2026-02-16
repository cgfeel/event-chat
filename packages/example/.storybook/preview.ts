import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react'
import { sb } from 'storybook/test'
import '../src/App.css'
import AppDecorator from './AppDecorator'

const preview: Preview = {
  decorators: [AppDecorator],
  parameters: {
    controls: false,
    interactivePlayground: {
      collapsed: true,
    },
    options: {
      storySort: {
        order: ['Document', ['EventChat', 'AntdItem', 'NamePath'], 'Example', ['Toast', 'Tabs']],
      },
    },
  },
}

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'dark',
  }),
]

// Provide a simple module mock to validate the new mocking pipeline.
// This swaps src/stories/utils/greeting.ts with its __mocks__ implementation.
sb.mock('../src/stories/utils/greeting.ts')

export default preview
