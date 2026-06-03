import type { useEventChat } from '@event-chat/core'
import { createCtx } from '@event-chat/rpc/react'

const printOffscreenCanvas = () => {
  return ''
}

export const transferCtx = createCtx((ctx: Partial<TransferCtxType>) => ({
  sendMessage: ({ transfer }: MessageDataType, info) => {
    const { ports } = info ?? {}
    const mport = ports?.filter((item) => item instanceof MessagePort) ?? []
    const list = transfer ? [transfer].concat(mport) : mport

    list.forEach((item) => {
      if (item instanceof OffscreenCanvas) {
        const detail = printOffscreenCanvas()
        ctx.emit?.({ name: 'item-chat', detail })
      }
    })
  },
}))

export type TransferCtxType = Pick<ReturnType<typeof useEventChat>, 'emit'>
type MessageDataType = { transfer?: Transferable }
