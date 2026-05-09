import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程 → ServiceWorker，页面给 ServiceWorker 发消息：navigator.serviceWorker
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
class ServiceWorkerRegistrationTransport extends BaseTransport<ServiceWorkerRegistration> {
  // 不需要主动监听 statechange 中的 statechange 状态，以心跳为准，注销操作仅节省了心跳检测资源
  destroy() {
    this._target.unregister().catch(() => {})
  }

  onmessage(listener: ListenerType): void {
    navigator.serviceWorker.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    navigator.serviceWorker.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.active?.postMessage(message, { transfer })
  }
}

export default ServiceWorkerRegistrationTransport
