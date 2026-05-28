/// <reference lib="webworker" />
import { mainCtx, portWorkerCtx, workerCtx } from '@/services/messagePortService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'
import { messageGroup, messagePortWeb } from '../uitls'

declare const self: DedicatedWorkerGlobalScope
const defaultDestroy = () => {}

const target = self
const portRef = {
  destroy: defaultDestroy,
}

const [rpc] = createDedicatedWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: messageGroup },
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

workerCtx.provider({
  scope: messagePortWeb,
  connect: (instance) => {
    const [, destroy] = instance ?? []
    if (destroy) portRef.destroy = destroy
    rpc.request('connect').catch(() => {})
  },
  destroy: (payload) => {
    rpc.request('destroy', { payload }).catch(() => {})
  },
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
