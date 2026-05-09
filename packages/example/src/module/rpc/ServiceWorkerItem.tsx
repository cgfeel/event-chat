import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { Badge } from 'antd'
import { type FC } from 'react'
import { ChatScroll } from '@/components/chatLine'
import WorkerPanel from '@/components/chatLine/WorkerPanel'
import { workerGroup } from './uitls'

const ServiceWorkerItem: FC<ServiceWorkerItemProps> = ({ iframe, scope, group = workerGroup }) => {
  const { connected } = useRPC({
    config: {
      channel: 'service-worker',
    },
    drive: createServiceWorkerRegistrationRPC,
    init: () => navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), { scope }),
  })

  return (
    <WorkerPanel
      disabled={!connected}
      name={iframe ? `iframe:${scope}` : scope}
      placeholder="Please input request message"
      title={
        connected ? (
          <Badge status="success" text="Connect" />
        ) : (
          <Badge status="default" text="Disconnect" />
        )
      }
    >
      <ChatScroll group={group} name={`chat-${scope}`} />
    </WorkerPanel>
  )
}

export default ServiceWorkerItem

interface ServiceWorkerItemProps {
  scope: string
  group?: string
  iframe?: boolean
}
