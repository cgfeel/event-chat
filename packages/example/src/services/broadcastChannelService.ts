import type { MessageItem } from '@event-chat/rpc'
import { createService } from '@event-chat/rpc/react'
import type z from 'zod'
import { type ResultType, generateFakePrint, requestSchema } from './baseSWService'

const broadcastChannelEvent = createService<BroadcastChannelCtx>()

export const generateBroadcastChannelCtx = () =>
  broadcastChannelEvent(
    () => ({}),
    (ctx) => ({
      broadcast: (result: unknown, info) => {
        const { data, success } = requestSchema.safeParse(result)
        const { broadcast, print } = ctx
        if (success) {
          print?.(generateFakePrint(data, 'broadcast'))
          broadcast?.(data, info)
        }
      },
    })
  )

export type BroadcastChannelCtx = {
  broadcast: (
    data: z.infer<typeof requestSchema>,
    info?: Pick<MessageItem, 'requestId' | 'sign'>
  ) => void
  print: (data: Awaited<ResultType>) => void
}
