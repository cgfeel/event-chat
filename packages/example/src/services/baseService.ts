import type { SendMessage } from '@/fields/chatField'
import type { useEventChat } from '@event-chat/core'
import type { RPCInstanceContextIns } from '@event-chat/rpc/react'
import { receiptStore } from '@/components/chatLine/receiptStore'

export const ChartName = 'chat-scroll'

export const baseChatServer = (
  item: SendMessage,
  { card, name, emit }: Partial<Pick<CtxType, 'card' | 'emit' | 'name'>>
) => {
  const { receipt } = item
  receiptStore.hold(receipt)

  emit?.({
    detail: {
      broadcast: item.status === 'broadcast',
      busy: item.status === 'busy',
      date: item.date,
      message: item.message,
      own: item.name === name,
      user: item.name,
      card,
      receipt,
    },
    name: ChartName,
  })
  return receipt
}

export const baseServer = (ctx: Partial<CtxType>) => ({
  getUserInfo: () => ({
    name: ctx.name,
    page: ctx.page,
    status: 'success',
  }),
  sendChat: (item: SendMessage) => baseChatServer(item, ctx),
})

export type CtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> &
  Pick<RPCInstanceContextIns, 'brodcastScope'> & {
    name: string
    page: string
    card?: number
  }
