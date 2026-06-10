import { IframeSerializeOptions, ListenerType, MessageItem } from '../fields'
import { ProxyPromise } from '../utils'
import BaseTransport from './BaseTransport'

// 共享 Worker 内部，共享 Worker 收发所有页面消息：SharedWorkerGlobalScope
class SharedWorkerGlobalScopeTransport extends BaseTransport<SharedWorkerGlobalScope> {
  private _onconnect = Promise.resolve<MessagePort | null>(null)
  private _message: ((event: MessageEvent) => void) | undefined

  destroy() {
    this._onconnect.then((messagePort) => messagePort?.close()).catch(() => {})
    if (this._message) {
      this._target.removeEventListener('connect', this._message)
    }
  }

  observe(): void {}

  onmessage(listener: ListenerType): void {
    const SharedWorker = this._target
    this._onconnect = new Promise((resolve) => {
      this._message = (event: MessageEvent) => {
        const port = event.ports[0]
        resolve(port)

        port.addEventListener('message', listener, this._options.message)
        port.start()
      }

      SharedWorker.addEventListener('connect', this._message)
    })
  }

  onremove(listener: ListenerType): void {
    this._onconnect
      .then((messagePort) => {
        messagePort?.removeEventListener('message', listener, this._options.message)
      })
      .catch(() => {})
  }

  postMessage(message: MessageItem, options?: IframeSerializeOptions) {
    const { transfer } = options ?? {}
    return this._onconnect?.then((messagePort) =>
      ProxyPromise.try(() => messagePort?.postMessage(message, { transfer }))
    )
  }
}

export default SharedWorkerGlobalScopeTransport
