import type { useEventChat } from '@event-chat/core'
import type { MessageInfo, MessageItem } from '@event-chat/rpc'
import { createService } from '@event-chat/rpc'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import type { InputProps } from 'antd'
import {
  type ResultType,
  type WorkerMessage,
  generateFakePrint,
  requestSchema,
} from './baseSWService'

const messagePortEvent = createService<MessagePortCtx>()
const generatePortMainCtx = () => messagePortEvent(() => ({}))

const portMainCtx = generatePortMainCtx()
const portWorkerCtx = messagePortEvent((ctx) => ({
  sendMessage: (text: WorkerMessage) =>
    ctx.filter?.(text).then((result) => {
      ctx.until?.(result)
      return result
    }),
}))

const createMessagePort = (port: MessagePort, channel: string) =>
  createMessagePortRPC(port, {
    context: {
      config: { channel },
      consume: portMainCtx.actions,
      event: portWorkerCtx.actions,
    },
  })

// ------ port end -------

const generateParentCtx = () =>
  messagePortEvent(
    (ctx) => ({
      connect: (text: InputProps['value'], info?: MessageInfo) => {
        const { ports } = info ?? {}
        if (ports?.[0]) ctx.connect?.({ port: ports[0], text })
      },
    }),
    (ctx) => ({
      broadcast: (result: unknown) => {
        // 收到后不再转发
        const { data, success } = requestSchema.safeParse(result)
        if (success) {
          ctx.print?.(generateFakePrint(data, 'broadcast')).catch(() => {})
        }
      },
    })
  )

const iframeCtx = messagePortEvent(
  () => ({}),
  (ctx) => ({
    broadcast: (result: unknown, info) => {
      ctx.broadcast?.(result, info)
      const { data, success } = requestSchema.safeParse(result)
      if (success) {
        ctx.print?.(generateFakePrint(data, 'broadcast')).catch(() => {})
      }
    },
  })
)

const mainCtx = messagePortEvent((ctx) => ({
  sendMessage: (data: Awaited<ResultType>) => ctx.print?.(data),
}))

const parentCtx = generateParentCtx()
const workerCtx = messagePortEvent(() => ({
  connect: async (channel: string, info?: MessageInfo) => {
    const { ports } = info ?? {}
    if (ports?.[0]) {
      // 允许 service worker 至少完成通信才注销
      await new Promise((resolve) => {
        createMessagePort(ports[0], channel)
        portWorkerCtx.provider({ until: resolve })
      })
    }
  },
}))

export {
  iframeCtx,
  mainCtx,
  parentCtx,
  portMainCtx,
  portWorkerCtx,
  workerCtx,
  createMessagePort,
  generateParentCtx,
  generatePortMainCtx,
}

export type ConnectInitType = {
  port: MessagePort
  text: InputProps['value']
}

export type MessagePortCtx = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  broadcast: (data: unknown, info?: Pick<MessageItem, 'requestId' | 'sign'>) => void
  connect: (info: ConnectInitType) => void
  filter: (text: WorkerMessage) => ResultType
  print: (data: Awaited<ResultType>) => ResultType

  // 留给内部专属方法
  until: (data: Awaited<ResultType>) => void
}
