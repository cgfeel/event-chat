import { transmitResult } from '@/services/baseSWService'
import { type BroadcastChannelCtx, broadcastCtx } from '@/services/broadcastChannelService'
import { useEventChat } from '@event-chat/core'
import { createBroadcastChannelRPC } from '@event-chat/rpc/broadcastChannel'
import { useRPC } from '@event-chat/rpc/react'
import { type FC, type ReactNode, useCallback, useMemo, useRef } from 'react'
import z from 'zod'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { WorkerGrid } from '../messagePort'
import { broadcastGroup } from '../uitls'
import { titleRange } from '../windowUitls'

const schema = z.enum(['broadcast', 'transmit'])
const BroadcastIframe: FC<Pick<BroadcastItemProps, 'scope'>> = ({ scope }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  return <iframe className="h-full w-full" ref={iframeRef} src={`/iframe?sub=${scope}`} />
}

const BroadcastItem: FC<BroadcastItemProps> = ({ iframe, scope, title }) => {
  const broadRef = useRef<z.infer<typeof schema>>('transmit')
  const { connected, rpc, brodcastScope } = useRPC({
    config: { channel: broadcastGroup },
    brodcast: broadcastCtx.brodcasts,
    drive: createBroadcastChannelRPC,
    init: () => new BroadcastChannel(scope),
  })

  const { emit } = useEventChat(`item-${scope}`, { group: broadcastGroup, schema })
  const name = useMemo(() => (iframe ? `iframe:${scope}` : scope), [iframe, scope])

  const print: BroadcastChannelCtx['print'] = useCallback(
    (data) => {
      const { receipt, scope: receivedScope } = data.result?.receivedBody ?? {}
      const detail = transmitResult({ ...data, scope: name })

      if (receipt && receivedScope === name) receiptStore.increasing(receipt)
      emit({ name: `chat-${scope}`, detail })
    },
    [name, scope, emit]
  )

  broadcastCtx.provider({
    broadcast: (payload, info) => rpc.broadcast({ ...info, payload }),
    print,
  })

  return (
    <WorkerGrid
      defaultStatus="transmit"
      group={broadcastGroup}
      scope={scope}
      options={[
        {
          label: '全局广播',
          value: 'broadcast',
        },
        { label: '全局转发', value: 'transmit' },
      ]}
      title={title}
    >
      <WorkerPanel
        disabled={!connected}
        name={name}
        placeholder="Please input message"
        title={titleRange[connected ? 'Connect' : 'Disconnect']}
        onSubmit={(text) => {
          const payload = {
            broadcast: broadRef.current,
            message: Array.isArray(text) ? text.join() : String(text ?? ''),
            receipt: receiptStore.addReceipt(),
            scope: name,
          }

          if (payload.broadcast === 'broadcast') {
            brodcastScope({ payload })
          } else {
            rpc.broadcast({ payload })
          }
        }}
        button
      >
        <ChatScroll direction="vertical" group={broadcastGroup} name={`chat-${scope}`} />
      </WorkerPanel>
    </WorkerGrid>
  )
}

export { BroadcastIframe }

export default BroadcastItem

interface BroadcastItemProps {
  scope: string
  title: ReactNode
  iframe?: boolean
}
