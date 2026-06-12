import type { FC } from 'react'
import { sharedWorkerAction } from '../uitls'
import SharedWorkerItem from './SharedWorkerItem'

const SharedIframe: FC<SharedIframeProps> = ({ group = sharedWorkerAction }) => (
  <div className="grid h-full">
    <SharedWorkerItem scope={group} iframe />
  </div>
)

export default SharedIframe

interface SharedIframeProps {
  group?: string
}
