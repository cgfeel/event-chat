import { iframeCtx, parentCtx, resultSchema } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useRef } from 'react'
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
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const { emit } = useEventChat(serviceScopeApi, {
    group: serviceWorkerGroup,
    schema: z.string(),
    callback: ({ detail }) => {
      rpc.request('broadcast', { payload: detail }).catch(() => {})
    },
  })

  const transmit = useCallback(
    (payload: z.infer<typeof resultSchema>) => {
      rpc.request('sendMessage', { payload }).catch(() => {})
    },
    [rpc]
  )

  parentCtx.provider({ transmit, emit })

  return (
    <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${serviceWorkerGroup}`} />
  )
}
export default ServiceIframe
