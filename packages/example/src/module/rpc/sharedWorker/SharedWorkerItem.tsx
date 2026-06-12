import { transmitResult } from '@/services/baseSWService'
import { type MessagePortCtx, generateMainCtx, workerConsume } from '@/services/sharedWorkerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createSharedWorkerRPC } from '@event-chat/rpc/sharedWorker'
import { type FC, useCallback, useMemo, useRef, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import WorkerGrid from '../WorkerGrid'
import { sharedGroup } from '../uitls'
import { titleRange } from '../windowUitls'

const SharedWorkerIframe: FC<Omit<ShardWorkerItemProps, 'iframe'>> = ({ scope }) => (
  <iframe className="h-full w-full" src={`/iframe?sub=${scope}`} />
)

const SharedWorkerItem: FC<ShardWorkerItemProps> = ({ iframe, scope }) => {
  const [sending, setSending] = useState(false)
  const broadRef = useRef('normal')

  const mainCtx = generateMainCtx()
  const { connected, rpc, brodcastScope } = useRPC({
    config: { channel: sharedGroup },
    consume: workerConsume.actions,
    event: mainCtx.actions,
    drive: createSharedWorkerRPC,
    init: () => new SharedWorker(new URL('./worker.js', import.meta.url), { name: scope }),
  })

  const name = useMemo(() => (iframe ? `iframe:${scope}` : scope), [iframe, scope])
  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (connected ? 'Connect' : 'Disconnect'),
    [connected, sending]
  )

  const { emit } = useEventChat('', { group: sharedGroup })
  const print: MessagePortCtx['print'] = useCallback(
    (data) => {
      const { receipt, scope: receivedScope } = data.result.receivedBody
      const detail = transmitResult({ ...data, scope: name })

      if (receivedScope === name) receiptStore.increasing(receipt)
      setSending(false)

      emit({ name: 'chat-message-port', detail })
      emit({ name: `chat-${scope}`, detail })
    },
    [name, scope, emit]
  )

  mainCtx.provider({ print })

  return (
    <WorkerGrid
      defaultStatus={'normal'}
      group={sharedGroup}
      scope={scope}
      options={[
        { label: '单独发送', value: 'normal' },
        {
          label: '全局广播',
          value: 'broadcast',
        },
        {
          label: '全局转发',
          value: 'transmit',
        },
      ]}
      title={name}
      onChange={(detail) => {
        broadRef.current = detail
      }}
    >
      <WorkerPanel
        disabled={connected ? sending : true}
        name={name}
        placeholder="Please input message"
        title={titleRange[allow]}
        onSubmit={(text) => {
          const payload = {
            broadcast: broadRef.current,
            message: Array.isArray(text) ? text.join() : String(text ?? ''),
            receipt: receiptStore.addReceipt(),
            scope: name,
          }

          setSending(true)
          if (broadRef.current === 'broadcast') {
            brodcastScope({ payload })
          } else {
            rpc.request('sendMessage', { payload }).catch(() => {})
          }
        }}
        button
      >
        <ChatScroll direction="vertical" group={sharedGroup} name={`chat-${scope}`} />
      </WorkerPanel>
    </WorkerGrid>
  )
}

export { SharedWorkerIframe }

export default SharedWorkerItem

interface ShardWorkerItemProps {
  scope: string
  iframe?: boolean
}
