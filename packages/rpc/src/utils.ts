export const getError = (error: unknown, tips = 'unknown error.') =>
  (error instanceof Error || error instanceof DOMException ? error : undefined) ??
  (typeof error === 'string' ? new Error(error) : undefined) ??
  new Error(
    error instanceof Object && 'message' in error && typeof error.message === 'string'
      ? error.message
      : tips,
    {
      cause: error,
    }
  )

export const isKey = <T extends Record<string, unknown>>(key: unknown, data: T): key is keyof T =>
  isPropertyKey(key) && key in data

export const isPropertyKey = (value: unknown): value is PropertyKey =>
  ['number', 'string', 'symbol'].includes(typeof value)

export const objectValues = <T extends object, V = ValueOf<T>>(obj: T) => Object.values(obj) as V[]

// 需要根据业务提供类型去推导，保留 any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function promiseTryPolyfill<T, A extends any[]>(
  fn: (...args: A) => T | PromiseLike<T>,
  ...args: A
): Promise<T> {
  try {
    return Promise.resolve(fn(...args))
  } catch (error) {
    return Promise.reject(getError(error))
  }
}

export const ProxyPromise = new Proxy(Promise, {
  get(target: PromiseConstructor, propKey: keyof PromiseConstructor | 'try') {
    if (propKey === 'try') {
      return 'try' in target ? target.try : promiseTryPolyfill
    }
    return target[propKey]
  },
}) as PromiseConstructor & {
  try: typeof promiseTryPolyfill
}

export type ValueOf<T> = T[keyof T]
