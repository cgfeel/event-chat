import type { FC } from 'react'
import ServiceWorkerItem from '../rpc/ServiceWorkerItem'
import type { SubIframeProps } from './SubIframe'

const scope = '/static/js/async/api/'

const SubServiceWorker: FC<SubIframeProps> = ({ group }) => (
  <ServiceWorkerItem group={group} scope={scope} iframe />
)

export default SubServiceWorker
