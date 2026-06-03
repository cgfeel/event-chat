import { type FC } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { messageGroup, messagePortService, messagePortWeb, messagePortWindow } from '../uitls'
import { panelStyles } from '../windowUitls'
import MessagePortIframe from './MessagePortIframe'
import WorkerGrid from './WorkerGrid'

const { logs, panel, wrap } = panelStyles()
const itemList = [
  { scope: messagePortService, title: 'SWPort-ParentPort' },
  { scope: messagePortWeb, title: 'WWPort-ParentPort' },
  { scope: messagePortWindow, title: 'IframePort-ParentPort' },
] as const

const WorkerLogs: FC = () => (
  <div className={logs()}>
    <ChatScroll direction="vertical" group={messageGroup} name="chat-message-port" />
  </div>
)

const MessagePortDemo: FC = () => {
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      {itemList.map(({ scope, title }) => (
        <WorkerGrid
          defaultStatus="normal"
          group={messageGroup}
          key={scope}
          options={[
            { label: '单独发送', value: 'normal' },
            {
              label: '全局广播',
              value: 'broadcast',
            },
          ]}
          scope={scope}
          title={title}
        >
          <MessagePortIframe sub={scope} />
        </WorkerGrid>
      ))}
    </div>
  )
}

export default MessagePortDemo
