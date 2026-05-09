import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程，跨窗口、跨 iframe 通信：HTMLIFrameElement.contentWindow, Window, Window.parent, window.open
class WindowTransport extends BaseTransport<Window> {
  // 不主动监听外部 iframe 是否以销毁，以心跳检测为准，有可能因为跨域拿到不准
  destroy() {
    // window 通过 onremove 注销
  }

  // 只有 window 需要对比 source
  is(source: MessageEventSource | null) {
    return Object.is(this._target, source)
  }

  onmessage(listener: ListenerType): void {
    window.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    window.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer, targetOrigin = '*' } = options ?? {}
    this._target.postMessage(message, {
      targetOrigin,
      transfer,
    })
  }
}

export default WindowTransport
