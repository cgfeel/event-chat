import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { observerRPC } from '../core/observerRPC'
import { RPCInstanceContext, RPCInstanceContextIns } from './fields'

const RPCProvider: FC<PropsWithChildren> = ({ children }) => {
  const observer = useRef(observerRPC())

  const mount: NonNullable<RPCInstanceContextIns['mount']> = useCallback((item, name?: string) => {
    const { add, remove } = observer.current
    if (!('getType' in item)) return
    if (name === undefined) {
      remove(item)
    } else {
      add(item, name)
    }
  }, [])

  useEffect(() => {
    const ins = observer.current
    return () => {
      ins.clear()
    }
  }, [])

  return (
    <RPCInstanceContext.Provider value={{ brodcastScope: observer.current.brodcastScope, mount }}>
      {children}
    </RPCInstanceContext.Provider>
  )
}

export default RPCProvider
