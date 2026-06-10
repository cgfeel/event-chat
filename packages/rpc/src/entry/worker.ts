import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import WorkerTransport from '../transports/WorkerTransport'

export function createWorkerRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: Worker,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new WorkerTransport(target, options), context)
}
