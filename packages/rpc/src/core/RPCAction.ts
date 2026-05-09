import { IframeSerializeOptions, Transport } from '../fields'
import { isKey } from '../utils'

const RPC_SIGN = 'RPCActionSign'
const WINDOW_NAME = '[object Window]'

const defaultOptions = {
  allowedOrigins: [],
  heartbeatInterval: 3000,
  heartbeatTimeout: 8000,
  retryTimeout: 5000,
  retryTimes: 2,
} satisfies RPCOptionsType

const getOrigin = (url: string) =>
  typeof self?.location?.origin === 'string' ? new URL(url, self.location.origin).origin : ''

class RPCAction {
  private _brodcastListeners: BrodcastItem[] = []
  private _handlers: HandlersRecord = {}
  private _heartbeatTimer: NodeJS.Timeout | null = null
  private _isConnected = false
  private _lastHeartbeat = Date.now()
  private _options: RPCOptionsType = {}
  private _pending = new Map<string, PendingItem>()
  private _boundMessageHandler = this._messageHandler.bind(this)

  constructor(
    private _target: Transport,
    options?: RPCOptionsType
  ) {
    this._options = {
      ...defaultOptions,
      ...options,
      allowedOrigins: options?.allowedOrigins
        ?.map((item) => (item === '*' ? item : getOrigin(item)))
        .filter(Boolean),
    }

    this._target.onmessage(this._boundMessageHandler)
    this._startHeartbeat()
  }

  destroy() {
    clearInterval(this._heartbeatTimer ?? undefined)
    this._target.onremove(this._boundMessageHandler)
    this._abort()

    this._brodcastListeners = []
    this._handlers = {}
    this._heartbeatTimer = null
  }

  broadcast<T>(options?: Omit<RequestOptions<T>, 'retry'>) {
    const { payload, ...ops } = options ?? {}
    const { channel } = this._options
    this._target.postMessage(
      { __RPC__: RPC_SIGN, broadcast: true, kind: 'request', channel, payload },
      { ...ops, targetOrigin: ops.targetOrigin ?? self?.location?.origin }
    )
  }

  config(options: Omit<RPCOptionsType, 'onConnect' | 'onDisconnect'>) {
    this._options = { ...this._options, ...options }
  }

  on<T extends ActionFunType>(type: PropertyKey, handler: T) {
    this._handlers[type] = handler
  }

  onBrodcast(listener: BrodcastItem) {
    this._brodcastListeners.push(listener)
  }

  request<T = unknown>(type: PropertyKey, options?: RequestOptions<T>) {
    const { payload, retry = 0, ...ops } = options ?? {}
    const {
      channel,
      retryTimeout = defaultOptions.retryTimeout,
      retryTimes = defaultOptions.retryTimes,
    } = this._options

    return new Promise((resolve, reject) => {
      if (!this._isConnected) {
        reject(new Error(`[RPC] 连接未建立，无法请求：${type.toString()}`))
        return
      }

      const requestId = this._createRequestId()
      const timer = setTimeout(() => {
        this._pending.delete(requestId)
        if (retry < retryTimes) {
          // 只要不抛出错误就正常
          resolve(this.request(type, { ...options, retry: retry + 1 }))
        } else {
          reject(new Error(`[RPC] 请求超时：${type.toString()}`))
        }
      }, retryTimeout)

      this._pending.set(requestId, {
        resolve: (res) => {
          clearTimeout(timer)
          resolve(res)
        },
        reject: (err) => {
          const message = err instanceof Error ? err.message : '[RPC] 处理消息时发生错误'
          clearTimeout(timer)
          reject(new Error(message))
        },
        timer,
      })

      this._target.postMessage(
        { __RPC__: RPC_SIGN, kind: 'request', channel, payload, requestId, type },
        { ...ops, targetOrigin: ops.targetOrigin ?? self?.location?.origin }
      )
    })
  }

  private _abort() {
    this._isConnected = false
    this._options?.onDisconnect?.()

    this._pending.forEach(({ reject, timer }) => {
      clearTimeout(timer)
      reject(new Error('[RPC] 连接已断开，请求已取消'))
    })
    this._pending.clear()
  }

  private _createRequestId(): string {
    const requestId = Math.random().toString(36).slice(2, 10)
    return this._pending.has(requestId) ? this._createRequestId() : requestId
  }

