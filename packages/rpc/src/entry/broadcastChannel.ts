import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import BroadcastChannelTransport from '../transports/BroadcastChannelTransport'

export function createBroadcastChannelRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: BroadcastChannel,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new BroadcastChannelTransport(target, options), context)
}
