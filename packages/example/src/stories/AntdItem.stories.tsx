import FormEventRaw from '@event-chat/antd-item';
import { ConfigProvider, Form, theme } from 'antd';
import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import AntdItem from './AntdItem';
import FormEvent from './components/FormEvent';

FormEventRaw.observer(Form);

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
  subcomponents: { FormEvent },
  title: 'Document/AntdItem',
} satisfies Meta<typeof AntdItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FormEmit: Story = {};

export const FormUpdate: Story = {
  args: {
    name: 'FormUpdate',
  },
};

export const FormUpdateFields: Story = {
  args: {
    name: 'FormUpdateFields',
  },
};

export const FormList: Story = {
  args: {
    name: 'FormList',
  },
};

export const FormSchema: Story = {
  args: {
    name: 'FormSchema',
  },
};

export const FormRate: Story = {
  args: {
    name: 'FormRate',
  },
};
