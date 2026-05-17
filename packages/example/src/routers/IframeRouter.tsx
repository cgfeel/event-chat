import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import { chatName, iframeName, serviceWorkerAction, serviceWorkerGroup } from '@/module/rpc/uitls'
import { ConfigProvider, theme } from 'antd'
import { type FC, lazy, useMemo } from 'react'
import { isKey } from '@/utils/fields'

const router = Object.freeze({
  [chatName]: lazy(() => import('@/module/iframe/IframeExample')),
  [iframeName]: lazy(() => import('@/module/iframe/IframeChat')),
  [serviceWorkerAction]: lazy(() => import('@/module/iframe/ActionServiceWorker')),
  [serviceWorkerGroup]: lazy(() => import('@/module/iframe/SubServiceWorker')),
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <RecipientsProvider>
        <IframePage group={!subName ? undefined : subName} />
      </RecipientsProvider>
    </ConfigProvider>
  ) : null
}

export default IframeRouter
