import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import EventChat from './EventChat';

const meta = {
  component: EventChat,
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
  },
  globals: {
    // 👇 Set background value for all component stories
    backgrounds: { value: 'Maroon' },
  },
} satisfies Meta<typeof EventChat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
