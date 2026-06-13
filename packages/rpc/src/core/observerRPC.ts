import { MessageItem, Transport } from '../fields'
import { RequestOptions } from './RPCAction'
import RPCDecorator, { ActionRecord } from './RPCDecorator'

export function observerRPC() {
  const scopeMap = new Map<RPCIns, string>()
  return Object.freeze({
    add: scopeMap.set.bind(scopeMap),
    clear: scopeMap.clear.bind(scopeMap),
    remove: scopeMap.delete.bind(scopeMap),
    brodcastScope: <T>(data: RequestOptions<T>, options?: ScopeProps) => {
      const { exclude, include, scopein, scopeout, fallback } = options ?? {}
      let result: MessageItem = {}

      scopeMap.forEach((scope, item) => {
        const type = item.getType()
        if (
          item.connected() &&
          !exclude?.includes(type) &&
          (include?.includes(type) ?? true) &&
          !scopeout?.includes(scope) &&
          (scopein?.includes(scope) ?? true)
        ) {
          result = item.broadcast(
            {
              ...data,
              requestId: data.requestId ?? result.requestId,
              sign: data.sign ?? result.sign,
            },
            fallback
          )
        }
      })
    },
  })
}

export type RPCIns<
  T extends Transport<boolean> = Transport<boolean>,
  EVENT extends ActionRecord = ActionRecord,
  CONSUME extends ActionRecord = ActionRecord,
> = ReturnType<typeof RPCDecorator<T, EVENT, CONSUME>>[0]

type ScopeProps = {
  exclude?: string[]
  include?: string[]
  scopein?: string[]
  scopeout?: string[]
  fallback?: (error: unknown) => void
}
