import { IframeSerializeOptions, ListenerType, MessageItem } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程，跨窗口、跨 iframe 通信：HTMLIFrameElement.contentWindow, Window, Window.parent, window.open
class WindowTransport extends BaseTransport<Window> {
  private _errorHandle: ((args: ErrorProps) => void) | null = null
  destroy() {
    this._errorHandle?.({ isDestroy: true })
  }

  // source 和 iframe.contentWidow 比
  is(source: MessageEventSource | null) {
    return Object.is(this._target, source)
  }

  onmessage(listener: ListenerType): void {
    window.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    window.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: MessageItem, options?: IframeSerializeOptions): void {
    const { transfer, targetOrigin = '*' } = options ?? {}
    this._target.postMessage(message, {
      targetOrigin,
      transfer,
    })
  }

  // 不要试图通过 element.isConnected 判断 iframe 是否存在 Dom 中，因为有可能暂时放入了 DocumentFragment
  observe(close?: () => void) {
    const element = this._options.observer?.()
    if (!(element instanceof HTMLIFrameElement) || !Object.is(element.contentWindow, this._target))
      return

    if (element) {
      const errorHandle = (error: Partial<ErrorEvent> & ErrorProps) => {
        // 加载失败就直接放弃监听，只能重新创建实例
        element.removeEventListener('error', errorHandle)
        if (!error.isDestroy) close?.()
      }

      // error 事件几乎永远不触发，只有 src 是非法、无法解析的地址时，才会触发 error
      // 无论 iframe 加载 404、500、网络中断、域名无效，浏览器都会自动渲染一个错误页面
      element.addEventListener('error', errorHandle)
      this._errorHandle = errorHandle
    }
  }
}

export default WindowTransport

type ErrorProps = { isDestroy?: boolean }
