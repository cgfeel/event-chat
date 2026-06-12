import { ListenerType, MessageItem } from '../fields'
import { ProxyPromise } from '../utils'
import BaseTransport from './BaseTransport'

// function isSafeBufferSource(data: unknown): data is ArrayBuffer | ArrayBufferView<ArrayBuffer> {
//   return (
//     data instanceof ArrayBuffer || (ArrayBuffer.isView(data) && data.buffer instanceof ArrayBuffer)
//   )
// }

// 主线程：WebSocket client
class WebSocketTransport extends BaseTransport<WebSocket> {
  private _onconnect = Promise.resolve(false)
  destroy() {
    this._target.onclose = null
    this._target.onopen = null

    if (this._target.readyState === WebSocket.OPEN) this._target.close()
  }

  observe(close?: () => void): void {
    this._target.onclose = () => {
      close?.()
    }
  }

  onmessage(listener: ListenerType): void {
    this._target.onmessage = listener
    this._onconnect = new Promise((resolve) => {
      this._target.onopen = () => {
        resolve(true)
      }

      this._target.onclose = () => {
        resolve(false)
      }
    })
  }

  onremove(): void {
    this._target.onmessage = null
  }

  postMessage(message: MessageItem) {
    const target = this._target
    return this._onconnect.then((open) =>
      ProxyPromise.try(() => {
        if (open)
          target.send(
            // 暂且不传 ArrayBuffer，后面再看如何传
            // isSafeBufferSource(message) || message instanceof Blob ? message : String(message)
            JSON.stringify(message)
          )
      })
    )
  }
}

export default WebSocketTransport
