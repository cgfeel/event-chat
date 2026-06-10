import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import WorkerTransport from '../transports/WorkerTransport'
import { EntryOptions } from '../transports/fields'

export function createWorkerRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: Worker,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new WorkerTransport(target, options), context)
}
