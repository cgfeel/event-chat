import { ConfigProvider, theme } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router'
import RedirectHandler from '@/components/RedirectHandler'
import Tabs, { TabItem } from '@/components/Tabs'
import Toast from '@/components/toast'

const NavigationManager: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <RedirectHandler />
      <Toast />
      <div className="flex w-full items-center justify-center p-4">
        <Tabs
          defaultActive={location.pathname}
          onChange={(detail) => {
            navigate(detail.toString())?.catch(() => {})
          }}
        >
          <TabItem name="/">EventChat</TabItem>
          <TabItem name="/antd-form">AntdForm</TabItem>
          <TabItem name="/name-path">NamePath</TabItem>
          <TabItem name="/rpc">RPC</TabItem>
          <TabItem name="/debug-log">Debug & Error</TabItem>
          <TabItem name="/formily">Formily</TabItem>
          <TabItem name="/components">Components</TabItem>
        </Tabs>
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <div className="animate-fade-in-up m-auto max-w-400 p-4">{children}</div>
      </ConfigProvider>
    </>
  )
}

export default NavigationManager
