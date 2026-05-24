import { useEventChat } from '@event-chat/core'
import { Select } from 'antd'
import { type FC, type PropsWithChildren, useState } from 'react'
import Button from '@/components/Button'
import { ChatScroll } from '@/components/chatLine'
import MessagePortIframe from './MessagePortIframe'
import { messagePortService, messagePortWeb, messagePortWindow } from './uitls'
import { panelStyles } from './windowUitls'

const { item, itemTitle, logs, panel, worker, wrap } = panelStyles()

const group = 'MessagePort'
const itemList = [messagePortService, messagePortWeb, messagePortWindow] as const

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const { emit } = useEventChat('', { group })
  const [status, setStatus] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [connect, setConnect] = useState(false)

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <Button
          disabled={loading}
          loading={loading}
          variant={connect ? 'secondary' : 'primary'}
          onClick={() => {
            setLoading(true)
            setConnect(true)
          }}
        >
          {(loading ? 'Sending....' : undefined) ?? (connect ? 'Destroy' : 'Connect')}
        </Button>
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
      <ChatScroll direction="vertical" group={group} name={`chat-message-port`} />
    </div>
  )
}

const MessagePortDemo: FC = () => {
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      {itemList.map((itemkey) => (
        <WorkerGrid key={itemkey} scope={itemkey}>
          <MessagePortIframe sub={itemkey} />
        </WorkerGrid>
      ))}
    </div>
  )
}

export default MessagePortDemo

interface WorkerGridProps {
  scope: string
}
