import {
  IframeSerializeOptions,
  ListenerType,
  MessageInfo,
  MessageItem,
  Transport,
} from '../fields'

abstract class BaseTransport<
  T extends TargetType = TargetType,
  ONLYBD extends boolean = false,
> implements Transport<ONLYBD> {
  readonly onlyBrod?: ONLYBD
  constructor(
    protected _target: T,
    protected _options: FactoryOptions = {}
  ) {}

  // 只有 window 需要对比
  allow(origin: string, current?: string[]) {
    return origin ? true : (current?.length ?? 0) > -1
  }

  getType() {
    return `${Object.prototype.toString.call(this._target)}`
  }

  is(source: MessageInfo['source']) {
    return !(source instanceof BaseTransport)
  }

  originFilter(origin?: string[]) {
    return origin
  }

  upset(options: FactoryOptions) {
    this._options = { ...this._options, ...options }
  }

  // 通过 Decorator 调用，注销实例顺序：RPCAction - BaseTransport
  // RPCAction 注销前会先 onremove
  abstract destroy(): void

  // 关闭顺序：hooks - 主线程虚拟 Dom - Dom - 主线程（worker 等） - worker 分支线程
  // 观察设计：只被动观察接受消息，不主动向对应线程通知，避免混乱；(每个 RPC 有心跳检测)
  abstract observe(close?: () => void): void
  abstract onmessage(listener: ListenerType): void

  // 只提供监听、移除的方法，记录方法的事件需要外部处理
  abstract onremove(listener: ListenerType): void
  abstract postMessage(message: MessageItem, options?: IframeSerializeOptions): Promise<unknown>
}

export default BaseTransport

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
  // 只有 window 和 webSocket 观察者用于监控
  observer?: () => unknown
}

// WindowClient 和 Client 是 ServerWork 内部事件回调方法中的对象，暂且不用
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
export type TargetType =
  | BroadcastChannel
  | MessagePort
  | WebSocket
  | Window
  //   | ServiceWorkerContainer
  | ServiceWorkerRegistration
  | ServiceWorkerGlobalScope
  | SharedWorker
  | SharedWorkerGlobalScope
  | Worker
  | DedicatedWorkerGlobalScope
