import type { MessagePortCtx } from '@/services/sharedWorkerService'
import type { RPCInstanceContextIns } from '@event-chat/rpc/react'
import { useCallback } from 'react'

export const useBrodcastFn = (
  brodcastScope: NonNullable<RPCInstanceContextIns['brodcastScope']>
) => {
  const brodcast: MessagePortCtx['brodcast'] = useCallback(
    (payload, info) => {
      brodcastScope({ ...info, payload })
    },
    [brodcastScope]
  )

  return [brodcast] as const
}
