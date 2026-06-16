import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import { ConfigProvider, theme } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import RedirectHandler from '@/components/RedirectHandler'

const DemoManager: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <RedirectHandler />
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <div className="animate-fade-in-up m-auto max-w-400 p-4">
          <RecipientsProvider>{children}</RecipientsProvider>
        </div>
      </ConfigProvider>
    </>
  )
}

export default DemoManager
