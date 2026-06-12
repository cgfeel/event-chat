import type { FC } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { panelStyles } from './windowUitls'

const WorkerLogs: FC<WorkerLogsProps> = ({ group, name = 'chat-message-port' }) => {
  const { logs } = panelStyles()
  return (
    <div className={logs()}>
      <ChatScroll direction="vertical" group={group} name={name} />
    </div>
  )
}

export default WorkerLogs

interface WorkerLogsProps {
  group: string
  name?: string
}
