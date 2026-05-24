import { Badge } from 'antd'
import { tv } from 'tailwind-variants'

export const panelStyles = tv({
  slots: {
    item: 'flex min-h-0 flex-col gap-2',
    itemTitle: 'flex flex-none items-center justify-between gap-2 text-gray-500',
    logs: 'flex-1 overflow-auto px-4',
    panel: 'row-span-3 flex min-h-0 bg-gray-800',
    worker: 'h-full flex-auto overflow-hidden bg-gray-800',
    wrap: 'grid h-162 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2',
  },
  variants: {
    closed: {
      true: {
        worker: 'flex items-center justify-center',
      },
    },
  },
})

export const titleRange = Object.freeze({
  Connect: <Badge status="success" text="Connect" />,
  Disconnect: <Badge status="default" text="Disconnect" />,
  Sending: <Badge status="warning" text="Sending" />,
})
