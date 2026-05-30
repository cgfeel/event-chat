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
import { type FC, useMemo } from 'react'
import { isKey } from '@/utils/fields'
import { ServiceWorkerRPC, WindowRPC, WorkerRPC } from './PortItem'

const RPCRecord = Object.freeze({
  [messagePortService]: ServiceWorkerRPC,
  [messagePortWeb]: WorkerRPC,
  [messagePortWindow]: WindowRPC,
})

const MessagePortCom: FC<SubMessagePortProps> = ({ group }) => {
  const ComRPC = useMemo(() => (isKey(group, RPCRecord) ? RPCRecord[group] : null), [group])
  const { connected, rpc } = useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
    },
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  return !ComRPC || !group ? null : (
    <ComRPC
      disabled={!connected}
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
