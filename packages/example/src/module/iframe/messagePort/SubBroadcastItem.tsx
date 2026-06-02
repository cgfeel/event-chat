import { BroadcastItem } from '@/module/rpc/broadcastChannel'
import { type FC } from 'react'

const SubBroadcastItem: FC<SubBroadcastItemProps> = ({ group }) =>
  !group ? null : (
    <div className="grid h-full">
      <BroadcastItem scope={group} title="iframe-broadcast" iframe />
    </div>
  )

export default SubBroadcastItem

interface SubBroadcastItemProps {
  group?: string
}
