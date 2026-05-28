import { messageGroup } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import type { MessageInfo } from '@event-chat/rpc'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { createService } from '@event-chat/rpc/react'

const messagePortEvent = createService<MessagePortCtx>()

const portMainCtx = messagePortEvent((ctx) => ({
  connect: (scope: string) => {
    ctx.emit?.({ detail: 'connected', name: `chat-${scope}` })
  },
  destroy: () => {},
}))

const portWorkerCtx = messagePortEvent((ctx) => ({
  destroy: () => {
    ctx.destroy?.()
  },
}))

const createMessagePort = (
  port: MessagePort,
  { scope, onConnect, onDisconnect }: MessageConfigType
) => {
  const RPCResult = createMessagePortRPC(port, {
    context: {
      config: {
        channel: messageGroup,
        onConnect: () => {
          RPCResult[0].request('connect', { payload: scope }).catch(() => {})
          onConnect?.(RPCResult)
        },
        onDisconnect,
      },
      consume: portMainCtx.actions,
      event: portWorkerCtx.actions,
    },
  })
  return RPCResult
}

// ------ port end -------

const iframeCtx = messagePortEvent((ctx) => ({
  connect: (destroy?: boolean, info?: MessageInfo) => {
    const { ports } = info ?? {}
    if (destroy) {
      ctx.destroy?.()
      return
    }
    if (ports?.[0]) ctx.create?.(ports[0])
  },
}))

const mainCtx = messagePortEvent((ctx) => ({
  connect: () => {
    ctx.connect?.()
  },
  destroy: (offline?: boolean) => {
    ctx.destroy?.(offline)
  },
  sendMessage: () => {},
}))

const parentCtx = messagePortEvent((ctx) => ({
  mount: (scope: string) => {
    ctx.emit?.({ detail: 'loaded', name: `chat-${scope}` })
  },
}))

const workerCtx = messagePortEvent((ctx) => ({
  connect: (destroy?: boolean, info?: MessageInfo) => {
    if (destroy) return
    const { destroy: onDisconnect, scope, connect } = ctx
    const { ports } = info ?? {}
    if (ports?.[0] && scope) {
      createMessagePort(ports[0], { onConnect: connect, scope, onDisconnect })
    }
  },
  destroy: () => {},
}))

export { iframeCtx, mainCtx, parentCtx, portMainCtx, portWorkerCtx, workerCtx, createMessagePort }

type MessagePortCtx = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  scope: string
  destroy: (offline?: boolean) => void
  connect: (rpc?: RPCInstance) => void
  create: (port: MessagePort) => void
}

type MessageConfigType = {
  scope: string
  onConnect?: (rpc: RPCInstance) => void
  onDisconnect?: (destroy?: boolean) => void
}

type RPCInstance = ReturnType<typeof createMessagePort>
