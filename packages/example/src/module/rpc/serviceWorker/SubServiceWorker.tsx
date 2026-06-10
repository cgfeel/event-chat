import { type ParentCtxType, iframeCtx, parentCtx } from '@/services/serviceWorkerService'
import { useEventChat } from '@event-chat/core'
import { TARGET_TYPE_STRINGS, useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback } from 'react'
import { receiptStore } from '@/components/chatLine/receiptStore'
import type { SubIframeProps } from '../iframe/SubIframe'
import { allowedOrigins, serviceScopeApi, serviceWorkerGroup } from '../uitls'
import ServiceWorkerItem from './ServiceWorkerItem'

const SubServiceWorker: FC<SubServiceWorkerProps> = ({ group, scope = serviceScopeApi }) => {
  const { connected, rpc, brodcastScope } = useRPC({
    config: {
      channel: serviceWorkerGroup,
      allowedOrigins,
    },
    brodcast: iframeCtx.brodcasts,
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  const { emit } = useEventChat('', { group })
  const broadcat: NonNullable<ParentCtxType['broadcat']> = useCallback(
    (payload, info) => {
      brodcastScope(
        { ...info, payload },
        { include: [TARGET_TYPE_STRINGS.ServiceWorkerRegistration] }
      )
    },
    [brodcastScope]
  )

  iframeCtx.provider({ scope, broadcat, emit })

  return (
    <ServiceWorkerItem
      disabled={!connected}
      group={group}
      scope={scope}
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

interface SubServiceWorkerProps extends SubIframeProps {
  scope?: string
}
