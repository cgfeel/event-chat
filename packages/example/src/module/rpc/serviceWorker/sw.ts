/// <reference lib="webworker" />
import { mainCtx, workerCtx } from '@/services/serviceWorkerService'
import { createServiceWorkerGlobalScopeRPC } from '@event-chat/rpc/serviceWorkerGlobalScope'
import { serviceWorkerGroup } from '../uitls'

declare const self: ServiceWorkerGlobalScope
const target = self

const [rpc] = createServiceWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: serviceWorkerGroup },
    brodcast: workerCtx.brodcasts,
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

workerCtx.provider({
  // 可以用 rpc.broadcast，但一个 worker 内部单独线程不共享，广播更适用于主线程
  // 在 worker.js 中演示了 rpc.broadcast，为了方便这里用统一使用 request
  transmit: (payload, single) => {
    const transmit = single
      ? undefined
      : () =>
          self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
          })

    rpc.request('sendMessage', { payload, transmit }).catch(() => {})
  },
})

// 将其当做 module，declare 只在当前有效
export {}
