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

export type MessageItem = {
  __RPC__?: string // 过滤外部消息
  broadcast?: boolean
  channel?: string // 同实例情况下，通过 channel 区分
  error?: string
  heartbeat?: boolean
  kind?: 'request' | 'response'

  // 广播用于验证接收情况、相同 scope 消息下用 requestId 来区分，心跳不需要请求 id
  requestId?: string
  payload?: unknown
  scope?: string // service worker 允许同 scope 利用 active 实例发送
  sign?: string
  type?: PropertyKey
}

export interface RPCInstanceContextIns {
  brodcastScope?: <T>(data: RequestOptions<T>, options?: ScopeProps) => void
  mount?: (item: RPCItem, name?: string) => void
}

export interface Transport<ONLYBD extends boolean = false> {
  destroy: () => void
  getType: () => string
  is: (source: MessageEventSource | null, message?: MessageItem) => boolean
  observe: (close?: () => void) => void
  onmessage: (listener: ListenerType) => void
  onremove: (listener: ListenerType) => void
  postMessage: (message: MessageItem, options?: IframeSerializeOptions) => void
  upset: (options: FactoryOptions) => void
  onlyBrod?: ONLYBD
}

export type IframeSerializeOptions = StructuredSerializeOptions & {
  targetOrigin?: string
  transmit?: () => Promise<readonly WindowClient[]>
}

export type ListenerType = (
  ev: Pick<MessageEvent, 'data' | 'origin' | 'ports' | 'source'> & {
    wait?: () => void
  }
) => void

export type RPCItem = Pick<RPCAction, 'broadcast'> & Pick<RPCFactory, 'getType'>

export type ScopeProps = {
  exclude?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  include?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  typein?: string[]
  typeout?: string[]
}
