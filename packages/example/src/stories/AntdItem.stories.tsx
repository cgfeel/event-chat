import { FormEvent } from '@event-chat/antd-item';
import { ConfigProvider, Form, theme } from 'antd';
import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import AntdItem from './AntdItem';

FormEvent.observer(Form);

const meta = {
  args: {
    name: 'FormEmit',
  },
  argTypes: {
    name: {
      control: false,
      description: '自定义事件名，用于接受消息',
    },
  },
  component: AntdItem,
  decorators: [
    (Story) => (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <div className="pt-8">
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  title: 'Document/AntdItem',
} satisfies Meta<typeof AntdItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FormEmit: Story = {};
