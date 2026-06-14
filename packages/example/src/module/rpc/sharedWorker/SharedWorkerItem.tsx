import { transmitResult } from '@/services/baseSWService'
import {
  type MessagePortCtx,
  type ResultType,
  generateMainCtx,
  parentCtx,
  workerConsume,
} from '@/services/sharedWorkerService'
import { useEventChat, useMemoFn } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createSharedWorkerRPC } from '@event-chat/rpc/sharedWorker'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback, useMemo, useRef, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { routerPath } from '@/utils/fields'
import WorkerGrid from '../WorkerGrid'
import { allowedOrigins, sharedGroup } from '../uitls'
import { titleRange } from '../windowUitls'
import { useBrodcastFn } from './utils'

const SharedWorkerIframe: FC<Omit<ShardWorkerItemProps, 'iframe'>> = ({ scope }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { emit } = useEventChat('', { group: sharedGroup })

  const { brodcastScope } = useRPC({
    config: { channel: sharedGroup, allowedOrigins },
    brodcast: parentCtx.brodcasts,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const [brodcast] = useBrodcastFn(brodcastScope)
  const print: MessagePortCtx['print'] = useCallback(
    (data) => {
      const detail = transmitResult({ ...data, scope: `iframe:${scope}` })
      emit({ name: 'chat-message-port', detail: { ...detail, own: false } })
    },
    [scope, emit]
  )

  parentCtx.provider({ brodcast, print })
  return (
    <iframe className="h-full w-full" ref={iframeRef} src={routerPath(`iframe?sub=${scope}`)} />
  )
}

const SharedWorkerItem: FC<ShardWorkerItemProps> = ({ disabled, iframe, scope, push }) => {
  const [sending, setSending] = useState(false)
  const pushHandle = useMemoFn(push)
  const broadRef = useRef('normal')

  const mainCtx = generateMainCtx()
  const { connected, rpc, brodcastScope } = useRPC({
    config: { channel: sharedGroup },
    brodcast: mainCtx.brodcasts,
    consume: workerConsume.actions,
    event: mainCtx.actions,
    drive: createSharedWorkerRPC,
    init: () => new SharedWorker(new URL('./worker.js', import.meta.url), { name: scope }),
  })

  const name = useMemo(() => (iframe ? `iframe:${scope}` : scope), [iframe, scope])
  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (connected && !disabled ? 'Connect' : 'Disconnect'),
    [connected, disabled, sending]
  )

  const { emit } = useEventChat('', { group: sharedGroup })
  const print: MessagePortCtx['print'] = useCallback(
    (data) => {
      const { receivedBody } = data.result
      const { broadcast, receipt, scope: receivedScope } = receivedBody

      const isSender = !iframe && receivedScope.includes(scope)
      if (broadcast === 'normal' || isSender) pushHandle.current?.(data)

      const detail = transmitResult({ ...data, scope: name })
      if (receivedScope === name) receiptStore.increasing(receipt)
      if (isSender) emit({ name: 'chat-message-port', detail: { ...detail, own: false } })

      setSending(false)
      emit({ name: `chat-${scope}`, detail })
    },
    [iframe, name, pushHandle, scope, emit]
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
  disabled?: boolean
  iframe?: boolean
  push?: (info: ResultType) => void
}
