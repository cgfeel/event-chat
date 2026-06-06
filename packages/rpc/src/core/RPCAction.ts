import { IframeSerializeOptions, MessageItem, Transport } from '../fields'
import { isKey } from '../utils'
import { receiptStore } from './receiptStore'

const RPC_SIGN = 'RPCActionSign'
const defaultOptions = {
  allowedOrigins: [],
  heartbeatInterval: 3000,
  heartbeatTimeout: 8000,
  retryTimeout: 5000,
  retryTimes: 2,
} satisfies RPCOptionsType

class RPCAction {
  private _brodcastListeners: BrodcastItem[] = []
  private _brodcastRecord: string[] = []
  private _handlers: HandlersRecord = {}
  private _heartbeatTimer: NodeJS.Timeout | null = null
  private _requestId = ''
  private _isConnected = false
  private _lastHeartbeat = Date.now()
  private _options: RPCOptionsType = {}
  private _pending = new Map<string, PendingItem>()
  private _boundMessageHandler = this._messageHandler.bind(this)

  constructor(
    private _target: Transport<boolean>,
    options?: RPCOptionsType
  ) {
    this._requestId = receiptStore.create()
    this._options = {
      ...defaultOptions,
      ...options,
      allowedOrigins: this._target.originFilter(options?.allowedOrigins),
    }

    this._target.onmessage(this._boundMessageHandler)
    this._startHeartbeat()
  }

  destroy() {
    clearInterval(this._heartbeatTimer ?? undefined)
    this._target.onremove(this._boundMessageHandler)
    this._abort(true)

    this._brodcastRecord.forEach((brodkey) => {
      const [sign, requestId] = brodkey.split(':')
      if (sign === this._requestId) receiptStore.minus(requestId)
    })

    receiptStore.minus(this._requestId)
    this._brodcastListeners = []
    this._brodcastRecord = []
    this._handlers = {}
    this._heartbeatTimer = null
    this._requestId = ''
  }

