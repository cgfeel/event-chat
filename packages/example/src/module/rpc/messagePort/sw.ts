/// <reference lib="webworker" />
import { sendMessage } from '@/services/baseSWService'
import { mainCtx, portWorkerCtx, workerCtx } from '@/services/messagePortService'
import { createServiceWorkerGlobalScopeRPC } from '@event-chat/rpc/serviceWorkerGlobalScope'
import { messageGroup } from '../uitls'

declare const self: ServiceWorkerGlobalScope
const target = self

const [rpc] = createServiceWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: messageGroup },
    brodcast: workerCtx.brodcasts,
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

portWorkerCtx.provider({
  filter: (data) => {
    const receivedBody = { ...data, message: `${data.message}-(transmit:sw-port)` }
    return sendMessage(receivedBody)
      .then((payload) => {
        rpc.request('sendMessage', { payload }).catch(() => {})
        return payload
      })
      .catch(() => ({
        message: 'sw-fetch-faild',
        result: {
          code: -1,
          data: {
            date: new Date(),
            id: Date.now(),
            name: 'msw',
          },
          message: `${data.message}-(transmit:sw-port)`,
          receivedBody,
        },
      }))
  },
})

// 将其当做 module，declare 只在当前有效
export {}
