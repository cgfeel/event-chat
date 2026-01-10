import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import Toast from './Toast';

const meta: Meta<typeof Toast> = {
  args: {
    children: 'Info emmit',
    message: '这条信息是为了演示 toastEvent',
    title: 'ToastTiele',
  },
  argTypes: {
    duration: {
      description: '持续时间，设为 `0` 将关闭自动隐藏',
    },
    keyname: {
      description: '用于自定义处理逻辑时，提供一个识别的关键字',
    },
    message: {
      description: '`toast` 提示内容',
    },
    title: {
      description: '`toast` 标题',
    },
    type: {
      description: '`toast` 类型',
    },
  },
  component: Toast,
  title: 'Example/Toast',
  decorators: (Story, { args }) => (
    <div className="flex justify-center items-center py-20">
      <Story {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = {
  args: {
    children: 'Success emmit',
    type: 'success',
  },
};

export const Error: Story = {
  args: {
    children: 'Error emmit',
    type: 'error',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning emmit',
    type: 'warning',
  },
};

export const DurationZero: Story = {
  args: {
    children: 'Duration Zero',
    duration: 0,
    title: '这条消息不会自动消失',
    message: '需要手动点击关闭 Toast',
  },
};