  broadcast<T>(options?: Omit<RequestOptions<T>, 'retry'>) {
    const { payload, sign, requestId = '', ...ops } = options ?? {}
    const { channel } = this._options
    const info = this._baseMessage({
      broadcast: true,
      kind: 'request',
      requestId: requestId === '' ? receiptStore.create() : requestId,
      channel,
      payload,
    })

    if (sign) info.sign = sign
    this._target.postMessage(info, {
      ...ops,
      targetOrigin: ops.targetOrigin ?? self?.location?.origin,
    })
    return info
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

      const requestId = receiptStore.create()
      const timer = setTimeout(() => {
        this._pending.delete(requestId)
        receiptStore.minus(requestId)
        if (retry < retryTimes && !(ops.transfer?.length ?? 0)) {
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

      const info = this._baseMessage({ kind: 'request', channel, payload, requestId, type })
      this._target.postMessage(info, {
        ...ops,
        targetOrigin: ops.targetOrigin ?? self?.location?.origin,
      })
    })
  }

  private _abort(destroy?: boolean) {
    this._isConnected = false
    this._options?.onDisconnect?.(destroy)

    this._pending.forEach(({ reject, timer }, requestId) => {
      clearTimeout(timer)
      receiptStore.minus(requestId)
      reject(new Error('[RPC] 连接已断开，请求已取消'))
    })
    this._pending.clear()
  }

  private _baseMessage(data: MessageItem): MessageItem {
    return { ...data, __RPC__: RPC_SIGN, sign: this._requestId }
  }

  // 这里收到的消息还要再考虑下，如果不是对象，比如 ArrayBuff
  private _messageHandler(
    event: Pick<MessageEvent<MessageItem | undefined>, 'data' | 'origin' | 'ports' | 'source'> & {
      wait?: () => void
    }
  ) {
    const { data, origin, ports, source, wait } = event
    const { __RPC__, broadcast, channel, error, heartbeat, kind, payload, requestId, sign, type } =
      data ?? {}

    const info = { origin, ports, source }
    const { debug, onConnect, ...options } = this._options

    // 如果 source、channel、origin、RPC 都无法隔离消息，只能在业务通过 payload 进行隔离
    if (__RPC__ !== RPC_SIGN) return
    if (data) {
      Reflect.deleteProperty(options, 'onDisconnect')
      const pending = Array.from(this._pending.keys())
      const handlers = Object.keys(this._handlers)
      const brodcast = this._brodcastListeners.length

      debug?.({ brodcast, data, handlers, info, options, pending })
    }

    if (options?.channel !== channel) return
    if (!this._target.is(source, data)) return
    if (!this._target.allow(origin, this._options.allowedOrigins)) return

    // 心跳
    if (heartbeat) {
      this._lastHeartbeat = Date.now()
      // ✅ 心跳恢复：标记连接成功
      if (!this._isConnected) {
        this._isConnected = true
        onConnect?.()
      }
      return
    }

    // 广播
    if (broadcast) {
      const brodsign = [sign, requestId].filter(Boolean)
      const brodkey = brodsign.join(':')
      if (brodsign.length === 2 && !this._brodcastRecord.includes(brodkey)) {
        this._brodcastRecord.push(brodkey)
        this._brodcastListeners.forEach((listener) =>
          listener(payload, { ...info, requestId, sign })
        )
      }
      return
    }

    // 响应回调
    const pending = requestId ? this._pending.get(requestId) : undefined
    if (requestId && pending) {
      const { resolve, reject } = pending
      this._pending.delete(requestId)
      receiptStore.minus(requestId)

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
    const base = this._baseMessage({ kind: 'response', channel, requestId, type })

    if (handler) {
      Promise.resolve()
        .then(() => {
          // 内部的 any 转换成 unknown，不需要知道类型，外部约束
          const result = handler(payload, info) as unknown
          return result
        })
        .then((result) => {
          this._target.postMessage({ ...base, payload: result }, { targetOrigin: origin })
          return result
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : '[RPC] 处理消息时发生错误'
          this._target.postMessage(
            { ...base, error: message, payload: '' },
            { targetOrigin: origin }
          )
        })
        .finally(() => wait?.())
    }
  }

  // 心跳不需要 requestId
  private _startHeartbeat() {
    const {
      channel,
      heartbeatInterval = defaultOptions.heartbeatInterval,
      heartbeatTimeout = defaultOptions.heartbeatTimeout,
    } = this._options

    const info = this._baseMessage({ heartbeat: true, kind: 'request', channel })
    const intervalLoops = () => {
      this._target.postMessage(info)

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

export default RPCAction

export type RPCOptionsType = Pick<MessageItem, 'channel'> & {
  allowedOrigins?: string[]
  heartbeatInterval?: number
  heartbeatTimeout?: number
  retryTimeout?: number
  retryTimes?: number
  debug?: (arg: {
    brodcast: number
    data: MessageItem
    handlers: string[]
    info: MessageInfo
    options: Omit<RPCOptionsType, 'debug' | 'onConnect' | 'onDisconnect'>
    pending: string[]
  }) => void
  onConnect?: () => void
  onDisconnect?: (destroy?: boolean) => void
}

// 需要限制参数最多只允许存在 1 个，但不能用 unknown，只有 any 才能推导
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionFunType = (payload?: any, info?: MessageInfo) => any

// MessageItem 部分信息用于转发消息用于广播
export type BrodcastItem = (
  value: unknown,
  info?: MessageInfo & Pick<MessageItem, 'requestId' | 'sign'>
) => void

export type MessageInfo = Pick<MessageEvent, 'origin' | 'ports' | 'source'>

export type RequestOptions<T = unknown> = IframeSerializeOptions &
  Pick<MessageItem, 'requestId' | 'sign'> & {
    payload?: T
    retry?: number
  }

type HandlersRecord = Record<PropertyKey, ActionFunType>

type PendingItem = Record<'resolve' | 'reject', (value?: unknown) => void> & {
  timer: NodeJS.Timeout
}
