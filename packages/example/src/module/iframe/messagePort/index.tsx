import {
  allowedOrigins,
  messageGroup,
  messagePortService,
  messagePortWeb,
  messagePortWindow,
} from '@/module/rpc/uitls'
import { iframeCtx, parentCtx } from '@/services/messagePortService'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useMemo, useRef } from 'react'
import { isKey } from '@/utils/fields'
import { type MessagePortInstance, ServiceWorkerRPC, WindowRPC, WorkerRPC } from './PortItem'

const RPCRecord = Object.freeze({
  [messagePortService]: ServiceWorkerRPC,
  [messagePortWeb]: WorkerRPC,
  [messagePortWindow]: WindowRPC,
})

const MessagePortCom: FC<SubMessagePortProps> = ({ group }) => {
  const ComRPC = useMemo(() => (isKey(group, RPCRecord) ? RPCRecord[group] : null), [group])
  const portRef = useRef<MessagePortInstance>(null)

  const { connected, rpc } = useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
    },
    brodcast: iframeCtx.brodcasts,
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  iframeCtx.provider({
    broadcast: (payload, info) => {
      rpc.broadcast({ ...info, payload })
    },
    print: (data) => portRef.current?.print(data) ?? Promise.resolve(data),
  })

  return !ComRPC || !group ? null : (
    <ComRPC
      disabled={!connected}
      ref={portRef}
      scope={group}
      connect={({ port, text }) => {
        rpc.request('connect', { transfer: [port], payload: text }).catch(() => {})
      }}
    />
  )
}

export default MessagePortCom

interface SubMessagePortProps {
  group?: string
}
