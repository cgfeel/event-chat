import { useEventChat } from '@event-chat/core'
import { Empty } from 'antd'
import { type FC, type PropsWithChildren, useState } from 'react'
import Button from '@/components/Button'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { routerPath } from '@/utils/fields'
import WorkerGrid from '../WorkerGrid'
import WorkerLogs from '../WorkerLogs'
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

const { panel, worker, wrap } = panelStyles()
const itemList = [
  { scope: serviceScopeAction, sub: serviceWorkerAction },
  { scope: serviceScopeApi, sub: serviceWorkerGroup },
] as const

const WorkerGridBtn: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const [open, setOpen] = useState(true)
  return (
    <WorkerGrid
      defaultStatus="normal"
      fallback={
        open ? undefined : (
          <div className={worker({ closed: !open })}>
            <Empty description="Worker is closed" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )
      }
      group={serviceWorkerGroup}
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
      scope={scope}
      title={<Button onClick={() => setOpen(!open)}>{open ? 'closed' : 'open'}</Button>}
    >
      {children}
    </WorkerGrid>
  )
}

const ServiceWorkerDemo: FC = () => {
  const { emit } = useEventChat('', { group: serviceWorkerGroup })
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs group={serviceWorkerGroup} name={`chat-${serviceScopeParent}`} />
      </div>
      <WorkerGridBtn scope={routerPath(serviceScopeAction)}>
        <ServiceWorkerItem
          group={serviceWorkerGroup}
          scope={routerPath(serviceScopeAction)}
          publish={(detail) => {
            const { receipt } = detail
            emit({ detail: { ...detail, own: false }, name: `chat-${serviceScopeParent}` })
            if (receipt) receiptStore.increasing(receipt)
          }}
        />
      </WorkerGridBtn>
      {itemList.map(({ scope, sub }) => {
        const keyname = `${scope}-${sub}`
        return (
          <WorkerGridBtn key={keyname} scope={keyname}>
            <ServiceIframe scope={routerPath(scope)} sub={sub} />
          </WorkerGridBtn>
        )
      })}
    </div>
  )
}

export default ServiceWorkerDemo

interface WorkerGridProps {
  scope: string
}
