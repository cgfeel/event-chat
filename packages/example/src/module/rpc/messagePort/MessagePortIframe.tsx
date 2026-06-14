import { type ResultType, transmitResult } from '@/services/baseSWService'
import {
  type ConnectInitType,
  generateParentCtx,
  generatePortMainCtx,
  iframeCtx,
  portWorkerCtx,
} from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { RPCInstanceContext, useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useContext, useMemo, useRef } from 'react'
import z from 'zod'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { routerPath } from '@/utils/fields'
import { allowedOrigins, messageGroup } from '../uitls'

const schema = z.enum(['broadcast', 'normal'])

const MessagePortIframe: FC<MessagePortIframeProps> = ({ sub }) => {
  const { brodcastScope, mount } = useContext(RPCInstanceContext)
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

  const print = useCallback(
    (info?: Awaited<ResultType>, broadcast?: boolean) => {
      if (info) {
        const { receipt, scope } = info.result?.receivedBody ?? {}
        if (receipt) receiptStore.increasing(receipt)
        if (!broadcast || scope === sub) {
          const detail = transmitResult({ ...info, scope: sub })
          emit({ name: 'chat-message-port', detail })
        }
      }
    },
    [sub, emit]
  )

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

              // 广播发送消息后以便释放 GC（不释放也会在下次更换）
              if (broadRef.current === 'broadcast') {
                brodcastScope?.({ payload })
                mount?.(portRPC)
                return
              }

              portRPC
                .request('sendMessage', { payload })
                .then(print)
                .catch(() => {})
            },
          },
          consume: portWorkerCtx.actions,
          event: portMainCtx.actions,
        },
      })

      if (broadRef.current === 'broadcast') {
        mount?.(portRPC, `iframe-port-${sub}`)
      }
    },
    [portMainCtx, sub, brodcastScope, mount, print]
  )

  useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
    },
    brodcast: parentCtx.brodcasts,
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  parentCtx.provider({
    print: (data) => {
      print(data, true)
      return Promise.resolve(data)
    },
    connect,
  })

  return <iframe className="h-full w-full" ref={iframeRef} src={routerPath(`/iframe?sub=${sub}`)} />
}

export default MessagePortIframe

interface MessagePortIframeProps {
  sub: string
}
