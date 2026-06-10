import { transmitResult } from '@/services/baseSWService'
import { type ParentCtxType, mainCtx, workerCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { type FC, useMemo, useState } from 'react'
import z from 'zod'
import { ChatScroll } from '@/components/chatLine'
import { WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { serviceWorkerGroup } from '../uitls'
import { titleRange } from '../windowUitls'

const ServiceWorkerItem: FC<ServiceWorkerItemProps> = ({
  disabled,
  iframe,
  scope,
  publish,
  group = serviceWorkerGroup,
}) => {
  const [broadcast, setBroadcast] = useState('normal')
  const [sending, setSending] = useState(false)

  const { connected, rpc, brodcastScope } = useRPC({
    config: {
      channel: serviceWorkerGroup,
    },
    brodcast: mainCtx.brodcasts,
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createServiceWorkerRegistrationRPC,
    init: () => navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), { scope }),
  })

  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (!disabled && connected ? 'Connect' : 'Disconnect'),
    [connected, disabled, sending]
  )

  const { emit } = useEventChat(`item-${scope}`, {
    schema: z.string(),
    callback: ({ detail }) => setBroadcast(detail),
    group,
  })

  // 本来应该像 WorkerItem 一样通过 generateMainCtx 区分上下文
  // 当时当前 service worker 一个放在主页面，一个放在 iframe，本就上下文隔离
  mainCtx.provider({ scope: `chat-${scope}`, emit, publish })

  return (
    <WorkerPanel
      disabled={allow !== 'Connect'}
      name={iframe ? `iframe:${scope}` : scope}
      placeholder="Please input request message"
      title={titleRange[allow]}
      onSubmit={(value) => {
        setSending(true)
        const payload = {
          receipt: receiptStore.addReceipt(),
          message: Array.isArray(value) ? value.join('') : String(value ?? ''),
          broadcast,
          scope,
        }

        switch (broadcast) {
          case 'normal':
            rpc
              .request('sendMessage', { payload })
              .then((result) => {
                const detail = transmitResult({ ...result, scope })
                emit({ name: `chat-${scope}`, detail })
                publish?.(detail)
              })
              .catch(() => {})
              .finally(() => setSending(false))
            break
          case 'broadcast':
            // 广播没有办法等待，如果需要可以通过 transmit
            brodcastScope({ payload })
            setSending(false)
            break
          case 'transmit':
            // 这里也可以做错误处理，演示省略
            rpc
              .request('transmit', { payload })
              .catch(() => {})
              .finally(() => setSending(false))
            break
          default:
            setSending(false)
        }
      }}
      button
    >
      <ChatScroll direction="vertical" group={group} name={`chat-${scope}`} />
    </WorkerPanel>
  )
}

export default ServiceWorkerItem

interface ServiceWorkerItemProps extends Partial<Pick<ParentCtxType, 'publish'>> {
  scope: string
  disabled?: boolean
  group?: string
  iframe?: boolean
}
