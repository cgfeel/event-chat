import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import ServiceWorkerGlobalScopeTransport from '../transports/ServiceWorkerGlobalScopeTransport'
import { EntryOptions } from '../transports/fields'

export function createServiceWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: ServiceWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new ServiceWorkerGlobalScopeTransport(target, options), context)
}
