import { FactoryOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

function isSafeBufferSource(data: unknown): data is ArrayBuffer | ArrayBufferView<ArrayBuffer> {
  return (
    data instanceof ArrayBuffer || (ArrayBuffer.isView(data) && data.buffer instanceof ArrayBuffer)
  )
}

// 主线程：WebSocket client
class WebSocketTransport extends BaseTransport<WebSocket> {
  private _onconnect = Promise.resolve(false)

  constructor(
    protected _target: WebSocket,
    protected _options: FactoryOptions = {}
  ) {
    super(_target, _options)
    this._onconnect = new Promise((resolve) => {
      this._target.onopen = () => {
        resolve(true)
      }

      this._target.onclose = () => {
        resolve(false)
      }
    })
  }

  destroy() {
    this._target.onclose = null
    this._target.onopen = null

    if (this._target.readyState === WebSocket.OPEN) this._target.close()
  }

  onmessage(listener: ListenerType): void {
    this._target.onmessage = listener
  }

  onremove(): void {
    this._target.onmessage = null
  }

  postMessage(message: unknown): void {
    const target = this._target
    this._onconnect
      .then((open) => {
        if (open)
          target.send(
            isSafeBufferSource(message) || message instanceof Blob ? message : String(message)
          )
      })
      .catch(() => {})
  }
}

export default WebSocketTransport
