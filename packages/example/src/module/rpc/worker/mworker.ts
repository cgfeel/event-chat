/// <reference lib="webworker" />
import { mainCtx, portWorkerCtx, workerCtx } from '@/services/messagePortService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'
import { messageGroup } from '../uitls'

declare const self: DedicatedWorkerGlobalScope
const target = self

const [rpc] = createDedicatedWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: messageGroup },
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

portWorkerCtx.provider({
  filter: (receivedBody) => {
    const payload = {
      message: 'success',
      result: {
        code: 200,
        data: {
          date: new Date(),
          id: Date.now(),
          name: 'mworker',
        },
        message: `${receivedBody.message}-(transmit:ww-port)`,
        receivedBody,
      },
    }

    rpc.request('sendMessage', { payload }).catch(() => {})
    return Promise.resolve(payload)
  },
})

// 将其当做 module，declare 只在当前有效
export {}
