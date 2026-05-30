import { useEventChat } from '@event-chat/core'
import { Select } from 'antd'
import { type FC, type PropsWithChildren, type ReactNode, useState } from 'react'
import { ChatScroll } from '@/components/chatLine'
import MessagePortIframe from './MessagePortIframe'
import { messageGroup, messagePortService, messagePortWeb, messagePortWindow } from './uitls'
import { panelStyles } from './windowUitls'

const { item, itemTitle, logs, panel, worker, wrap } = panelStyles()
const itemList = [
  { scope: messagePortService, title: 'SWPort-ParentPort' },
  { scope: messagePortWeb, title: 'WWPort-ParentPort' },
  { scope: messagePortWindow, title: 'IframePort-ParentPort' },
] as const

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope, title }) => {
  const [status, setStatus] = useState('normal')
  const { emit } = useEventChat(`chat-${scope}`, { group: messageGroup })

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <span>{title}</span>
        <Select
          options={[
            { label: '单独发送', value: 'normal' },
            {
              label: '全局广播',
              value: 'broadcast',
            },
          ]}
          size="small"
          value={status}
          onChange={(detail) => {
            emit({ name: `item-${scope}`, detail })
            setStatus(detail)
          }}
        />
      </div>
      <div className={worker()}>{children}</div>
    </div>
  )
}

const WorkerLogs: FC = () => {
  return (
    <div className={logs()}>
      <ChatScroll direction="vertical" group={messageGroup} name="chat-message-port" />
    </div>
  )
}

const MessagePortDemo: FC = () => {
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      {itemList.map(({ scope, title }) => (
        <WorkerGrid key={scope} scope={scope} title={title}>
          <MessagePortIframe sub={scope} />
        </WorkerGrid>
      ))}
    </div>
  )
}

export default MessagePortDemo

interface WorkerGridProps {
  scope: string
  title?: ReactNode
}
