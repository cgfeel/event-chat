import type { FC } from 'react'
import type { SubIframeProps } from '../iframe/SubIframe'
import { serviceScopeAction } from '../uitls'
import SubServiceWorker from './SubServiceWorker'

const ActionServiceWorker: FC<SubIframeProps> = ({ group }) => (
  <SubServiceWorker group={group} scope={serviceScopeAction} />
)

export default ActionServiceWorker
