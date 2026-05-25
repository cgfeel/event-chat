import { childChatCtx, childIframeCtx } from '@/services/iframeService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useContext, useEffect, useRef } from 'react'
import { StoreContext } from '../rpc/createRecipientsStore'
import { GroupProvider, allowedOrigins, chatItem } from '../rpc/uitls'

const eventName = 'sub-chat'

const SubChat: FC = () => {
  const store = useContext(StoreContext)
  const { group } = useContext(GroupProvider)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { emit } = useEventChat(eventName, { group })

  const { connected, rpc, brodcastScope } = useRPC({
    config: {
      onConnect: () => {
        store.addRecipient(rpc)
      },
      onDisconnect: () => {
        store.delRecipient(rpc)
      },
      allowedOrigins,
    },
    brodcast: childIframeCtx.brodcasts,
    consume: childIframeCtx.actions,
    event: childChatCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const stateCtx = { name: group, page: 'child', card: 0, brodcastScope, emit }
  childChatCtx.provider(stateCtx)

  useEffect(() => {
    emit({ detail: rpc, name: chatItem })
  }, [connected, rpc, emit])

  return (
    <div className="h-full bg-gray-800">
      <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?name=${group}`} />
    </div>
  )
}

export default SubChat
