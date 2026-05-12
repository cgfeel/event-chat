import { mainCtx, workerCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { Badge } from 'antd'
import { type FC, useMemo, useState } from 'react'
import z from 'zod'
import { ChatScroll } from '@/components/chatLine'
import { WorkerPanel } from '@/components/chatLine'
import { serviceWorkerGroup } from './uitls'

const titleRange = Object.freeze({
  Connect: <Badge status="success" text="Connect" />,
  Disconnect: <Badge status="default" text="Disconnect" />,
  Sending: <Badge status="warning" text="Sending" />,
})

const ServiceWorkerItem: FC<ServiceWorkerItemProps> = ({
  disabled,
  iframe,
  scope,
  group = serviceWorkerGroup,
}) => {
  const [broadcast, setBroadcast] = useState('normal')
  const [sending, setSending] = useState(false)

  const { connected, rpc } = useRPC({
    config: {
      channel: serviceWorkerGroup,
    },
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createServiceWorkerRegistrationRPC,
    init: () => navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), { scope }),
  })

  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (!disabled && connected ? 'Connect' : 'Disconnect'),
    [connected, disabled, sending]
  )

  const { emit } = useEventChat(scope, {
    schema: z.string(),
    callback: ({ detail }) => setBroadcast(detail),
    group,
  })

  return (
    <WorkerPanel
      disabled={allow !== 'Connect'}
      name={iframe ? `iframe:${scope}` : scope}
      placeholder="Please input request message"
      title={titleRange[allow]}
      onSubmit={(value) => {
        const message = Array.isArray(value) ? value.join('') : String(value ?? '')
        setSending(true)

        rpc
          .request('sendMessage', { payload: { broadcast, message, scope } })
          .then(({ result, message: resmsg }) => {
            const defaultDetail = {
              date: new Date(),
              message: resmsg,
              own: false,
              user: scope,
              receipt: '12',
            }
            try {
              const detail = !result
                ? defaultDetail
                : {
                    broadcast: result.receivedBody?.broadcast !== 'normal',
                    date: result.data.date,
                    message: JSON.stringify(result),
                    own: true,
                    user: result.receivedBody?.scope ?? scope,
                    receipt: '12',
                  }

              emit({
                name: `chat-${scope}`,
                detail,
              })
            } catch {
              emit({
                name: `chat-${scope}`,
                detail: { ...defaultDetail, message: 'JSON Parse Faild' },
              })
            }
          })
          .catch(() => {})
          .finally(() => setSending(false))
      }}
      button
    >
      <ChatScroll direction="vertical" group={group} name={`chat-${scope}`} />
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
