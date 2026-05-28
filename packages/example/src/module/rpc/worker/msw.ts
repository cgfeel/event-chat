/// <reference lib="webworker" />
import { mainCtx, portWorkerCtx, workerCtx } from '@/services/messagePortService'
import { createServiceWorkerGlobalScopeRPC } from '@event-chat/rpc/serviceWorkerGlobalScope'
import { messageGroup, messagePortService } from '../uitls'

declare const self: ServiceWorkerGlobalScope
const defaultDestroy = () => {}

const target = self
const portRef = {
  destroy: defaultDestroy,
}

const [rpc] = createServiceWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: messageGroup },
    brodcast: workerCtx.brodcasts,
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

workerCtx.provider({
  scope: messagePortService,
  connect: (instance) => {
    const [, destroy] = instance ?? []
    if (destroy) portRef.destroy = destroy
    rpc.request('connect').catch(() => {})
  },
  destroy: (payload) => {
    rpc.request('destroy', { payload }).catch(() => {})
  },
  // 可以用 rpc.broadcast，但一个 worker 内部单独线程不共享，广播更适用于主线程
  // 在 worker.js 中演示了 rpc.broadcast，为了方便这里用统一使用 request
  //   transmit: (payload, single) => {
  //     const transmit = single
  //       ? undefined
  //       : () =>
  //           self.clients.matchAll({
  //             type: 'window',
  //             includeUncontrolled: true,
  //           })
  //     rpc.request('sendMessage', { payload, transmit }).catch(() => {})
  //   },
})

portWorkerCtx.provider({
  destroy: () => {
    rpc
      .request('destroy', { payload: undefined })
      .then(() => {
        portRef.destroy()
        portRef.destroy = defaultDestroy
      })
      .catch(() => {})
  },
})

// 将其当做 module，declare 只在当前有效
export {}
