import { createService } from '@event-chat/rpc'
import { generateFakePrint, requestSchema } from './baseSWService'

const messagePortEvent = createService<MessagePortCtx>()
export const webSocketCtx = messagePortEvent(
  () => ({}),
  (ctx) => ({
    sendMessage: (req: unknown) => {
      const { data, success } = requestSchema.safeParse(req)
      if (success) ctx.print?.(generateFakePrint(data, 'webSocket'))
    },
  })
)

export type MessagePortCtx = {
  print: (info: ResultType) => void
}

// type RequestType = z.infer<typeof requestSchema>
type ResultType = ReturnType<typeof generateFakePrint>
