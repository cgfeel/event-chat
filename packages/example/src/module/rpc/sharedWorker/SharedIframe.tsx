import { iframeCtx, parentCtx } from '@/services/sharedWorkerService'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC } from 'react'
import { allowedOrigins, sharedGroup, sharedWorkerAction } from '../uitls'
import SharedWorkerItem from './SharedWorkerItem'
import { useBrodcastFn } from './utils'

const SharedIframe: FC<SharedIframeProps> = ({ group = sharedWorkerAction }) => {
  const { connected, rpc, brodcastScope } = useRPC({
    config: { channel: sharedGroup, allowedOrigins },
    brodcast: iframeCtx.brodcasts,
    consume: parentCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  const [brodcast] = useBrodcastFn(brodcastScope)
  iframeCtx.provider({ brodcast })

  return (
    <div className="grid h-full">
      <SharedWorkerItem
        disabled={!connected}
        scope={group}
        push={(payload) => {
          rpc.request('sendMessage', { payload }).catch(() => {})
        }}
        iframe
      />
    </div>
  )
}

export default SharedIframe

interface SharedIframeProps {
  group?: string
}
