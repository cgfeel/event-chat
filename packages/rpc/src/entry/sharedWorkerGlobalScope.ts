import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import SharedWorkerGlobalScopeTransport from '../transports/SharedWorkerGlobalScopeTransport'
import { EntryOptions } from '../transports/fields'

export function createSharedWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: SharedWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new SharedWorkerGlobalScopeTransport(target, options), context)
}
