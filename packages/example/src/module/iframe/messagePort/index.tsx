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
  const rpcRef = useRef<MessagePortInstance>(null)
  const ComRPC = useMemo(() => (isKey(group, RPCRecord) ? RPCRecord[group] : null), [group])

  const mountRef = useRef({ parent: false, worker: false })
  const { connected, rpc } = useRPC({
    config: {
      channel: messageGroup,
      allowedOrigins,
      onConnect: () => handle('parent', true),
      onDisconnect: () => handle('parent', false),
    },
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  const handle = (key: keyof typeof mountRef.current, online: boolean) => {
    if (online === mountRef.current[key]) return
    mountRef.current[key] = online

    if (Object.values(mountRef.current).every(Boolean) && group) {
      rpc.request('mount', { payload: group }).catch(() => {})
    }
  }

  iframeCtx.provider({
    destroy: () => rpcRef.current?.destroy(),
    create: (port) => {
      rpcRef.current?.connect(port)
    },
  })

  return !ComRPC || !group ? null : (
    <ComRPC
      disabled={!connected}
      ref={rpcRef}
      scope={group}
      connect={(online) => handle('worker', online)}
    />
  )
}

export default MessagePortCom

interface SubMessagePortProps {
  group?: string
}
