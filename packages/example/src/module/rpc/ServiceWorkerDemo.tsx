import { type FC } from 'react'
import ServiceWorkerItem from './ServiceWorkerItem'
import { workerGroup } from './uitls'

const scope = '/static/js/async/action/'

const ServiceWorkerDemo: FC = () => {
  return (
    <div className="grid h-84 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="row-span-2 min-h-0 bg-gray-800">
        <div>server</div>
      </div>
      <div className="min-h-0">
        <ServiceWorkerItem group={workerGroup} scope={scope} />
      </div>
      <div className="min-h-0">
        <iframe className="h-full w-full" src={`/iframe?sub=${workerGroup}`} />
      </div>
    </div>
  )
}

export default ServiceWorkerDemo
