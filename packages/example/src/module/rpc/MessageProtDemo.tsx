import { useEventChat } from '@event-chat/core'
import { Empty, Select } from 'antd'
import { type FC, type PropsWithChildren, useEffect, useState } from 'react'
import Button from '@/components/Button'
import { ChatScroll } from '@/components/chatLine'
import { panelStyles } from './windowUitls'

const group = 'MessagePort'
const { item, itemTitle, logs, panel, worker, wrap } = panelStyles()

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const { emit } = useEventChat('', { group })
  const [status, setStatus] = useState('normal')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setStatus('normal')
  }, [open])

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <Button onClick={() => setOpen(!open)}>{open ? 'closed' : 'open'}</Button>
        <Select
          options={[
            { label: '单独发送', value: 'normal' },
            {
              label: '全局广播',
              value: 'broadcast',
            },
            {
              label: '全局转发',
              value: 'transmit',
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
      {open ? (
        <div className={worker()}>{children}</div>
      ) : (
        <div className={worker({ closed: !open })}>
          <Empty description="Worker is closed" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
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

const MessageProtDemo: FC = () => {
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      <WorkerGrid scope="" />
    </div>
  )
}

export default MessageProtDemo

interface WorkerGridProps {
  scope: string
}
