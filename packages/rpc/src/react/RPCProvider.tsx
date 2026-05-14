import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { RequestOptions } from '../core/RPCAction'
import { objectValues } from '../utils'
import {
  RPCInstanceContext,
  RPCInstanceContextIns,
  RPCItem,
  ScopeProps,
  TARGET_TYPE_STRINGS,
} from './fields'

const RPCProvider: FC<PropsWithChildren> = ({ children }) => {
  const list = useRef(new Map<RPCItem, string>())
  const brodcastScope = useCallback(<T,>(data: RequestOptions<T>, options?: ScopeProps) => {
    const { exclude, include, typein, typeout } = options ?? {}
    if (list.current.size > 0) {
      const scope = objectValues(TARGET_TYPE_STRINGS)
        .filter((item) => !exclude?.includes(item))
        .filter((item) => !include || include.includes(item))
        .map(String)

      list.current.forEach((group, item) => {
        if (
          'getType' in item &&
          scope.includes(item.getType()) &&
          !typeout?.includes(group) &&
          (!typein || typein.includes(group))
        ) {
          item.broadcast(data)
        }
      })
    }
  }, [])

  const mount: NonNullable<RPCInstanceContextIns['mount']> = useCallback((data, name?: string) => {
    const newMap = new Map(list.current)
    if (name !== undefined) {
      newMap.set(data, name)
    } else {
      newMap.delete(data)
    }
    list.current = newMap
  }, [])

  useEffect(() => {
    return () => {
      list.current = new Map()
    }
  }, [])

  // 当上层没有提供上下文的时候，使用当前上下文
  return (
    <RPCInstanceContext.Provider value={{ brodcastScope, mount }}>
      {children}
    </RPCInstanceContext.Provider>
  )
}

export default RPCProvider
