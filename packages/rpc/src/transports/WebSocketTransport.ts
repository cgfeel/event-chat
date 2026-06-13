import { ListenerType, MessageItem } from '../fields'
import { ProxyPromise } from '../utils'
import BaseTransport from './BaseTransport'

// 主线程：WebSocket client
class WebSocketTransport extends BaseTransport<WebSocket> {
  private _onconnect = Promise.resolve(false)
  private _closeHandle: (() => void) | undefined
  private _messageHandle: ((event: MessageEvent) => void) | undefined

  destroy() {
    this._closeHandle = undefined
    if (this._target.readyState === WebSocket.OPEN) this._target.close()
  }

  observe(close?: () => void): void {
    if (close) {
      this._closeHandle = close
      this._target.addEventListener('close', this._closeHandle, { once: true })
    }
  }

  onmessage(listener: ListenerType): void {
    this._onconnect = new Promise((resolve) => {
      const handleConnect = (event: Event) => {
        this._target.removeEventListener('open', handleConnect)
        this._target.removeEventListener('close', handleConnect)
        resolve(event.type === 'open')
      }
      this._target.addEventListener('open', handleConnect, { once: true })
      this._target.addEventListener('close', handleConnect, { once: true })
    })

    // 只处理 string 类型转换 JSON 数据，只要符合条件，将其视为 MessageInfo
    this._messageHandle = (event) => {
      try {
        if (typeof event.data === 'string') {
          listener({
            data: JSON.parse(event.data),
            origin: event.origin,
            ports: event.ports,
            source: event.source,
          })
        }
      } catch {
        // none
      }
    }

    this._target.addEventListener('message', this._messageHandle, this._options.message)
  }

  onremove(): void {
    if (this._messageHandle) {
      this._target.removeEventListener('message', this._messageHandle, this._options.message)
      this._messageHandle = undefined
    }
  }

  postMessage(message: MessageItem) {
    const target = this._target
    return this._onconnect.then((open) =>
      ProxyPromise.try(() => {
        if (open) target.send(JSON.stringify(message))
      })
    )
  }
}

export default WebSocketTransport

// function isSafeBufferSource(data: unknown): data is ArrayBuffer | ArrayBufferView<ArrayBuffer> {
//   return (
//     data instanceof ArrayBuffer || (ArrayBuffer.isView(data) && data.buffer instanceof ArrayBuffer)
//   )
// }

// 暂且不传 ArrayBuffer，后面根据实际需求看看是否需要改进
// isSafeBufferSource(message) || message instanceof Blob ? message : String(message)
