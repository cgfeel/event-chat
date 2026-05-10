import { mainCtx, workerCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { Badge } from 'antd'
import { type FC, useMemo, useState } from 'react'
import z from 'zod'
import { ChatScroll } from '@/components/chatLine'
import { WorkerPanel } from '@/components/chatLine'
import { serviceWorkerGroup, workerGroup } from './uitls'

const ServiceWorkerItem: FC<ServiceWorkerItemProps> = ({
  disabled,
  iframe,
  scope,
  group = workerGroup,
}) => {
  const [broadcast, setBroadcast] = useState(false)
  const { connected, rpc } = useRPC({
    config: {
      channel: 'service-worker',
    },
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createServiceWorkerRegistrationRPC,
    init: () => navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), { scope }),
  })

  const allow = useMemo(() => !disabled && connected, [connected, disabled])
  useEventChat(scope, {
    group: serviceWorkerGroup,
    schema: z.boolean(),
    callback: ({ detail }) => setBroadcast(detail),
  })

  return (
    <WorkerPanel
      disabled={!allow}
      name={iframe ? `iframe:${scope}` : scope}
      placeholder="Please input request message"
      title={
        allow ? (
          <Badge status="success" text="Connect" />
        ) : (
          <Badge status="default" text="Disconnect" />
        )
      }
      onChange={({ target }) => {
        rpc
          .request('sendMessage', { payload: { message: target.value, broadcast } })
          .catch(() => {})
      }}
    >
      <ChatScroll group={group} name={`chat-${scope}`} />
    </WorkerPanel>
  )
}

export default ServiceWorkerItem

interface ServiceWorkerItemProps {
  scope: string
  disabled?: boolean
  group?: string
  iframe?: boolean
}
