import { ActionFunType, BrodcastItem } from './core/RPCAction'

function createCtx<
  CTX extends Record<string, unknown>,
  ACTIONS extends Record<string, ActionFunType>,
  BRODCATS extends Record<string, BrodcastItem>,
>(factory: (ctx: Partial<CTX>) => ACTIONS, brodcast?: (ctx: Partial<CTX>) => BRODCATS) {
  const ctx: { current: Partial<CTX> | null } = { current: null }
  const proxyCtx = new Proxy(
    {},
    {
      get(_, key) {
        return ctx.current ? Reflect.get(ctx.current, key) : undefined
      },
      set() {
        throw new Error('ctx is readonly')
      },
    }
  )

  const actions = factory(proxyCtx as Partial<CTX>)
  const brodcasts = brodcast?.(proxyCtx as Partial<CTX>)

  const provider = (next: Partial<CTX>) => {
    ctx.current = { ...(ctx.current ?? {}), ...next }
    return () => {
      ctx.current = null
    }
  }

  return Object.freeze({
    actions,
    brodcasts,
    provider,
  })
}

function createService<CTX extends Record<string, unknown>>() {
  return <
    ACTIONS extends Record<string, ActionFunType>,
    BRODCATS extends Record<string, BrodcastItem>,
  >(
    factory: (ctx: Partial<CTX>) => ACTIONS,
    brodcast?: (ctx: Partial<CTX>) => BRODCATS
  ) => createCtx(factory, brodcast)
}

export { createCtx, createService }
