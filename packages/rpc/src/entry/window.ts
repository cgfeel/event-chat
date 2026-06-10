import { ActionRecord } from '../core/RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import { EntryOptions } from '../fields'
import WindowTransport from '../transports/WindowTransport'

export function createWindowRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: Window | HTMLIFrameElement,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  const instance = target instanceof HTMLIFrameElement ? target.contentWindow : target

  // 如果提供的 iframe.contentWindow，需要自行提供 Element
  const ops =
    target instanceof HTMLIFrameElement
      ? Object.assign({}, options, { observer: () => target })
      : options

  return RPCDecorator(instance ? new WindowTransport(instance, ops) : null, context)
}
