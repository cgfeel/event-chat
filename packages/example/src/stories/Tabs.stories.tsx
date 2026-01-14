import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import Tabs, { TabContent, TabItem } from './Tabs';

const meta: Meta<typeof Tabs> = {
  args: {
    defaultActive: 'EventChat',
    group: 'demo',
    onChange: fn(),
  },
  argTypes: {
    active: {
      options: ['EventChat', 'AntdForm', 'Formily'],
      description: '选中项名称，用于接受消息',
    },
    defaultActive: {
      options: ['EventChat', 'AntdForm', 'Formily'],
      description: '默认选中项名称，用于接受消息',
    },
    group: {
      description: '标签组名称，避免存在多个标签组时操作混淆',
    },
    onChange: {
      description: '切换标签后的回调事件',
    },
  },
  component: Tabs,
  decorators: [
    (_, context) => {
      const { args } = context;
      return (
        <div className="mx-auto flex max-w-200 flex-col gap-8 py-4">
          <div className="flex w-full items-center justify-center py-4">
            <Tabs {...args}>
              <TabItem name="EventChat">eventChat</TabItem>
              <TabItem name="AntdForm">antdForm</TabItem>
              <TabItem name="Formily">formily</TabItem>
            </Tabs>
          </div>
          <TabContent {...args} />
        </div>
      );
    },
  ],
  subcomponents: { TabItem },
  title: 'Example/Tabs',
};

export default meta;

export type Story = StoryObj<typeof meta>;

export const Default: Story = {};
