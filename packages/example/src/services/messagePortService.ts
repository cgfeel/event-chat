import type { useEventChat } from '@event-chat/core'
import type { MessageInfo } from '@event-chat/rpc'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { createService } from '@event-chat/rpc/react'
import type { InputProps } from 'antd'
import { type WorkerMessage, sendMessage } from './baseSWService'

const messagePortEvent = createService<MessagePortCtx>()
const generatePortMainCtx = () => messagePortEvent(() => ({}))

const portMainCtx = generatePortMainCtx()
const portWorkerCtx = messagePortEvent((ctx) => ({
  sendMessage: (text: WorkerMessage) => ctx.filter?.(text),
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
  messagePortEvent((ctx) => ({
    connect: (text: InputProps['value'], info?: MessageInfo) => {
      const { ports } = info ?? {}
      if (ports?.[0]) ctx.connect?.({ port: ports[0], text })
    },
  }))

const iframeCtx = messagePortEvent(() => ({}))

const mainCtx = messagePortEvent((ctx) => ({
  sendMessage: (data: Awaited<ResultType>) => ctx.print?.(data),
}))

const parentCtx = generateParentCtx()
const workerCtx = messagePortEvent(() => ({
  connect: (channel: string, info?: MessageInfo) => {
    const { ports } = info ?? {}
    if (ports?.[0]) createMessagePort(ports[0], channel)
  },
  // destroy: () => {},
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
  connect: (info: ConnectInitType) => void
  filter: (text: WorkerMessage) => ResultType
  print: (data: Awaited<ResultType>) => ResultType
}

type ResultType = ReturnType<typeof sendMessage>
