import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程给子线程发消息：Worker
class WorkerTransport extends BaseTransport<Worker> {
  // 没有提供监听 worker 内部是否 close 的监听方法，以心跳为准
  destroy() {
    this._target.terminate()
  }

  onmessage(listener: ListenerType): void {
    this._target.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.postMessage(message, { transfer })
  }
}

export default WorkerTransport
