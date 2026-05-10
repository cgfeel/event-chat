import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import type { FC } from 'react'
import ServiceWorkerItem from '../rpc/ServiceWorkerItem'
import { serviceScopeApi } from '../rpc/uitls'
import type { SubIframeProps } from './SubIframe'

const SubServiceWorker: FC<SubIframeProps> = ({ group }) => {
  const { connected } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      channel: 'service-worker',
    },
    drive: createWindowRPC,
    init: () => window.parent,
  })

  return <ServiceWorkerItem disabled={!connected} group={group} scope={serviceScopeApi} iframe />
}

export default SubServiceWorker
