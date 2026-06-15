import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router'
import Tabs, { TabItem } from '@/components/Tabs'

const Menu: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
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
  )
}

export default Menu
