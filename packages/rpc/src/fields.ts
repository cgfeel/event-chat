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

export const WINDOW_NAME = '[object Window]'

export const getError = (error: unknown, tips = 'unknown error.') =>
  (error instanceof Error || error instanceof DOMException ? error : undefined) ??
  (typeof error === 'string' ? new Error(error) : undefined) ??
  new Error(
    error instanceof Object && 'message' in error && typeof error.message === 'string'
      ? error.message
      : tips,
    {
      cause: error,
    }
  )

// 需要根据业务提供类型去推导，保留 any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function promiseTryPolyfill<T, A extends any[]>(
  fn: (...args: A) => T | PromiseLike<T>,
  ...args: A
): Promise<T> {
  try {
    return Promise.resolve(fn(...args))
  } catch (error) {
    return Promise.reject(getError(error))
  }
}

export const ProxyPromise = new Proxy(Promise, {
  get(target: PromiseConstructor, propKey: keyof PromiseConstructor | 'try') {
    if (propKey === 'try') {
      return 'try' in target ? target.try : promiseTryPolyfill
    }
    return target[propKey]
  },
}) as PromiseConstructor & {
  try: typeof promiseTryPolyfill
}

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
  allow: (origin: string, current?: string[]) => boolean
  destroy: () => void
  getType: () => string
  is: (source: MessageInfo['source'], message?: MessageItem) => boolean
  observe: (close?: () => void) => void
  onmessage: (listener: ListenerType) => void
  onremove: (listener: ListenerType) => void
  originFilter: (origin?: string[]) => string[] | undefined
  postMessage: (message: MessageItem, options?: IframeSerializeOptions) => Promise<unknown>
  upset: (options: FactoryOptions) => void
  onlyBrod?: ONLYBD
}

export type IframeSerializeOptions = StructuredSerializeOptions & {
  targetOrigin?: string
  transmit?: () => Promise<readonly WindowClient[]>
}

export type ListenerType = (ev: MessageInfo) => void
export type MessageInfo = Pick<MessageEvent, 'data' | 'origin' | 'ports'> & {
  source: MessageEventSource | Client | null
  wait?: () => void
}

export type RPCItem = Pick<RPCAction, 'broadcast'> & Pick<RPCFactory, 'getType'>

export type ScopeProps = {
  exclude?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  include?: Array<ValueOf<typeof TARGET_TYPE_STRINGS>>
  typein?: string[]
  typeout?: string[]
}
