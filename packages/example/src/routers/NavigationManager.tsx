import Menu from '@/module/layout/Menu'
import SideBar from '@/module/layout/SideBar'
import { ConfigProvider, theme } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import RedirectHandler from '@/components/RedirectHandler'
import Toast from '@/components/toast'

const NavigationManager: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <RedirectHandler />
      <Toast />
      <SideBar>
        <Menu />
        <div className="p-2 text-center">
          EventChat 是专门为客户端通信而设计的库，Demo 为了方便演示采用了对话示例。
        </div>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
          }}
        >
          <div className="animate-fade-in-up m-auto max-w-400 p-4">{children}</div>
        </ConfigProvider>
      </SideBar>
    </>
  )
}

export default NavigationManager
