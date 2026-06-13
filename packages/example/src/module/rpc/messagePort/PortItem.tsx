import { generateFakePrint, transmitResult } from '@/services/baseSWService'
import {
  type MessagePortCtx,
  createMessagePort,
  mainCtx,
  portWorkerCtx,
  workerCtx,
} from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import { type RPCIns, type Transport } from '@event-chat/rpc'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import type { InputProps } from 'antd'
import { type FC, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { messageGroup } from '../uitls'
import { titleRange } from '../windowUitls'

const useConnect = ({ rpc, scope, connect, emit }: ConnectInfoType) => {
  const [sending, setSending] = useState(false)
  const onSubmit = useCallback(
    (text: InputProps['value']) => {
      const messageChannel = new MessageChannel()

      setSending(true)
      connect({ port: messageChannel.port1, text })

      if (rpc) {
        rpc
          .request('connect', { payload: messageGroup, transfer: [messageChannel.port2] })
          .catch(() => {})
      } else {
        createMessagePort(messageChannel.port2, messageGroup)
      }
    },
    [rpc, connect]
  )

  const print: MessagePortCtx['print'] = useCallback(
    (info) => {
      const detail = transmitResult({ ...info, scope: `iframe:${scope}` })
      setSending(false)

      emit({ name: `chat-${scope}`, detail })
      return Promise.resolve(info)
    },
    [scope, emit]
  )

  const filter: MessagePortCtx['filter'] = useCallback(
    (receivedBody) => print(generateFakePrint(receivedBody, 'iframe-port')),
    [print]
  )

  // 主线程由 iframe 提供上下文，分支线程由分支提供上下文
  portWorkerCtx.provider({ filter })
  mainCtx.provider({ print })

  return Object.freeze({ sending, onSubmit, print })
}

const MessagePortItem: FC<
  Omit<MessagePortItemProps, 'connect'> & {
    sending: boolean
    onSubmit?: (text: InputProps['value']) => void
  }
> = ({ disabled, scope, sending, onSubmit }) => {
  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (!disabled ? 'Connect' : 'Disconnect'),
    [disabled, sending]
  )

  return (
    <WorkerPanel
      disabled={!disabled ? sending : true}
      name={`iframe:${scope}`}
      placeholder="Please input message"
      title={titleRange[allow]}
      onSubmit={onSubmit}
      button
    >
      <ChatScroll direction="vertical" group={messageGroup} name={`chat-${scope}`} />
    </WorkerPanel>
  )
}

const ServiceWorkerRPC = forwardRef<MessagePortInstance, MessagePortItemProps>(
  ({ disabled, scope, connect }, ref) => {
    const { connected, rpc } = useRPC({
      config: {
        channel: messageGroup,
      },
      consume: workerCtx.actions,
      event: mainCtx.actions,
      drive: createServiceWorkerRegistrationRPC,
      init: () =>
        navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), {
          scope,
        }),
    })

    const { emit } = useEventChat('', { group: messageGroup })
    const { sending, onSubmit, print } = useConnect({ rpc, scope, connect, emit })
    useImperativeHandle(ref, () => ({ print }))

    return (
      <MessagePortItem
        disabled={!disabled ? !connected : true}
        scope={scope}
        sending={sending}
        onSubmit={onSubmit}
      />
    )
  }
)

const WorkerRPC = forwardRef<MessagePortInstance, MessagePortItemProps>(
  ({ disabled, scope, connect }, ref) => {
    const { connected, rpc } = useRPC({
      config: {
        channel: messageGroup,
      },
      consume: workerCtx.actions,
      event: mainCtx.actions,
      drive: createWorkerRPC,
      init: () =>
        new Worker(new URL('./worker.ts', import.meta.url), {
          name: 'my-worker',
        }),
    })

    const { emit } = useEventChat('', { group: messageGroup })
    const { sending, onSubmit, print } = useConnect({ rpc, scope, connect, emit })
    useImperativeHandle(ref, () => ({ print }))

    return (
      <MessagePortItem
        disabled={!disabled ? !connected : true}
        scope={scope}
        sending={sending}
        onSubmit={onSubmit}
      />
    )
  }
)

const WindowRPC = forwardRef<MessagePortInstance, MessagePortItemProps>(
  ({ disabled, scope, connect }, ref) => {
    const { emit } = useEventChat('', { group: messageGroup })
    const { sending, onSubmit, print } = useConnect({ scope, connect, emit })

    useImperativeHandle(ref, () => ({ print }))
    return (
      <MessagePortItem disabled={disabled} scope={scope} sending={sending} onSubmit={onSubmit} />
    )
  }
)

if (process.env.NODE_ENV !== 'production') {
  ServiceWorkerRPC.displayName = 'ServiceWorkerRPC'
  WorkerRPC.displayName = 'WorkerRPC'
  WindowRPC.displayName = 'WindowRPC'
}

export { ServiceWorkerRPC, WindowRPC, WorkerRPC }

export interface MessagePortInstance extends Pick<MessagePortCtx, 'print'> {}

interface MessagePortItemProps extends Pick<MessagePortCtx, 'connect'> {
  scope: string
  disabled?: boolean
}

type ConnectInfoType = Pick<MessagePortItemProps, 'connect'> &
  Pick<MessagePortCtx, 'emit'> & {
    scope: string
    rpc?: RPCIns<Transport, typeof mainCtx.actions, typeof workerCtx.actions>
  }