  private _isOriginAllowed(origin: string) {
    return (
      this._options?.allowedOrigins?.some(
        (item) => item === '*' || getOrigin(item) === getOrigin(origin)
      ) ?? false
    )
  }

  // 这里收到的消息还要再考虑下，如果不是对象，比如 ArrayBuff
  private _messageHandler(
    event: Pick<MessageEvent<MessageItem | undefined>, 'data' | 'origin' | 'source'>
  ) {
    const { data, origin, source } = event
    const { __RPC__, broadcast, channel, error, heartbeat, kind, payload, requestId, type } =
      data ?? {}

    // 如果 source、channel、origin、RPC 都无法隔离消息，只能在业务通过 payload 进行隔离
    if (__RPC__ !== RPC_SIGN) return
    if (this._options?.channel !== channel) return
    if (!this._target.is(source)) return
    if (this._target.getType() === WINDOW_NAME && !this._isOriginAllowed(origin)) return

    // 心跳
    if (heartbeat) {
      this._lastHeartbeat = Date.now()
      // ✅ 心跳恢复：标记连接成功
      if (!this._isConnected) {
        this._isConnected = true
        this._options?.onConnect?.()
      }
      return
    }

    // 广播
    if (broadcast) {
      this._brodcastListeners.forEach((listener) => listener(payload, origin))
      return
    }

    // 响应回调
    const pending = requestId ? this._pending.get(requestId) : undefined
    if (requestId && pending) {
      const { resolve, reject } = pending
      this._pending.delete(requestId)
      if (error !== undefined) {
        reject(new Error(error))
      } else {
        resolve(payload)
      }
      return
    }

    if (kind !== 'request') return

    // 本地方法调用
    const handler = type && isKey(type, this._handlers) ? this._handlers[type] : undefined
    if (handler) {
      Promise.resolve()
        .then(() => handler(payload))
        .then((result) => {
          this._target.postMessage(
            { __RPC__: RPC_SIGN, kind: 'response', payload: result, channel, requestId, type },
            { targetOrigin: origin }
          )
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : '[RPC] 处理消息时发生错误'
          this._target.postMessage(
            {
              __RPC__: RPC_SIGN,
              error: message,
              kind: 'response',
              payload: '',
              channel,
              requestId,
            },
            { targetOrigin: origin }
          )
        })
    }
  }

  // server worker 要额外优化
  private _startHeartbeat() {
    const {
      channel,
      heartbeatInterval = defaultOptions.heartbeatInterval,
      heartbeatTimeout = defaultOptions.heartbeatTimeout,
    } = this._options

    const intervalLoops = () => {
      this._target.postMessage({ __RPC__: RPC_SIGN, heartbeat: true, kind: 'request', channel })

      // ❌ 心跳超时
      if (!this._isConnected) return
      if (Date.now() - this._lastHeartbeat > heartbeatTimeout) {
        this._abort()
      }
    }

    intervalLoops()

    clearInterval(this._heartbeatTimer ?? undefined)
    this._heartbeatTimer = setInterval(intervalLoops, heartbeatInterval)
  }
}

export { WINDOW_NAME }

export default RPCAction

export type RPCOptionsType = {
  allowedOrigins?: string[]
  channel?: string // 同实例情况下，通过 channel 区分
  heartbeatInterval?: number
  heartbeatTimeout?: number
  retryTimeout?: number
  retryTimes?: number
  onConnect?: () => void
  onDisconnect?: () => void
}

// 需要限制参数最多只允许存在 1 个，但不能用 unknown，只有 any 才能推导
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionFunType = (payload?: any) => any

export type BrodcastItem = (value: unknown, origin?: string) => void

export type RequestOptions<T = unknown> = IframeSerializeOptions & {
  payload?: T
  retry?: number
}

type HandlersRecord = Record<PropertyKey, (...value: unknown[]) => unknown>

type MessageItem = Pick<RPCOptionsType, 'channel'> & {
  payload: unknown
  __RPC__?: string // 过滤外部消息
  broadcast?: boolean
  error?: string
  heartbeat?: boolean
  kind?: 'request' | 'response'
  requestId?: string
  type?: PropertyKey
}

type PendingItem = Record<'resolve' | 'reject', (value?: unknown) => void> & {
  timer: NodeJS.Timeout
}
