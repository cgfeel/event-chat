import { allowedOrigins, transferGroup } from '@/module/rpc/uitls'
import { name, transferCtx } from '@/services/transferService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import type { FC } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { panelStyles } from '../rpc/windowUitls'

const { logs } = panelStyles()

const WorkerLogs: FC = () => (
  <div className={logs()}>
    <ChatScroll direction="vertical" group={transferGroup} name={name} />
  </div>
)

const TransferItem: FC = () => {
  const { emit } = useEventChat('', { group: transferGroup })
  useRPC({
    config: { channel: transferGroup, allowedOrigins },
    event: transferCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  transferCtx.provider({ emit })

  return (
    <div className="flex h-full bg-gray-800">
      <WorkerLogs />
    </div>
  )
}

export default TransferItem
