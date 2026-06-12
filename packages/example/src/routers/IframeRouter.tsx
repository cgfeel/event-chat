import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import {
  broadcastAction,
  broadcastApi,
  chatName,
  iframeName,
  messagePortService,
  messagePortWeb,
  messagePortWindow,
  serviceWorkerAction,
  serviceWorkerGroup,
  sharedWorkerAction,
  transferAction,
} from '@/module/rpc/uitls'
import { type FC, lazy, useMemo } from 'react'
import { isKey } from '@/utils/fields'

const BroadcastItem = lazy(() => import('@/module/rpc/broadcastChannel/SubBroadcastItem'))
const MessagePort = lazy(() => import('@/module/rpc/messagePort/MessagePortCom'))

const router = Object.freeze({
  [chatName]: lazy(() => import('@/module/rpc/iframe/IframeExample')),
  [iframeName]: lazy(() => import('@/module/rpc/iframe/IframeChat')),
  [serviceWorkerAction]: lazy(() => import('@/module/rpc/serviceWorker/ActionServiceWorker')),
  [serviceWorkerGroup]: lazy(() => import('@/module/rpc/serviceWorker/SubServiceWorker')),
  [sharedWorkerAction]: lazy(() => import('@/module/rpc/sharedWorker/SharedIframe')),
  [transferAction]: lazy(() => import('@/module/rpc/transfer/TransferItem')),
  [broadcastAction]: BroadcastItem,
  [broadcastApi]: BroadcastItem,
  [messagePortService]: MessagePort,
  [messagePortWeb]: MessagePort,
  [messagePortWindow]: MessagePort,
})

const IframeRouter: FC = () => {
  const subName = useMemo(() => {
    const searchParams =
      typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
    if (searchParams) {
      const queryObject = Object.fromEntries(searchParams.entries())
      if (isKey('sub', queryObject)) return queryObject.sub
    }
    return chatName
  }, [])

  const IframePage = isKey(subName, router) ? router[subName] : null
  return IframePage ? (
    <RecipientsProvider>
      <IframePage group={!subName ? undefined : subName} />
    </RecipientsProvider>
  ) : null
}

export default IframeRouter
