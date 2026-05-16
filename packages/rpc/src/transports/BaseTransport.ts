import { IframeSerializeOptions, ListenerType, Transport } from '../fields'

// 目前不建议主动监听 target 线程是否在外部发起关闭，仅通过心跳决定是否在线
// - worker 每次注销必定关闭线程，而 window 有可能因跨域拿不到实际结果
// - 注销节省的资源只有定时心跳检测，实例并没有注销，为了统一处理，由组件或 woker 自身决定注销对象

abstract class BaseTransport<
  T extends TargetType = TargetType,
  ONLYBD extends boolean = false,
> implements Transport<ONLYBD> {
  readonly onlyBrod?: ONLYBD
  constructor(
    protected _target: T,
    protected _options: FactoryOptions = {}
  ) {}

  getType() {
    return `${Object.prototype.toString.call(this._target)}`
  }

  // 只有 window 需要对比 source
  is(source: MessageEventSource | null) {
    return !(source instanceof BaseTransport)
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
  abstract postMessage(message: unknown, options?: IframeSerializeOptions): void
}

export default BaseTransport

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
  // 只有 window 和 webSocket 需要观察者用于监控
  observer?: () => unknown
}

// WindowClient 和 Client 是 ServerWork 内部事件回调方法中的对象，暂且不用
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
export type TargetType =
  | BroadcastChannel
  | WebSocket
  | Window
  //   | ServiceWorkerContainer
  | ServiceWorkerRegistration
  | ServiceWorkerGlobalScope
  | SharedWorker
  | SharedWorkerGlobalScope
  | Worker
  | DedicatedWorkerGlobalScope
