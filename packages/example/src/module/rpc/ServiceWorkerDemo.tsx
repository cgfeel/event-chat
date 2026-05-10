import { useEventChat } from '@event-chat/core'
import { Empty } from 'antd'
import { type FC, type PropsWithChildren, useState } from 'react'
import { tv } from 'tailwind-variants'
import Button from '@/components/Button'
import Checkbox from '@/components/checkbox'
import ServiceIframe from './ServiceIframe'
import ServiceWorkerItem from './ServiceWorkerItem'
import { serviceScopeAction, serviceScopeApi, serviceWorkerGroup } from './uitls'

const styles = tv({
  slots: {
    item: 'flex min-h-0 flex-col gap-2',
    itemTitle: 'flex flex-none items-center justify-between gap-2 text-gray-500',
    panel: 'row-span-2 min-h-0 bg-gray-800',
    worker: 'flex-auto bg-gray-800',
    wrap: 'grid h-108 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2',
  },
  variants: {
    closed: {
      true: {
        worker: 'flex items-center justify-center',
      },
    },
  },
})

const { item, itemTitle, panel, worker, wrap } = styles()

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const { emit } = useEventChat('', { group: serviceWorkerGroup })
  const [open, setOpen] = useState(true)

  return (
    <div className={item()}>
      <div className={itemTitle()}>
        <Button onClick={() => setOpen(!open)}>{open ? 'closed' : 'open'}</Button>
        <span>
          <Checkbox
            size="xs"
            onChange={({ target }) => emit({ detail: target.checked, name: scope })}
          >
            全局发送
          </Checkbox>
        </span>
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

const ServiceWorkerDemo: FC = () => (
  <div className={wrap()}>
    <div className={panel()}>
      <div>server</div>
    </div>
    <WorkerGrid scope={serviceScopeAction}>
      <ServiceWorkerItem group={serviceWorkerGroup} scope={serviceScopeAction} />
    </WorkerGrid>
    <WorkerGrid scope={serviceScopeApi}>
      <ServiceIframe />
    </WorkerGrid>
  </div>
)

export default ServiceWorkerDemo

interface WorkerGridProps {
  scope: string
}
