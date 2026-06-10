import { ActionRecord, DecoratorContext } from './core/RPCDecorator'

export const WINDOW_NAME = '[object Window]'

export interface EntryOptions<EVENT extends ActionRecord, CONSUME extends ActionRecord> {
  options?: FactoryOptions
  context?: DecoratorContext<EVENT, CONSUME>
}

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
  // 只有 window 和 webSocket 观察者用于监控
  observer?: () => unknown
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
