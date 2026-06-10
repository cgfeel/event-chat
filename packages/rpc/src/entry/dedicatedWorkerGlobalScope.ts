import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import DedicatedWorkerGlobalScopeTransport from '../transports/DedicatedWorkerGlobalScopeTransport'
import { EntryOptions } from '../transports/fields'

export function createDedicatedWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: DedicatedWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new DedicatedWorkerGlobalScopeTransport(target, options), context)
}
