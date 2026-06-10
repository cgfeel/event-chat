import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import ServiceWorkerGlobalScopeTransport from '../transports/ServiceWorkerGlobalScopeTransport'

export function createServiceWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: ServiceWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new ServiceWorkerGlobalScopeTransport(target, options), context)
}
