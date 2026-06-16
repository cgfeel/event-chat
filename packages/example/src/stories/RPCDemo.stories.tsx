import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import RPCDemo from './RPCDemo'

const meta: Meta<typeof RPCDemo> = {
  args: {
    type: 'iframe',
  },
  component: RPCDemo,
  title: 'RPC/Demo',
}

export default meta

export type Story = StoryObj<typeof meta>

export const Iframe: Story = {}

export const WebWorker: Story = {
  args: {
    type: 'webWorker',
  },
}

export const ServiceWorker: Story = {
  args: {
    type: 'serviceWork',
  },
}

export const MessagePort: Story = {
  args: {
    type: 'messagePort',
  },
}

export const SharedWorker: Story = {
  args: {
    type: 'sharedWorker',
  },
}

export const BroadcastChannel: Story = {
  args: {
    type: 'broadcastChannel',
  },
}

export const Transfer: Story = {
  args: {
    type: 'transfer',
  },
}

export const WebSocket: Story = {
  args: {
    type: 'webSocket',
  },
}
