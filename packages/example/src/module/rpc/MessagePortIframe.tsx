import { iframeCtx, parentCtx, portMainCtx, portWorkerCtx } from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useRef } from 'react'
import z from 'zod'
import { allowedOrigins, messageGroup } from './uitls'

const schema = z.object({
  type: z.enum(['broad', 'connect']),
  broad: z.enum(['broadcast', 'normal']).optional(),
  online: z.boolean().optional(),
})

const MessagePortIframe: FC<MessagePortIframeProps> = ({ sub }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const portRef = useRef<RPCInstance | null>(null)

  const { rpc } = useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
    },
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const connectMessagePort = useCallback(() => {
    const channel = new MessageChannel()
    portRef.current = createMessagePortRPC(channel.port1, {
      context: {
        config: { channel: messageGroup },
        consume: portWorkerCtx.actions,
        event: portMainCtx.actions,
      },
    })

    rpc.request('connect', { payload: undefined, transfer: [channel.port2] }).catch(() => {})
  }, [rpc])

  const { emit } = useEventChat(`item-${sub}`, {
    group: messageGroup,
    callback: ({ detail }) => {
      const { online, type } = detail
      const [portRPC] = portRef.current ?? []

      if (type === 'connect') {
        if (online) {
          connectMessagePort()
        } else {
          portRPC
            ?.request('destroy')
            .then(() => {
              portRef.current = null
              emit({ detail: 'loaded', name: `chat-${sub}` })
            })
            .catch(() => {})
        }
        return
      }

      // 待续
      portRPC?.request('destroy').catch(() => {})
      // portRef.current?.()
    },
    schema,
  })

  parentCtx.provider({ emit })
  portMainCtx.provider({ emit })

  return <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${sub}`} />
}

export default MessagePortIframe

interface MessagePortIframeProps {
  sub: string
}

type RPCInstance = ReturnType<
  typeof createMessagePortRPC<typeof portMainCtx.actions, typeof portWorkerCtx.actions>
>
