const isSimpleType = (value: unknown): value is boolean | number | string =>
  ['boolean', 'number', 'string'].includes(typeof value)

export const createKey = (idx: number) => `${idx}:${Date.now()}:${Math.random()}`
export const isKey = <T extends Record<string, unknown>>(key: unknown, data: T): key is keyof T =>
  isPropertyKey(key) && key in data

export const isPropertyKey = (value: unknown): value is PropertyKey =>
  ['number', 'string', 'symbol'].includes(typeof value)

export const objectEntries = <T extends object, K = keyof T>(obj: T) =>
  Object.entries(obj) as Array<[K, T[keyof T]]>

export const objectKeys = <T extends object, K = keyof T>(obj: T) => Object.keys(obj) as K[]

export const routerPath = (path = '') => {
  const name = path.replace(/^\/*/, '')
  return process.env.NODE_ENV === 'production' ? `/event-chat/${name}` : `/${name}`
}

export const safetyParse = (value: string) => {
  try {
    const data: unknown = JSON.parse(value)
    return typeof data === 'object' && data !== null ? data : undefined
  } catch {
    return undefined
  }
}

export const safetyPrint = (data: unknown, fallback = '') => {
  try {
    return (
      (isSimpleType(data) ? String(data) : undefined) ?? (data ? JSON.stringify(data) : fallback)
    )
  } catch {
    return fallback
  }
}

export type PickPatial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type PickPatialAnother<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P]
}

export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type PickRequiredAnother<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P]
}

export type PickVariants<T, K extends keyof GetVariants<T>> = [K] extends [never]
  ? never
  : {
      [P in K]: PickVariantItem<T, P>
    }

export type PickVariantItem<T, K extends keyof GetVariants<T>> = NonNullable<GetVariants<T>[K]>

export type ValueOf<T> = T[keyof T]

type GetVariants<T> = T extends (...args: [infer P, ...unknown[]]) => unknown
  ? NonNullable<P>
  : never
