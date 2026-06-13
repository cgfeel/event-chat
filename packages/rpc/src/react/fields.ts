import { createContext } from 'react'
import { RPCIns, observerRPC } from '../core/observerRPC'
import { WINDOW_NAME } from '../fields'

export const RPCInstanceContext = createContext<RPCInstanceContextIns>({})
export const TARGET_TYPE_STRINGS = Object.freeze({
  BroadcastChannel: '[object BroadcastChannel]',
  WebSocket: '[object WebSocket]',
  Window: WINDOW_NAME,
  ServiceWorkerRegistration: '[object ServiceWorkerRegistration]',
  ServiceWorkerGlobalScope: '[object ServiceWorkerGlobalScope]',
  SharedWorker: '[object SharedWorker]',
  SharedWorkerGlobalScope: '[object SharedWorkerGlobalScope]',
  Worker: '[object Worker]',
  DedicatedWorkerGlobalScope: '[object DedicatedWorkerGlobalScope]',
})

export interface RPCInstanceContextIns extends BrodcastType {
  mount?: (item: RPCItem, name?: string) => void
}

type BrodcastType = Partial<Pick<ReturnType<typeof observerRPC>, 'brodcastScope'>>
type RPCItem = RPCIns | Record<never, never>
