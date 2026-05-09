import { ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程，同源跨标签/窗口：BroadcastChannel
class BroadcastChannelTransport extends BaseTransport<BroadcastChannel> {
  destroy() {
    this._target.close()
  }

  onmessage(listener: ListenerType): void {
    this._target.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown): void {
    this._target.postMessage(message)
  }
}

export default BroadcastChannelTransport
