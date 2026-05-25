import { createContext } from 'react'
import RPCAction, { RequestOptions } from '../core/RPCAction'
import { Transport, WINDOW_NAME } from '../fields'
import { ValueOf } from '../utils'

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

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
}

export interface RPCInstanceContextIns {
  brodcastScope?: <T>(data: RequestOptions<T>, options?: ScopeProps) => void
  mount?: (item: RPCItem, name?: string) => void
}

export type RPCItem =
  | (Pick<RPCAction, 'broadcast'> & Pick<Transport<boolean>, 'getType'>)
  | Record<never, never>

export type ScopeProps = {
  exclude?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  include?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  typein?: string[]
  typeout?: string[]
}
