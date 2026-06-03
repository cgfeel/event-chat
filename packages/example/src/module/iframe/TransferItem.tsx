import { allowedOrigins, transferGroup } from '@/module/rpc/uitls'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import type { FC } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { panelStyles } from '../rpc/windowUitls'

const { logs } = panelStyles()

const WorkerLogs: FC = () => (
  <div className={logs()}>
    <ChatScroll direction="vertical" group={transferGroup} name="chat-message-port" />
  </div>
)

const TransferItem: FC = () => {
  useRPC({
    config: { channel: transferGroup, allowedOrigins },
    drive: createWindowRPC,
    init: () => window.parent,
  })

  return (
    <div className="flex h-full bg-gray-800">
      <WorkerLogs />
    </div>
  )
}

export default TransferItem
