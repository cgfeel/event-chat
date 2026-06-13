import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { observerRPC } from '../core/observerRPC'
import { EntryOptions } from '../fields'
import MessagePortTransport from '../transports/MessagePortTransport'

export function createMessagePortRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: MessagePort,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new MessagePortTransport(target, options), context)
}

export function observerMessagePortRPC() {
  const { add, brodcastScope, remove } = observerRPC()
  const push = <EVENT extends ActionRecord, CONSUME extends ActionRecord>(
    target: MessagePort,
    config?: EntryConfig<EVENT, CONSUME>
  ) => {
    const { context, destroy, name = '', ...ops } = config ?? {}
    const RPCIns = createMessagePortRPC(target, {
      ...ops,
      context: {
        ...context,
        config: {
          ...context?.config,
          onConnect: () => {
            add(RPCIns[0], name)
            context?.config?.onConnect?.()
          },
          onDisconnect: (dest) => {
            if (destroy) {
              RPCIns[1]()
              remove(RPCIns[0])
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
  name?: string
}
