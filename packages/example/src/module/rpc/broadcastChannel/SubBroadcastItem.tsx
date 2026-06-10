import { type FC } from 'react'
import BroadcastItem from './BroadcastItem'

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
