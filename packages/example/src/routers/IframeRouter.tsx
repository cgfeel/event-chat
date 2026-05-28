import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import {
  chatName,
  iframeName,
  messagePortService,
  messagePortWeb,
  messagePortWindow,
  serviceWorkerAction,
  serviceWorkerGroup,
} from '@/module/rpc/uitls'
import { type FC, lazy, useMemo } from 'react'
import { isKey } from '@/utils/fields'

const MessagePort = lazy(() => import('@/module/iframe/messagePort'))

const router = Object.freeze({
  [chatName]: lazy(() => import('@/module/iframe/IframeExample')),
  [iframeName]: lazy(() => import('@/module/iframe/IframeChat')),
  [serviceWorkerAction]: lazy(() => import('@/module/iframe/ActionServiceWorker')),
  [serviceWorkerGroup]: lazy(() => import('@/module/iframe/SubServiceWorker')),
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
