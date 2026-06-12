import { ActionRecord } from '../core/RPCDecorator'
import { EntryConfig, createMessagePortRPC, observerMessagePortRPC } from './messagePort'

export function obseverShareWorkerGlobalScopeRPC<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
>(target: SharedWorkerGlobalScope, generate?: GenerateCtx<EVENT, CONSUME>) {
  const { brodcastScope, push } = observerMessagePortRPC()
  target.addEventListener('connect', (event) => {
    const { provider, ...config } = generate?.() ?? {}
    const rpcInc = push(event.ports[0], config)
    provider?.(rpcInc)
  })
  return Object.freeze({ brodcastScope })
}

type GenerateCtx<EVENT extends ActionRecord, CONSUME extends ActionRecord> = () => EntryConfig<
  EVENT,
  CONSUME
> & {
  provider?: (RPCIns: ReturnType<typeof createMessagePortRPC<EVENT, CONSUME>>) => void
}

// 由于 SharedWorkerGlobalScope 共享一个线程，因此不能单独创建实例
// 需要通过 obseverShareWorkerGlobalScopeRPC 建立观察模式
// export function createSharedWorkerGlobalScopeRPC<
//   EVENT extends ActionRecord,
//   CONSUME extends ActionRecord,
// >(target: SharedWorkerGlobalScope, config?: EntryOptions<EVENT, CONSUME>) {
//   const { context, options } = config ?? {}
//   return RPCDecorator(new SharedWorkerGlobalScopeTransport(target, options), context)
// }
