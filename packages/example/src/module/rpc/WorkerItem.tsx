import { type SendMessage, itemSchema, messageSchema } from '@/fields/chatField'
import useOptimistic from '@/hooks/useOptimistic'
import { generateMainCtx, workerChatCtx } from '@/services/workerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import { type FC, useCallback, useMemo, useRef, useState } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { WorkerPanel } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { useRecipients } from './createRecipientsStore'
import { workerNameFilter } from './uitls'

const title = 'worker'

const WorkerItem: FC<WorkerItemProps> = ({ channel, group, name, feedback }) => {
  const [customName, setCustomName] = useState('')
  const [displayName, dispatch, runTransition] = useOptimistic(customName)
  const workName = useMemo(() => `worker:${!displayName ? name : displayName}`, [displayName, name])

  const mainCtx = useMemo(() => generateMainCtx(), [])
  const ctxRef = useRef<Parameters<typeof mainCtx.provider>[0]>({})

  const [store] = useRecipients()
  const { connected, rpc, brodcastScope } = useRPC({
    config: {
      channel: 'worker',
      onConnect: () => {
        // 先改名，再添加到接收对象中
        rpc
          .request('changeName', { payload: name })
          .then(() => {
            store.addRecipient(rpc)
          })
          .catch(() => {})
      },
      onDisconnect: () => {
        store.delRecipient(rpc)
      },
    },
    brodcast: mainCtx.brodcasts,
    consume: workerChatCtx.actions,
    event: mainCtx.actions,
    name: channel,
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('./worker/worker.ts', import.meta.url), {
        name: 'my-worker',
      }),
  })

  const { emit } = useEventChat(workerNameFilter(workName), {
    schema: messageSchema,
    callback: ({ detail: item }) => {
      feedback(item)

      if (item.status !== 'broadcast') {
        rpc
          .request('sendChat', { payload: item })
          .then((result) => receiptStore.increasing(result))
          .catch(() => {})

        // 分栏消息
        emit({
          detail: {
            broadcast: false,
            busy: item.status === 'busy',
            date: item.date,
            message: item.message,
            own: item.name === displayName,
            user: item.name,
            receipt: item.receipt,
          },
          name: `chat-${name}`,
        })
      } else {
        brodcastScope({ payload: item })
      }
    },
    group,
  })

  // 回复
  const emitHandle: NonNullable<(typeof ctxRef.current)['emit']> = useCallback(
    ({ detail }) => {
      const { data, success } = itemSchema.safeParse(detail)
      if (success) {
        const receipt = receiptStore.addReceipt()
        emit?.({
          detail: {
            ...data,
            own: false,
            receipt,
          },
          name: `chat-${name}`,
        })

        receiptStore.increasing(receipt)
        feedback({
          date: data.date,
          message: data.message,
          name: data.user,
          status: (data.broadcast ? 'broadcast' : undefined) ?? (data.busy ? 'busy' : 'normal'),
          receipt,
        })
      }
    },
    [name, emit, feedback]
  )

  const brodcastScopeHandle: typeof brodcastScope = useCallback(
    ({ payload }) => {
      const { data: item, success } = messageSchema.safeParse(payload)
      if (success) {
        receiptStore.increasing(item.receipt)
        emit({
          detail: {
            broadcast: true,
            busy: false,
            date: item.date,
            message: item.message,
            own: false,
            user: item.name,
            receipt: item.receipt,
          },
          name: `chat-${name}`,
        })
      }
    },
    [name, emit]
  )

  ctxRef.current = {
    name: `chat-${name}`,
    page: 'root:worker',
    brodcastScope: brodcastScopeHandle,
    emit: emitHandle,
  }

  mainCtx.provider(ctxRef.current)

  return (
    <WorkerPanel
      value={displayName}
      disabled={!connected}
      maxLength={6}
      max={6}
      name={workName}
      placeholder="Please type name to change"
      title={title}
      onChange={(event) => {
        const value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)
        runTransition(() => {
          dispatch(value)
          return rpc.request('changeName', { payload: !value ? name : value }).then((result) => {
            if (result) {
              const displayInput = result.split(':').slice(-1)[0] ?? ''
              setCustomName(displayInput === name ? '' : displayInput)
              emit({ detail: result, name: 'recipient' })
              store.updateRecipientName(rpc, result)
            }
          })
        })
      }}
    >
      <ChatScroll group={group} name={`chat-${name}`} />
    </WorkerPanel>
  )
}

export default WorkerItem

interface WorkerItemProps {
  channel: string
  group: string
  name: string
  feedback: (item: SendMessage) => void
}
