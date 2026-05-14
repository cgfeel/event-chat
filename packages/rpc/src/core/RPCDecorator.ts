import { Transport } from '../fields'
import RPCAction, { ActionFunType, BrodcastItem, RPCOptionsType, RequestOptions } from './RPCAction'

const factoryKey = ['getType', 'upset'] as const
const disabledKey = ['destroy', 'on', 'onBrodcast'] as const

function isAction(action: RPCAction, key: string): key is keyof RPCAction {
  return !disabledKey.map(String).includes(key) && key in action
}

function isFactory(action: Transport<boolean> | null, key: string): key is keyof Transport {
  return action !== null && key in action && factoryKey.map(String).includes(key)
}

function RPCDecorator<
  TARGET extends Transport<boolean> | null,
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(factory: TARGET, context?: DecoratorContext<EVENT, CONSUME>) {
  const { brodcast, config, event } = context ?? {}
  const action = factory ? new RPCAction(factory, config) : null

  const request = <K extends keyof CONSUME>(
    ...args: Parameters<CONSUME[K]> extends []
      ? [keyname: K, reqops?: RequestOptionsByAction<CONSUME[K]>]
      : [keyname: K, reqops: RequestOptionsByAction<CONSUME[K]>]
  ) => {
    const [keyname, reqops] = args
    return action?.request(keyname, reqops) as Promise<UnwrapPromise<ReturnType<CONSUME[K]>>>
  }

  const destroy = () => {
    action?.destroy()
    factory?.destroy()
  }

  Object.entries(event ?? {}).forEach(([keyname, handle]) => action?.on(keyname, handle))
  Object.values(brodcast ?? {}).forEach((handle) => action?.onBrodcast(handle))

  const rpcInsc = new Proxy(
    {},
    {
      get(_, key) {
        const keyname = key.toString()
        switch (key) {
          case 'request':
            return factory?.onlyBrod ? undefined : request
          default:
            if (action && isAction(action, keyname)) {
              const value = action[keyname]
              return typeof value === 'function' ? value.bind(action) : value
            }
            if (factory && isFactory(factory, keyname)) {
              const value = factory[keyname]
              return typeof value === 'function' ? value.bind(factory) : value
            }
        }
      },
      has(_, key) {
        const keyname = key.toString()
        return (action !== null && isAction(action, keyname)) || isFactory(factory, keyname)
      },
      set() {
        throw new Error('decorator is readonly')
      },
    }
  ) as ResultType<typeof request, TARGET>

  return [rpcInsc, destroy] as const
}

export default RPCDecorator

export interface DecoratorContext<EVENT extends ActionRecord, CONSUME extends ActionRecord> {
  brodcast?: Record<string, BrodcastItem>
  config?: RPCOptionsType
  consume?: CONSUME
  event?: EVENT
}

export type ActionRecord = Record<string, ActionFunType>

// 提取泛型参数精确判断，彻底避免兼容性问题
type GetTransportFlag<T> = T extends Transport<infer B> ? B : never

type RequestOptionsByAction<F extends ActionFunType> =
  Parameters<F> extends []
    ? Omit<RequestOptions, 'payload'> & { payload?: never }
    : RequestOptions<Parameters<F>[0]> & { payload: Parameters<F>[0] }

type ResultType<REQ, TARGET extends Transport<boolean> | null> = [TARGET] extends [null]
  ? Record<never, never>
  : Readonly<
      Omit<RPCAction, (typeof disabledKey)[number] | 'request'> &
        Pick<Transport<boolean>, (typeof factoryKey)[number]> & {
          request: GetTransportFlag<TARGET> extends true ? never : REQ
        }
    >

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T
