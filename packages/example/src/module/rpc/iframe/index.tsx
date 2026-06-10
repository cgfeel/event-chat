import { baseChatServer, childIframeCtx, mainCtx } from '@/services/iframeService'
import { useEventChat } from '@event-chat/core'
import { createRPC } from '@event-chat/rpc/auto'
import { TARGET_TYPE_STRINGS, useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useRef, useState } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import CardSelect from '@/components/chatLine/CardSelect'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { useRecipients } from '../createRecipientsStore'
import { allowedOrigins, chatName, iframeName } from '../uitls'

const group = 'root'

const Iframe: FC = () => {
  const iframeRef1 = useRef<HTMLIFrameElement>(null)
  const iframeRef2 = useRef<HTMLIFrameElement>(null)

  const [store, recipients] = useRecipients()
  const [card, setCard] = useState(0)

  const { emit } = useEventChat('root-bar', { group })
  const {
    connected: connected1,
    rpc: rpc1,
    brodcastScope,
  } = useRPC({
    config: {
      onConnect: () => {
        store.addRecipient(rpc1)
      },
      onDisconnect: () => {
        store.delRecipient(rpc1)
      },
      allowedOrigins,
    },
    brodcast: mainCtx.brodcasts,
    consume: childIframeCtx.actions,
    event: mainCtx.actions,
    name: group,
    drive: createWindowRPC,
    init: () => iframeRef1.current,
  })

  const { connected: connected2, rpc: rpc2 } = useRPC({
    config: {
      onConnect: () => {
        store.addRecipient(rpc2)
      },
      onDisconnect: () => {
        store.delRecipient(rpc2)
      },
      allowedOrigins,
    },
    brodcast: mainCtx.brodcasts,
    consume: childIframeCtx.actions,
    event: mainCtx.actions,
    name: group,
    drive: createRPC,
    init: () => iframeRef2.current,
  })

  const stateCtx = { name: group, page: 'root', card, brodcastScope, emit }
  mainCtx.provider(stateCtx)

  return (
    <div className="grid h-126 grid-cols-1 grid-rows-[3fr_2fr_1fr] gap-x-4 gap-y-3 md:grid-cols-2 md:grid-rows-[2fr_1fr]">
      <div className="row-span-2 bg-gray-800">
        <ChatLine
          card={<CardSelect value={card} onChange={setCard} />}
          disabled={!connected1 && !connected2}
          loading={!connected1 && !connected2}
          name={group}
          recipients={recipients}
          onSend={(item) => {
            baseChatServer(item, stateCtx)
            if (item.status === 'broadcast') {
              brodcastScope(
                { payload: { ...item, path: [group] } },
                { include: [TARGET_TYPE_STRINGS.Window] }
              )
            } else {
              const target = item.recipient ? (store.getRecipient(item.recipient) ?? rpc1) : rpc1
              target
                .request('sendChat', { payload: item })
                .then((result) => receiptStore.increasing(result))
                .catch(() => {})
            }
          }}
        >
          <ChatScroll group={group} />
        </ChatLine>
      </div>
      <div>
        <iframe className="h-full w-full" ref={iframeRef1} src={`/iframe?sub=${iframeName}`} />
      </div>
      <div>
        <iframe className="h-full w-full" ref={iframeRef2} src={`/iframe?sub=${chatName}`} />
      </div>
    </div>
  )
}

export default Iframe
