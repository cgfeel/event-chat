import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import WebSocketTransport from '../transports/WebSocketTransport'

export function createWebSocketRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: WebSocket,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new WebSocketTransport(target, options), context)
}
