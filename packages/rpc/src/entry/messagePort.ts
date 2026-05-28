import { ActionRecord } from '../RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import MessagePortTransport from '../transports/MessagePortTransport'
import { EntryOptions } from '../transports/fields'

export function createMessagePortRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: MessagePort,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new MessagePortTransport(target, options), context)
}
