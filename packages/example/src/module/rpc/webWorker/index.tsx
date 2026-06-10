import { baseChatServer } from '@/services/baseService'
import { useEventChat } from '@event-chat/core'
import { type FC } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import { useRecipients } from '../createRecipientsStore'
import { workerNameFilter } from '../uitls'
import WorkerItem from './WorkerItem'

const channel = 'worker-panel'
const items = ['item1', 'item2'] as const
const workerGroup = 'worker-group'

// 主消息
const WorkerDemo: FC = () => {
  const { emit } = useEventChat('', { group: workerGroup })
  const [, recipients] = useRecipients()

  return (
    <div className="grid h-84 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="row-span-2 min-h-0 bg-gray-800">
        <ChatLine
          disabled={recipients.length === 0}
          group={workerGroup}
          name={channel}
          recipients={recipients}
          onSend={(item) => {
            if (item.recipient) {
              emit({ detail: item, name: workerNameFilter(item.recipient) })
            }
          }}
        >
          <ChatScroll group={workerGroup} />
        </ChatLine>
      </div>
      {items.map((keyname) => (
        <div className="min-h-0" key={keyname}>
          <WorkerItem
            channel={channel}
            group={workerGroup}
            name={keyname}
            feedback={(item) => {
              baseChatServer(item, { name: channel, emit })
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default WorkerDemo
