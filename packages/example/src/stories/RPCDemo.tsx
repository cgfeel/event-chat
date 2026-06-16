import { type FC, useMemo } from 'react'

const prefix = process.env.NODE_ENV === 'production' ? `/event-chat` : 'http://localhost:3000'
const range = Object.freeze({
  broadcastChannel: { height: 'h-116', url: '/rpc-demo/broadcast-channel' },
  iframe: { height: 'h-134', url: '/rpc-demo/iframe' },
  messagePort: { height: 'h-170', url: '/rpc-demo/message-port' },
  serviceWork: { height: 'h-170', url: '/rpc-demo/service-worker' },
  sharedWorker: { height: 'h-170', url: '/rpc-demo/shared-worker' },
  transfer: { height: 'h-87', url: '/rpc-demo/transfer' },
  webSocket: { height: 'h-72', url: '/rpc-demo/web-socket' },
  webWorker: { height: 'h-92', url: '/rpc-demo/web-worker' },
})

const RPCDemo: FC<RPCDemoProps> = ({ type }) => {
  const { height, url } = useMemo(() => range[type], [type])
  return (
    <div className={`overflow-hidden ${height}`}>
      <iframe className="h-full w-full overflow-hidden" src={`${prefix}${url}`} />
    </div>
  )
}

export default RPCDemo

export interface RPCDemoProps {
  type: keyof typeof range
}
