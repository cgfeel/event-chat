/// <reference lib="webworker" />
import { mainCtx, workerChatCtx } from '@/services/workerService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'
import { itemSchema } from '@/components/chatLine'

declare const self: DedicatedWorkerGlobalScope

const target = self
const recordRef = {
  name: crypto.randomUUID().toString(),
}

const origin = `worker:${recordRef.name}`

export const createWebWorker = (channel = 'worker') => {
  const [rpc] = createDedicatedWorkerGlobalScopeRPC(target, {
    context: {
      brodcast: workerChatCtx.brodcasts,
      config: { channel },
      consume: mainCtx.actions,
      event: workerChatCtx.actions,
    },
  })

  workerChatCtx.provider({
    name: origin,
    page: 'worker:dedicatedWorkerGlobalScope',
    brodcastScope: (data) => rpc.broadcast(data),
    emit: ({ detail }) => {
      const { data, success } = itemSchema.safeParse(detail)
      if (success) {
        rpc
          .request('sendChat', {
            payload: {
              date: new Date(),
              message: `Message read, feedback from worker: ${recordRef.name}, origin name: ${origin}`,
              name: recordRef.name,
              receipt: data.receipt,
              recipient: recordRef.name,
              status: 'normal',
            },
          })
          .catch(() => {})
      }
    },
    getName: () => `worker:${recordRef.name}`,
    updateName: (name) => {
      recordRef.name = !name ? crypto.randomUUID() : name
      return `worker:${recordRef.name}`
    },
  })
}

// 将其当做 module，declare 只在当前有效
export {}
