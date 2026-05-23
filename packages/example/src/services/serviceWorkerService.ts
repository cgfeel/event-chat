import { serviceScopeParent } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import { createCtx, createService } from '@event-chat/rpc/react'
import z from 'zod'
import type { itemSchema } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'

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

const brodcastScope = (ctx: Partial<ParentCtxType>) => ({
  brodcast: async (data: unknown) => {
    const { data: body, success } = requestSchema.safeParse(data)
    if (!success) return

    const { result } = await sendMessage(body)
    if (result) ctx.transmit?.(result)
  },
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
      const { data: result, error, success } = resultSchema.safeParse(res)
      return success
        ? {
            message: 'success',
            result,
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
          user: scope,
          receipt: receipt ?? '',
        }
  } catch {
    return { ...defaultDetail, message: 'JSON Parse Faild' }
  }
}

const iframeCtx = iframeEvent(
  (ctx) => ({
    broadcast: (detail: string) => {
      const { scope, emit } = ctx
      if (scope) emit?.({ name: `item-${scope}`, detail })
    },
    sendMessage: (detail: z.infer<typeof resultSchema>) => {
      const { scope, emit } = ctx
      if (scope) {
        emit?.({ name: `chat-${scope}`, detail })
      }
    },
  }),
  (ctx) => ({
    broadcat: (detail, info) => {
      const { data, success } = requestSchema.safeParse(detail)
      const { scope, broadcat } = ctx
      if (scope && success) broadcat?.({ ...data, scope }, info)
    },
  })
)

const mainCtx = createCtx((ctx: Partial<ParentCtxType>) => ({
  sendMessage: (result: z.infer<typeof resultSchema>) => {
    const { scope, emit, publish } = ctx
    if (scope) {
      const detail = transmitResult({
        message: 'success',
        scope: scope.split('-').pop() ?? '',
        result: {
          ...result,
          receivedBody: !result.receivedBody
            ? undefined
            : {
                ...result.receivedBody,
                receipt: receiptStore.addReceipt(),
              },
        },
      })

      emit?.({ detail, name: scope })
      publish?.(detail)
    }
  },
}))

const parentCtx = createCtx(
  (ctx: Partial<ParentCtxType>) => ({
    sendMessage: (detail: z.infer<typeof itemSchema>) => {
      ctx.emit?.({
        name: `chat-${serviceScopeParent}`,
        detail: { ...detail, own: false, user: `iframe:${detail.user}` },
      })
    },
  }),
  (ctx: Partial<ParentCtxType>) => ({
    brodcast: (detail: unknown, info?: BroadcatInfo) => {
      ctx.broadcat?.(detail, info)
    },
  })
)

const workerCtx = createCtx(
  (ctx: Partial<ParentCtxType>) => ({
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
  }),
  brodcastScope
)

export { iframeCtx, mainCtx, parentCtx, resultSchema, workerCtx, transmitResult }

export type ParentCtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  scope: string
  broadcat: (detail: unknown, info?: BroadcatInfo) => void
  publish: (detail: z.infer<typeof itemSchema>) => void
  transmit: (result: z.infer<typeof resultSchema>) => void
}

type BroadcatInfo = Partial<Record<'requestId' | 'sign', string>>

type TransmitResultProps = Awaited<ReturnType<typeof sendMessage>> & { scope: string }

type WorkerMessage = z.infer<typeof requestSchema>
