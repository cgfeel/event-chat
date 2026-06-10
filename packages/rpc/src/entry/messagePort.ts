import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import MessagePortTransport from '../transports/MessagePortTransport'

export function createMessagePortRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: MessagePort,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new MessagePortTransport(target, options), context)
}
