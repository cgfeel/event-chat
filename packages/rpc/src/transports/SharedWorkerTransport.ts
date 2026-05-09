import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程 → 共享 Worker，多页面共享一个 Worker 线程：SharedWorker
class SharedWorkerTransport extends BaseTransport<SharedWorker> {
  destroy() {
    this._target.port.close()
  }

  onmessage(listener: ListenerType): void {
    this._target.port.addEventListener('message', listener, this._options.message)
    this._target.port.start()
  }

  onremove(listener: ListenerType): void {
    this._target.port.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.port.postMessage(message, { transfer })
  }
}

export default SharedWorkerTransport
