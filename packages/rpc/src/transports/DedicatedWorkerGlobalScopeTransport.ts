import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程给子线程发消息：Worker
class DedicatedWorkerGlobalScopeTransport extends BaseTransport<DedicatedWorkerGlobalScope> {
  // 主线程 worker.terminate 是监听不到 close，以心跳为准
  destroy() {
    // DedicatedWorkerGlobalScope 内部不用注销，由外部 self.close 处理
  }

  onmessage(listener: ListenerType): void {
    this._target.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.postMessage(message, { transfer })
  }
}

export default DedicatedWorkerGlobalScopeTransport
