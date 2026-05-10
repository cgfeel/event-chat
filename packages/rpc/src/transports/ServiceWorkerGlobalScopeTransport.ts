import { IframeSerializeOptions, ListenerType } from '../fields'
import BaseTransport from './BaseTransport'

// SW 内部全局对象：ServiceWorker 监听页面消息
class ServiceWorkerGlobalScopeTransport extends BaseTransport<ServiceWorkerGlobalScope> {
  private _onconnect: ((event: ExtendableMessageEvent) => void) | undefined
  private _source: ExtendableMessageEvent['source'] | undefined

  // service worker 由浏览器统一回收处理，所以这里注销只将引用清空
  // 不需要主动监听 statechange 中的 statechange 状态，注销后线程将直接销毁
  destroy() {
    this._onconnect = undefined
  }

  // 在 Service worker 内部线程是不稳定的，因此 setTimeout 和 setInterval 是不稳定的
  // 但是在主线程会定时心跳唤醒 Service worker，因此只要心跳时间 ＜ service worker 闲置事件就视为活跃
  onmessage(listener: ListenerType): void {
    // 先保留，后面看看要不要端口
    // this._onconnect = (event) => {
    //   const ports = event.ports.map((i) => i)
    //   const source = event.source instanceof Client ? null : event.source

    //   const messageEvent = new MessageEvent('serverWork', { ...event, ports, source })
    //   listener(messageEvent)
    // }
    // this._target.addEventListener('message', this._onconnect, this._options.message)

    this._onconnect = (event) => {
      this._source = event.source
      event.waitUntil(
        new Promise<void>((resove) => {
          listener({ ...event, source: null, wait: resove })
        })
      )
    }

    this._target.addEventListener('message', this._onconnect, this._options.message)
  }

  onremove(): void {
    if (this._onconnect)
      this._target.removeEventListener('message', this._onconnect, this._options.message)
  }

  // 待后续优化: 匹配具体 client
  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transmit, transfer } = options ?? {}
    // 允许转发请求到指定 窗口或 iframe
    if (transmit) {
      transmit
        .then((clients) => clients.forEach((client) => client.postMessage(message, { transfer })))
        .catch(() => {})
    } else {
      // 没有接受消息前 source 发不出消息
      this._source?.postMessage(message, { transfer })
    }
  }
}

export default ServiceWorkerGlobalScopeTransport
