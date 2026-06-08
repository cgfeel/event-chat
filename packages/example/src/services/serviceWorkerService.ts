import { itemSchema } from '@/fields/chatField'
import { serviceScopeParent } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import { createCtx, createService } from '@event-chat/rpc/react'
import z from 'zod'
import { receiptStore } from '@/components/chatLine/receiptStore'
import {
  type WorkerMessage,
  requestSchema,
  resultSchema,
  sendMessage,
  transmitResult,
} from './baseSWService'

const brodcastScope = (ctx: Partial<ParentCtxType>) => ({
  brodcast: async (data: unknown) => {
    const { data: body, success } = requestSchema.safeParse(data)
    if (!success) return

    const { result } = await sendMessage(body)
    if (result) ctx.transmit?.(result)
  },
})

const iframeEvent = createService<ParentCtxType>()

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

export { iframeCtx, mainCtx, parentCtx, resultSchema, workerCtx }

export type ParentCtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  scope: string
  broadcat: (detail: unknown, info?: BroadcatInfo) => void
  publish: (detail: z.infer<typeof itemSchema>) => void
  transmit: (result: z.infer<typeof resultSchema>, single?: boolean) => void
}

type BroadcatInfo = Partial<Record<'requestId' | 'sign', string>>
