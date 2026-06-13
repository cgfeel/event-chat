import { generateFakePrint, transmitResult } from '@/services/baseSWService'
import { type MessagePortCtx, webSocketCtx } from '@/services/webSocketService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWebSocketRPC } from '@event-chat/rpc/webSocket'
import { type FC, useCallback, useMemo, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { webSocketGroup } from '../uitls'
import { panelStyles, titleRange } from '../windowUitls'

const { panel, wrap } = panelStyles()
const scope = 'webScope'

const WebSocketDemo: FC = () => {
  const [sending, setSending] = useState(false)
  const { connected, rpc } = useRPC({
    config: { channel: webSocketGroup },
    brodcast: webSocketCtx.brodcasts,
    drive: createWebSocketRPC,
    init: () =>
      new WebSocket(
        'wss://free.blr2.piesocket.com/v3/1?api_key=SVhWYMO7QmYA2yb5fnKMm4z2BoJVYk6prjpRQ5N3&notify_self=1'
      ),
  })

  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (connected ? 'Connect' : 'Disconnect'),
    [connected, sending]
  )

  const { emit } = useEventChat('', { group: webSocketGroup })
  const print: MessagePortCtx['print'] = useCallback(
    (data) => {
      const { receipt } = data.result.receivedBody
      receiptStore.increasing(receipt)

      const detail = transmitResult({ ...data, scope: `${scope}:service` })
      emit({ name: `chat-${scope}`, detail })
      setSending(false)
    },
    [emit]
  )

  webSocketCtx.provider({ print })

  return (
    <div className={wrap({ class: 'h-64 md:grid-cols-1' })}>
      <div className={panel({ class: 'row-span-1' })}>
        <div className="flex-1">
          <WorkerPanel
            disabled={connected ? sending : true}
            name="webSocket:example"
            placeholder="Please input message"
            title={titleRange[allow]}
            onSubmit={(text) => {
              setSending(true)
              const payload = {
                broadcast: 'normal',
                message: Array.isArray(text) ? text.join() : String(text ?? ''),
                receipt: receiptStore.addReceipt(),
                scope: `${scope}:client`,
              }

              const fakeData = generateFakePrint(payload, payload.scope)
              const detail = transmitResult({ ...fakeData, scope: payload.scope })

              emit({ name: `chat-${scope}`, detail })
              rpc.broadcast({ payload })
            }}
            button
          >
            <ChatScroll direction="vertical" group={webSocketGroup} name={`chat-${scope}`} />
          </WorkerPanel>
        </div>
      </div>
    </div>
  )
}

export default WebSocketDemo
