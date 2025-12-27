import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import EventChat from './EventChat';

const meta = {
  component: EventChat,
} satisfies Meta<typeof EventChat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
