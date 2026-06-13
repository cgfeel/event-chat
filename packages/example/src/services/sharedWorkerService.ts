import { type MessageItem, createService } from '@event-chat/rpc'
import type z from 'zod'
import { generateFakePrint, requestSchema } from './baseSWService'

const messagePortEvent = createService<MessagePortCtx>()

export const generateMainCtx = () =>
  messagePortEvent(
    (ctx) => ({
      sendMessage: (data: ResultType) => {
        ctx.print?.(data)
      },
    }),
    (ctx) => ({
      brodcast: (info) => {
        const { data, success } = requestSchema.safeParse(info)
        if (success) ctx.print?.(generateFakePrint(data, 'sharedWorker-transmit'))
      },
    })
  )

export const generateWorkerCtx = () =>
  messagePortEvent(
    (ctx) => ({
      sendMessage: (data: RequestType) => {
        ctx.print?.(generateFakePrint(data, 'sharedWorker'), data)
      },
    }),
    (ctx) => ({
      brodcast: (info) => {
        const { data, success } = requestSchema.safeParse(info)
        if (success) ctx.print?.(generateFakePrint(data, 'sharedWorker-transmit'))
      },
    })
  )

export const iframeCtx = messagePortEvent(
  () => ({}),
  (ctx) => ({
    brodcast: (data, info) => {
      ctx.brodcast?.(data, info)
    },
  })
)

export const parentCtx = messagePortEvent(
  (ctx) => ({
    sendMessage: (data: ResultType) => {
      ctx.print?.(data)
    },
  }),
  (ctx) => ({
    brodcast: (data, info) => {
      ctx.brodcast?.(data, info)
    },
  })
)

export const mainConsume = generateMainCtx()
export const workerConsume = generateWorkerCtx()

export type MessagePortCtx = {
  brodcast: (data: unknown, info?: Pick<MessageItem, 'requestId' | 'sign'>) => void
  print: (info: ResultType, data?: RequestType) => void
}

export type ResultType = ReturnType<typeof generateFakePrint>

type RequestType = z.infer<typeof requestSchema>
