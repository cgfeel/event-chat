import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useRef } from 'react'

const MessagePortIframe: FC<MessagePortIframeProps> = ({ sub }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useRPC({
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  return <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${sub}`} />
}

export default MessagePortIframe

interface MessagePortIframeProps {
  sub: string
}
