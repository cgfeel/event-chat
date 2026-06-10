import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import ServiceWorkerRegistrationTransport from '../transports/ServiceWorkerRegistrationTransport'

export function createServiceWorkerRegistrationRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: ServiceWorkerRegistration, config?: EntryOptions<EVENT, CONSUME>) {
  const { context, options } = config ?? {}
  return RPCDecorator(new ServiceWorkerRegistrationTransport(target, options), context)
}
