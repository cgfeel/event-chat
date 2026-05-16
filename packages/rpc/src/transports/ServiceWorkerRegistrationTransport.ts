import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程 → ServiceWorker，页面给 ServiceWorker 发消息：navigator.serviceWorker
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
class ServiceWorkerRegistrationTransport extends BaseTransport<ServiceWorkerRegistration> {
  private _listener: ((ev: MessageEvent) => unknown) | null = null

  // 不需要主动监听 statechange 中的 statechange 状态，以心跳为准，注销操作仅节省了心跳检测资源
  // 如果是加载 sw 脚本失败，会在 hooks 中通过 catch 捕获
  destroy() {
    this._target.unregister().catch(() => {})
  }

  // 如果 source 匹配不够的话，那么将 发送的信息 MessageItem 附带 scope
  is(source: MessageEventSource | null) {
    // Object.is(source, this._target.active) 可能在更新后变化，通过 getRegistrations 筛选
    // getRegistrations 会将同 scope 覆盖的 woeker 更新并匹配
    return source instanceof ServiceWorker
  }

  // 即便是 redundant，也不代表线程不能用了，它有可能：安装失败、激活失败、被新版本替换、注册被注销
  // 如果是被替换的情况下，不要注销对象，而是执行相同操作
  observe(): void {}

  onmessage(listener: ListenerType): void {
    this._listener = (event) => {
      // active 可能在更新后变化，所以更稳的是按需用 getRegistrations() 重新匹配
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          const matched = registrations.find((registration) => {
            return (
              event.source === registration.active ||
              event.source === registration.installing ||
              event.source === registration.waiting
            )
          })

          if (Object.is(matched, this._target)) {
            listener(event)
          }
        })
        .catch(() => {})
    }
    navigator.serviceWorker.addEventListener('message', this._listener, this._options.message)
  }

  onremove(): void {
    if (this._listener)
      navigator.serviceWorker.removeEventListener('message', this._listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.active?.postMessage(message, { transfer })
  }
}

export default ServiceWorkerRegistrationTransport
