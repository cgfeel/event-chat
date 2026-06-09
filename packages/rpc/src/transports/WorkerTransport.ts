import { IframeSerializeOptions, ListenerType, MessageItem, ProxyPromise } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程给子线程发消息：Worker
class WorkerTransport extends BaseTransport<Worker> {
  // 没有提供监听 worker 内部是否 close 的监听方法，以心跳为准
  destroy() {
    this._target.terminate()
  }

  // 如果加载失败由 hooks 通过 catch 捕获
  // this._target.onerror 无法区分 worker 状态，抛出异常有可能是因为某项任务就需要抛异常
  observe(): void {}

  onmessage(listener: ListenerType): void {
    this._target.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: MessageItem, options?: IframeSerializeOptions) {
    const { transfer } = options ?? {}
    return ProxyPromise.try(() => this._target.postMessage(message, { transfer }))
  }
}

export default WorkerTransport
