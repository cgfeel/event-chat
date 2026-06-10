import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import WebSocketTransport from '../transports/WebSocketTransport'
import { EntryOptions } from '../transports/fields'

export function createWebSocketRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: WebSocket,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new WebSocketTransport(target, options), context)
}
