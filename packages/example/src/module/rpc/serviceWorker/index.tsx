import { useEventChat } from '@event-chat/core'
import { Empty, Select } from 'antd'
import { type FC, type PropsWithChildren, useState } from 'react'
import Button from '@/components/Button'
import { ChatScroll } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import {
  serviceScopeAction,
  serviceScopeApi,
  serviceScopeParent,
  serviceWorkerAction,
  serviceWorkerGroup,
} from '../uitls'
import { panelStyles } from '../windowUitls'
import ServiceIframe from './ServiceIframe'
import ServiceWorkerItem from './ServiceWorkerItem'

const { item, itemTitle, logs, panel, worker, wrap } = panelStyles()
const itemList = [
  { scope: serviceScopeAction, sub: serviceWorkerAction },
  { scope: serviceScopeApi, sub: serviceWorkerGroup },
] as const

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const { emit } = useEventChat('', { group: serviceWorkerGroup })
  const [status, setStatus] = useState('normal')
  const [open, setOpen] = useState(true)

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <Button
          onClick={() => {
            setOpen(!open)
            setStatus('normal')
          }}
        >
          {open ? 'closed' : 'open'}
        </Button>
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
            emit({ name: `item-${scope}`, detail })
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
      {itemList.map(({ scope, sub }) => {
        const keyname = `${scope}-${sub}`
        return (
          <WorkerGrid key={keyname} scope={keyname}>
            <ServiceIframe scope={scope} sub={sub} />
          </WorkerGrid>
        )
      })}
    </div>
  )
}

export default ServiceWorkerDemo

interface WorkerGridProps {
  scope: string
}
