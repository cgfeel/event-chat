import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import DedicatedWorkerGlobalScopeTransport from '../transports/DedicatedWorkerGlobalScopeTransport'

export function createDedicatedWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: DedicatedWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new DedicatedWorkerGlobalScopeTransport(target, options), context)
}
