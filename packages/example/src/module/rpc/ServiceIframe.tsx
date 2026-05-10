import { iframeCtx, parentCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useRef } from 'react'
import z from 'zod'
import { serviceScopeApi, serviceWorkerGroup } from './uitls'

const ServiceIframe: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { rpc } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      channel: 'service-worker',
    },
    brodcast: parentCtx.brodcasts,
    consume: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  useEventChat(serviceScopeApi, {
    group: serviceWorkerGroup,
    schema: z.boolean(),
    callback: ({ detail }) => {
      rpc.request('broadcast', { payload: detail }).catch(() => {})
    },
  })

  return (
    <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${serviceWorkerGroup}`} />
  )
}
export default ServiceIframe
