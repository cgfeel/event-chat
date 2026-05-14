import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import RPCDecorator, { ActionRecord, DecoratorContext } from '../core/RPCDecorator'
import { Transport } from '../fields'
import { EntryOptions, FactoryOptions } from '../transports/fields'
import { isKey } from '../utils'
import { RPCInstanceContext } from './fields'

const defaultBrod = () => {}

const useRPC = <
  TARGET extends TargetInit,
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(
  ops: RPCHooksOptions<TARGET, EVENT, CONSUME> | RPCDriveOptions<TARGET, EVENT, CONSUME>
) => {
  const { brodcastScope, mount } = useContext(RPCInstanceContext)
  const [connected, setConnected] = useState(false)

  const decoratorRef = useRef<RPCResult<TARGET, EVENT, CONSUME>[0] | null>(null)
  const processRef = useRef(Promise.resolve<RPCResult<TARGET, EVENT, CONSUME> | null>(null))
  const opsRef = useRef(ops)

  const rpcIns = useMemo(
    () =>
      new Proxy(
        {},
        {
          get(_, key, ref) {
            if (decoratorRef.current && isKey(key, decoratorRef.current))
              return Reflect.get(decoratorRef.current, key, ref)
            throw new Error(`outof decorator: ${key.toString()}`)
          },
          has(_, key) {
            return decoratorRef.current !== null && key in decoratorRef.current
          },
          set() {
            throw new Error('decorator is readonly')
          },
        }
      ) as RPCResult<TARGET, EVENT, CONSUME>[0],
    []
  )

  const mounHandle = useCallback(
    (name: string) => {
      if (decoratorRef.current) mount?.(decoratorRef.current, name)
    },
    [mount]
  )

  useEffect(() => {
    const { config, options, drive, faild, init, name = '', ...opConfig } = opsRef.current

    // 如果是 iframe 不用等待 onload，RPC 会有心跳检测
    // 这里采用外层限制，内部宽松，因为除了 TARGET，createRPC 接受 unknown
    processRef.current = processRef.current
      .then(() => init())
      .then((tar) => (tar instanceof HTMLIFrameElement ? tar.contentWindow : tar))
      .then((tar) => {
        const context = {
          ...opConfig,
          config: {
            ...config,
            onConnect() {
              config?.onConnect?.()
              setConnected(true)
            },
            onDisconnect() {
              config?.onDisconnect?.()
              setConnected(false)
            },
          },
        }

        return drive(tar as TARGET, {
          context,
          options,
        })
      })
      .then((target) => {
        const [result] = target
        decoratorRef.current = result

        mount?.(result, name)
        return target
      })
      .catch((error) => {
        faild?.(error)
        return null
      })

    return () => {
      processRef.current = processRef.current.then((target) => {
        setConnected(false)
        if (target) {
          const [result, destroy] = target
          mount?.(result)
          destroy()
        }

        decoratorRef.current = null
        return null
      })
    }
  }, [mount])

  return Object.freeze({
    rpc: rpcIns,
    brodcastScope: brodcastScope ?? defaultBrod,
    mount: mounHandle,
    connected,
  })
}

export default useRPC

interface RPCBaseOptions<TARGET extends TargetInit> {
  init: () => TARGET | null | Promise<TARGET | null>
  name?: string
  options?: FactoryOptions
  faild?: (error: unknown) => void
}

interface RPCDriveOptions<
  TARGET extends TargetInit,
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>
  extends RPCBaseOptions<TARGET>, DecoratorContext<EVENT, CONSUME> {
  drive: (
    target: TARGET,
    config?: EntryOptions<EVENT, CONSUME>
  ) => RPCResult<TARGET, EVENT, CONSUME>
}

interface RPCHooksOptions<
  TARGET extends TargetInit,
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>
  extends RPCBaseOptions<TARGET>, DecoratorContext<EVENT, CONSUME> {
  drive: (
    target: unknown,
    context?: EntryOptions<EVENT, CONSUME>
  ) => Promise<RPCResult<TARGET, EVENT, CONSUME>>
}

type RPCResult<
  TARGET extends TargetInit,
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
> = ReturnType<
  typeof RPCDecorator<
    [TARGET] extends [null]
      ? null
      : TARGET extends BroadcastChannel
        ? Transport<true>
        : Transport<false>,
    EVENT,
    CONSUME
  >
>

// hooks 只能在主线程下的 React 中使用，排除非主线程的对象
type TargetInit =
  | BroadcastChannel
  | ServiceWorkerRegistration
  | SharedWorker
  | WebSocket
  | Window
  | Worker
  | HTMLIFrameElement
  | null
