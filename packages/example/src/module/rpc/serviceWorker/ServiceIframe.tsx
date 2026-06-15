import {
  type ParentCtxType,
  generateParentCtx,
  iframeCtx,
  resultSchema,
} from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useRef } from 'react'
import z from 'zod'
import { routerPath } from '@/utils/fields'
import { allowedOrigins, serviceWorkerGroup } from '../uitls'

const ServiceIframe: FC<ServiceIframeProps> = ({ scope, sub }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const parentCtx = generateParentCtx()

  const { rpc, brodcastScope } = useRPC({
    config: {
      channel: serviceWorkerGroup,
      allowedOrigins,
    },
    brodcast: parentCtx.brodcasts,
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const { emit } = useEventChat(`item-${scope}`, {
    group: serviceWorkerGroup,
    schema: z.string(),
    callback: ({ detail }) => {
      rpc.request('broadcast', { payload: detail }).catch(() => {})
    },
  })

  const broadcat: NonNullable<ParentCtxType['broadcat']> = useCallback(
    (payload, info) => {
      brodcastScope({ ...info, payload })
    },
    [brodcastScope]
  )

  const transmit = useCallback(
    (payload: z.infer<typeof resultSchema>) => {
      rpc.broadcast({ payload })
    },
    [rpc]
  )

  parentCtx.provider({ broadcat, emit, transmit })

  return <iframe className="h-full w-full" ref={iframeRef} src={routerPath(`iframe?sub=${sub}`)} />
}
export default ServiceIframe

interface ServiceIframeProps {
  scope: string
  sub: string
}
