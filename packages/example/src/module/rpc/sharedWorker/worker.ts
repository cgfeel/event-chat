/// <reference lib="webworker" />
import { type MessagePortCtx, generateWorkerCtx, mainConsume } from '@/services/sharedWorkerService'
import { obseverShareWorkerGlobalScopeRPC } from '@event-chat/rpc/sharedWorkerGlobalScope'
import { sharedGroup } from '../uitls'

declare const self: SharedWorkerGlobalScope
const target = self

const { brodcastScope } = obseverShareWorkerGlobalScopeRPC(target, () => {
  const workerCtx = generateWorkerCtx()
  return {
    context: {
      config: { channel: sharedGroup },
      brodcast: workerCtx.brodcasts,
      consume: mainConsume.actions,
      event: workerCtx.actions,
    },
    provider: ([rpc]) => {
      const print: MessagePortCtx['print'] = (payload, req) => {
        const { broadcast } = req ?? {}
        if (broadcast === 'transmit') {
          brodcastScope({ payload: req })
        } else {
          rpc.request('sendMessage', { payload }).catch(() => {})
        }
      }
      workerCtx.provider({ print })
    },
  }
})
