import { FactoryOptions, Transport } from '../fields'
import { TargetType } from '../transports/BaseTransport'
import { EntryOptions } from '../transports/fields'
import RPCDecorator, { ActionRecord } from './RPCDecorator'

const cahceMap = new Map<string, ReturnType<TransportItem['load']>>()
const registry: TransportItem[] = []

export function cacheImport(item?: TransportItem) {
  const { name, load } = item ?? {}
  if (name && load) {
    if (!cahceMap.has(name)) cahceMap.set(name, load())
    return Promise.resolve(cahceMap.get(name))
  }
  return Promise.resolve(undefined)
}

export function createRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: unknown,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return resolveTransport(target, options).then((transport) => RPCDecorator(transport, context))
}

export function registerTransport<T extends TargetType>(resolver: TransportResolver<T>) {
  if (resolver.in()) registry.push(resolver)
}

export function resolveTransport(target: unknown, options?: FactoryOptions) {
  const transport = registry.find((item) => item.match(target))
  return cacheImport(transport).then((result) => {
    if (result && transport?.match(target)) {
      const TransportTarget = result.default
      return new TransportTarget(target, options)
    }
    return null
  })
}

export type TransportResolver<T extends TargetType = TargetType> = {
  name: string
  in: () => boolean
  match: (target: unknown) => target is T
  load: () => Promise<{ default: new (target: T, options?: FactoryOptions) => Transport<boolean> }>
}

// TS 逆变了，采用里面放松约束，对外严格约束
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransportItem = TransportResolver<any>
