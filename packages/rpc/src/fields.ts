import { createContext } from 'react'
import RPCAction, { RequestOptions } from './RPCAction'
import RPCFactory from './RPCFactory'
import { ValueOf } from './utils'

export const RPCInstanceContext = createContext<RPCInstanceContextIns>({})
export const TARGET_TYPE_STRINGS = Object.freeze({
  BroadcastChannel: '[object BroadcastChannel]',
  WebSocket: '[object WebSocket]',
  Window: '[object Window]',
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

export interface Transport {
  destroy: () => void
  getType: () => string
  is: (source: MessageEventSource | null) => boolean
  onmessage: (listener: ListenerType) => void
  onremove: (listener: ListenerType) => void
  postMessage: (message: unknown, options?: IframeSerializeOptions) => void
  upset: (options: FactoryOptions) => void
}

export type IframeSerializeOptions = StructuredSerializeOptions & {
  targetOrigin?: string
  transmit?: () => Promise<readonly WindowClient[]>
}

export type ListenerType = (
  ev: Pick<MessageEvent, 'data' | 'origin' | 'ports' | 'source'> & { wait?: () => void }
) => void

export type RPCItem = Pick<RPCAction, 'broadcast'> & Pick<RPCFactory, 'getType'>

export type ScopeProps = {
  exclude?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  include?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  typein?: string[]
  typeout?: string[]
}
