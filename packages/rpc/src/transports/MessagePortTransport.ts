import { IframeSerializeOptions, ListenerType, MessageItem, ProxyPromise } from '../fields'
import BaseTransport from './BaseTransport'

class MessagePortTransport extends BaseTransport<MessagePort> {
  destroy() {
    this._target.close()
  }

  // 和 ServiceWorkerRegistrationTransport 一样得不到准确的结果
  observe(): void {}

  onmessage(listener: ListenerType): void {
    this._target.addEventListener('message', listener, this._options.message)
    this._target.start()
  }

  onremove(listener: ListenerType): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: MessageItem, options?: IframeSerializeOptions) {
    const { transfer } = options ?? {}
    return ProxyPromise.try(() => this._target.postMessage(message, { transfer }))
  }
}

export default MessagePortTransport
