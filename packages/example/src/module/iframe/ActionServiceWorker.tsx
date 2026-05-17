import type { FC } from 'react'
import { serviceScopeAction } from '../rpc/uitls'
import type { SubIframeProps } from './SubIframe'
import SubServiceWorker from './SubServiceWorker'

const ActionServiceWorker: FC<SubIframeProps> = ({ group }) => (
  <SubServiceWorker group={group} scope={serviceScopeAction} />
)

export default ActionServiceWorker
