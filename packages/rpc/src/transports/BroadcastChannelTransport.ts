import { ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程，同源跨标签/窗口：BroadcastChannel
class BroadcastChannelTransport extends BaseTransport<BroadcastChannel, true> {
  override readonly onlyBrod = true

  destroy() {
    this._target.close()
  }

  // 广播不存在线程关闭
  observe(): void {}

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
