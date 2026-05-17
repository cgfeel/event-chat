import { useEventChat } from '@event-chat/core'
import { Empty, Select } from 'antd'
import { type FC, type PropsWithChildren, useEffect, useState } from 'react'
import { tv } from 'tailwind-variants'
import Button from '@/components/Button'
import { ChatScroll } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import ServiceIframe from './ServiceIframe'
import ServiceWorkerItem from './ServiceWorkerItem'
import {
  serviceScopeAction,
  serviceScopeApi,
  serviceScopeParent,
  serviceWorkerGroup,
} from './uitls'

const styles = tv({
  slots: {
    item: 'flex min-h-0 flex-col gap-2',
    itemTitle: 'flex flex-none items-center justify-between gap-2 text-gray-500',
    logs: 'flex-1 overflow-auto px-4',
    panel: 'row-span-2 flex min-h-0 bg-gray-800',
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

const { item, itemTitle, logs, panel, worker, wrap } = styles()

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const { emit } = useEventChat('', { group: serviceWorkerGroup })
  const [status, setStatus] = useState('normal')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setStatus('normal')
  }, [open])

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <Button onClick={() => setOpen(!open)}>{open ? 'closed' : 'open'}</Button>
        <Select
          options={[
            { label: '单独发送', value: 'normal' },
            {
              label: '全局广播',
              value: 'broadcast',
            },
            {
              label: '全局转发',
              value: 'transmit',
            },
          ]}
          size="small"
          value={status}
          onChange={(detail) => {
            emit({ name: scope, detail })
            setStatus(detail)
          }}
        />
      </div>
      {open ? (
        <div className={worker()}>{children}</div>
      ) : (
        <div className={worker({ closed: !open })}>
          <Empty description="Worker is closed" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </div>
  )
}

const WorkerLogs: FC = () => {
  return (
    <div className={logs()}>
      <ChatScroll
        direction="vertical"
        group={serviceWorkerGroup}
        name={`chat-${serviceScopeParent}`}
      />
    </div>
  )
}

const ServiceWorkerDemo: FC = () => {
  const { emit } = useEventChat('', { group: serviceWorkerGroup })
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      <WorkerGrid scope={serviceScopeAction}>
        <ServiceWorkerItem
          group={serviceWorkerGroup}
          scope={serviceScopeAction}
          publish={(detail) => {
            const { receipt } = detail
            emit({ detail: { ...detail, own: false }, name: `chat-${serviceScopeParent}` })
            if (receipt) receiptStore.increasing(receipt)
          }}
        />
      </WorkerGrid>
      <WorkerGrid scope={serviceScopeApi}>
        <ServiceIframe />
      </WorkerGrid>
    </div>
  )
}

export default ServiceWorkerDemo

interface WorkerGridProps {
  scope: string
}
