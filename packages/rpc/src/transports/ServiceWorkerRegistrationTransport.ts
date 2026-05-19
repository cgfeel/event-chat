import { IframeSerializeOptions, ListenerType, MessageItem } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程 → ServiceWorker，页面给 ServiceWorker 发消息：navigator.serviceWorker
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
class ServiceWorkerRegistrationTransport extends BaseTransport<ServiceWorkerRegistration> {
  destroy() {
    this._target.unregister().catch(() => {})
  }

  is(source: MessageEventSource | null, message?: MessageItem) {
    // 如果是被替换的情况下，会借助同 scope 激活的实例继续通信，因此这里将其视为相同
    return source instanceof ServiceWorker && message?.scope === this._target.scope
  }

  // 即便是 redundant，也不代表线程不能用了，它有可能：安装失败、激活失败、被新版本替换、注册被注销
  // 如果是加载 sw 脚本失败，会在 hooks 中通过 catch 捕获
  observe(): void {}

  onmessage(listener: ListenerType): void {
    navigator.serviceWorker.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: ListenerType): void {
    navigator.serviceWorker.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: MessageItem, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    if (message.heartbeat) {
      // 如果是心跳只有当前激活的实例才能发送，而相同 scope 实例都会收到
      this._target.active?.postMessage(message, { transfer })
      return
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const matched = registrations.find(
          (registration) =>
            registration.scope === this._target.scope && Boolean(registration.active)
        )
        matched?.active?.postMessage(message, { transfer })
      })
      .catch(() => {})
  }
}

export default ServiceWorkerRegistrationTransport

//   通常在 message 中通过筛选当前激活的对象进行对话，但这样被顶替的实例就无法对话了
//   在失活的 message 回调中返回的 event 依旧是原来的 worker 实例，已不存在 registrations 中
//   navigator.serviceWorker
//     .getRegistrations()
//     .then((registrations) => {
//       const matched = registrations.find((registration) => {
//         return (
//           event.source === registration.active ||
//           event.source === registration.installing ||
//           event.source === registration.waiting
//         )
//       })
//       if (matched && matched.scope === this._target.scope) {
//         listener(event)
//       }
//     })
//     .catch(() => {})
