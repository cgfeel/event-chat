import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import SharedWorkerTransport from '../transports/SharedWorkerTransport'

export function createSharedWorkerRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: SharedWorker,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new SharedWorkerTransport(target, options), context)
}
