import type { FC } from 'react'
import IframeExample from './IframeExample'
import SubChat from './SubChat'
import type { SubIframeProps } from './SubIframe'

const IframeChat: FC<SubIframeProps> = ({ group }) => (
  <IframeExample group={group}>
    <SubChat />
  </IframeExample>
)

export default IframeChat
