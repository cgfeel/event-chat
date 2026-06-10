import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import SharedWorkerGlobalScopeTransport from '../transports/SharedWorkerGlobalScopeTransport'

export function createSharedWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: SharedWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new SharedWorkerGlobalScopeTransport(target, options), context)
}
