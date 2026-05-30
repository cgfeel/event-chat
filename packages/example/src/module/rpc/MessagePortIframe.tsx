import { transmitResult } from '@/services/baseSWService'
import {
  type ConnectInitType,
  generateParentCtx,
  generatePortMainCtx,
  iframeCtx,
  portWorkerCtx,
} from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useMemo, useRef } from 'react'
import z from 'zod'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { allowedOrigins, messageGroup } from './uitls'

const schema = z.enum(['broadcast', 'normal'])

const MessagePortIframe: FC<MessagePortIframeProps> = ({ sub }) => {
  const broadRef = useRef<z.infer<typeof schema>>('normal')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const parentCtx = useMemo(() => generateParentCtx(), [])
  const portMainCtx = useMemo(() => generatePortMainCtx(), [])

  const { emit } = useEventChat(`item-${sub}`, {
    group: messageGroup,
    callback: ({ detail }) => {
      broadRef.current = detail
    },
    schema,
  })

  useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
    },
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const connect = useCallback(
    ({ port, text }: ConnectInitType) => {
      const [portRPC] = createMessagePortRPC(port, {
        context: {
          config: {
            channel: messageGroup,
            onConnect: () => {
              const payload = {
                broadcast: broadRef.current,
                message: Array.isArray(text) ? text.join() : String(text ?? ''),
                receipt: receiptStore.addReceipt(),
                scope: sub,
              }

              portRPC
                .request('sendMessage', { payload })
                .then((info) => {
                  if (info) {
                    const { receipt } = info.result?.receivedBody ?? {}
                    if (receipt) receiptStore.increasing(receipt)

                    const detail = transmitResult({ ...info, scope: sub })
                    emit({ name: 'chat-message-port', detail })
                  }
                })
                .catch(() => {})
            },
          },
          consume: portWorkerCtx.actions,
          event: portMainCtx.actions,
        },
      })
    },
    [portMainCtx, sub, emit]
  )

  parentCtx.provider({ connect })

  return <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${sub}`} />
}

export default MessagePortIframe

interface MessagePortIframeProps {
  sub: string
}
