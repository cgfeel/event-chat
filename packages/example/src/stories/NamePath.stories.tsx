import { ConfigProvider, theme } from 'antd'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import NamePath from './NamePath'

const meta = {
  args: {
    name: 'PointPath',
  },
  component: NamePath,
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
  title: 'Document/NamePath',
} satisfies Meta<typeof NamePath>

export default meta

type Story = StoryObj<typeof meta>

export const PointPath: Story = {}

export const ListForm: Story = {
  args: {
    name: 'ListForm',
  },
}
