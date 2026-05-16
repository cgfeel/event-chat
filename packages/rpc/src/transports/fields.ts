import { ActionRecord, DecoratorContext } from '../core/RPCDecorator'
import { FactoryOptions } from './BaseTransport'

// export interface FactoryOptions {
//   message?: boolean | AddEventListenerOptions
// }

export interface Transport {
  destory: () => void
  getType: () => string
  is: (source: MessageEventSource | null) => boolean
  onmessage: (listener: (ev: MessageEvent) => unknown) => void
  onremove: (listener: (ev: MessageEvent) => unknown) => void
  postMessage: (message: unknown, options?: IframeSerializeOptions) => void
  upset: (options: FactoryOptions) => void
}

export type IframeSerializeOptions = StructuredSerializeOptions & {
  targetOrigin?: string
}

export interface EntryOptions<EVENT extends ActionRecord, CONSUME extends ActionRecord> {
  options?: FactoryOptions
  context?: DecoratorContext<EVENT, CONSUME>
}
