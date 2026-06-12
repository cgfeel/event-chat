import { createService } from '@event-chat/rpc'
import type z from 'zod'
import { generateFakePrint, requestSchema } from './baseSWService'

const messagePortEvent = createService<MessagePortCtx>()
const generateMainCtx = () =>
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

const generateWorkerCtx = () =>
  messagePortEvent((ctx) => ({
    sendMessage: (data: RequestType) => {
      ctx.print?.(generateFakePrint(data, 'sharedWorker'), data)
    },
  }))

const mainConsume = generateMainCtx()
const workerConsume = generateWorkerCtx()

export { mainConsume, workerConsume, generateMainCtx, generateWorkerCtx }

export type MessagePortCtx = {
  print: (info: ResultType, data?: RequestType) => void
}

type RequestType = z.infer<typeof requestSchema>
type ResultType = ReturnType<typeof generateFakePrint>
