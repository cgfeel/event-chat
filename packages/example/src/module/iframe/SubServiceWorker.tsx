import { iframeCtx, parentCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import type { FC } from 'react'
import { receiptStore } from '@/components/chatLine/receiptStore'
import ServiceWorkerItem from '../rpc/ServiceWorkerItem'
import { serviceScopeApi } from '../rpc/uitls'
import type { SubIframeProps } from './SubIframe'

const SubServiceWorker: FC<SubIframeProps> = ({ group }) => {
  const { connected, rpc } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      channel: 'service-worker',
    },
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  const { emit } = useEventChat('', { group })
  iframeCtx.provider({ scope: serviceScopeApi, emit })

  return (
    <ServiceWorkerItem
      disabled={!connected}
      group={group}
      scope={serviceScopeApi}
      publish={(payload) => {
        rpc
          .request('sendMessage', { payload })
          .then(() => {
            const { receipt } = payload
            if (receipt) receiptStore.increasing(receipt)
          })
          .catch(() => {})
      }}
      iframe
    />
  )
}

export default SubServiceWorker
