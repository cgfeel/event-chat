import { RequestOptions } from '../core/RPCAction'
import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions, MessageItem, Transport } from '../fields'
import MessagePortTransport from '../transports/MessagePortTransport'

export function createMessagePortRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: MessagePort,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new MessagePortTransport(target, options), context)
}

export function observerMessagePortRPC() {
  const ports = new Set<
    ReturnType<typeof RPCDecorator<Transport<boolean>, ActionRecord, ActionRecord>>[0]
  >()

  const brodcastScope = <T>(data: RequestOptions<T>, fallback?: (error: unknown) => void) => {
    let result: MessageItem = {}
    ports.forEach((port) => {
      if (port.connected()) {
        result = port.broadcast(
          {
            ...data,
            requestId: data.requestId ?? result.requestId,
            sign: data.sign ?? result.sign,
          },
          fallback
        )
      }
    })
  }

  const push = <EVENT extends ActionRecord, CONSUME extends ActionRecord>(
    target: MessagePort,
    config?: EntryConfig<EVENT, CONSUME>
  ) => {
    const { context, destroy, ...ops } = config ?? {}
    const RPCIns = createMessagePortRPC(target, {
      ...ops,
      context: {
        ...context,
        config: {
          ...context?.config,
          onConnect: () => {
            ports.add(RPCIns[0])
            context?.config?.onConnect?.()
          },
          onDisconnect: (dest) => {
            if (destroy) {
              RPCIns[1]()
              ports.delete(RPCIns[0])
              context?.config?.onDisconnect?.(true)
            } else {
              context?.config?.onDisconnect?.(dest)
            }
          },
        },
      },
    })
    return RPCIns
  }
  return Object.freeze({ brodcastScope, push })
}

export type EntryConfig<EVENT extends ActionRecord, CONSUME extends ActionRecord> = EntryOptions<
  EVENT,
  CONSUME
> & {
  destroy?: boolean
}
