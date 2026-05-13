import { serviceScopeParent } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import { createCtx, createService } from '@event-chat/rpc/react'
import z from 'zod'
import type { itemSchema } from '@/components/chatLine'

const URL =
  process.env.NODE_ENV !== 'production'
    ? '/'
    : 'https://m1.apifoxmock.com/m1/6364923-6061111-default/'

const requestSchema = z.object({
  broadcast: z.string(),
  message: z.string(),
  receipt: z.string(),
  scope: z.string(),
})

const resultSchema = z.object({
  code: z.number(),
  data: z.object({
    date: z.iso.datetime().transform((str) => new Date(str)),
    id: z.number(),
    name: z.string(),
  }),
  message: z.string(),
  receivedBody: requestSchema.optional(),
})

const iframeEvent = createService<ParentCtxType>()
const sendMessage = (data: WorkerMessage) =>
  fetch(`${URL}api/health`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      const { data: resData, error, success } = resultSchema.safeParse(res)
      return success
        ? {
            result: resData,
            message: 'success',
          }
        : {
            message: error.issues.slice(-1)[0].message,
            result: null,
          }
    })

const transmitResult = ({
  message,
  result,
  scope,
}: TransmitResultProps): z.infer<typeof itemSchema> => {
  const defaultDetail = {
    date: new Date(),
    message,
    own: false,
    user: scope,
    receipt: '',
  }

  try {
    const receipt = result?.receivedBody?.receipt
    return !result
      ? defaultDetail
      : {
          broadcast: result.receivedBody?.broadcast !== 'normal',
          date: result.data.date,
          message: JSON.stringify(result),
          own: result.receivedBody?.scope === scope,
          user: result.receivedBody?.scope ?? scope,
          receipt: receipt ?? '',
        }
  } catch {
    return { ...defaultDetail, message: 'JSON Parse Faild' }
  }
}

const iframeCtx = iframeEvent((ctx) => ({
  broadcast: (detail: string) => {
    const { scope, emit } = ctx
    if (scope) emit?.({ name: scope, detail })
  },
}))

const mainCtx = createCtx((ctx: Partial<ParentCtxType>) => ({
  sendMessage: (result: z.infer<typeof resultSchema>) => {
    const { scope, emit, publish } = ctx
    if (scope) {
      const detail = transmitResult({ message: 'success', result, scope })
      emit?.({ detail, name: scope })
      publish?.(detail)
    }
  },
}))

const parentCtx = createCtx(
  (ctx: Partial<ParentCtxType>) => ({
    sendMessage: (detail: z.infer<typeof itemSchema>) => {
      ctx.emit?.({ name: `chat-${serviceScopeParent}`, detail })
    },
  }),
  () => ({})
)

const workerCtx = createCtx((ctx: Partial<WorkerCtx>) => ({
  transmit: async (data: WorkerMessage) => {
    try {
      const { message, result } = await sendMessage(data)
      if (result) {
        ctx.transmit?.(result)
        return [true, message] as const
      }
      return [false, message] as const
    } catch (error) {
      return [false, error instanceof Error ? error.message : 'unknown error'] as const
    }
  },
  sendMessage,
}))

export { iframeCtx, mainCtx, parentCtx, workerCtx, transmitResult }

export type ParentCtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  scope: string
  publish?: (detail: z.infer<typeof itemSchema>) => void
}

type TransmitResultProps = Awaited<ReturnType<typeof sendMessage>> & { scope: string }

type WorkerMessage = z.infer<typeof requestSchema>

type WorkerCtx = {
  transmit: (result: z.infer<typeof resultSchema>) => void
}
