import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import BroadcastChannelTransport from '../transports/BroadcastChannelTransport'
import { EntryOptions } from '../transports/fields'

export function createBroadcastChannelRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: BroadcastChannel,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new BroadcastChannelTransport(target, options), context)
}
