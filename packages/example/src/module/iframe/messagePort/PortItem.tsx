import { messageGroup } from '@/module/rpc/uitls'
import { titleRange } from '@/module/rpc/windowUitls'
import { transmitResult } from '@/services/baseSWService'
import {
  type MessagePortCtx,
  createMessagePort,
  mainCtx,
  portWorkerCtx,
  workerCtx,
} from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import { RPCDecorator, type Transport } from '@event-chat/rpc'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import type { InputProps } from 'antd'
import { type FC, useCallback, useMemo, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'

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
    (receivedBody) =>
      print({
        message: 'success',
        result: {
          code: 200,
          data: {
            date: new Date(),
            id: Date.now(),
            name: 'mworker',
          },
          message: `${receivedBody.message}-(transmit:ww-port)`,
          receivedBody,
        },
      }),
    [print]
  )

  // 主线程由 iframe 提供上下文，分支线程由分支提供上下文
  portWorkerCtx.provider({ filter })
  mainCtx.provider({ print })

  return [sending, onSubmit] as const
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

const ServiceWorkerRPC: FC<MessagePortItemProps> = ({ disabled, scope, connect }) => {
  const { connected, rpc } = useRPC({
    config: {
      channel: messageGroup,
    },
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createServiceWorkerRegistrationRPC,
    init: () =>
      navigator.serviceWorker.register(new URL('../../rpc/worker/msw.ts', import.meta.url), {
        scope,
      }),
  })

  const { emit } = useEventChat('', { group: messageGroup })
  const [sending, onSubmit] = useConnect({ rpc, scope, connect, emit })

  return (
    <MessagePortItem
      disabled={!disabled ? !connected : true}
      scope={scope}
      sending={sending}
      onSubmit={onSubmit}
    />
  )
}

const WorkerRPC: FC<MessagePortItemProps> = ({ disabled, scope, connect }) => {
  const { connected, rpc } = useRPC({
    config: {
      channel: messageGroup,
    },
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('../../rpc/worker/mworker.ts', import.meta.url), {
        name: 'my-worker',
      }),
  })

  const { emit } = useEventChat('', { group: messageGroup })
  const [sending, onSubmit] = useConnect({ rpc, scope, connect, emit })

  return (
    <MessagePortItem
      disabled={!disabled ? !connected : true}
      scope={scope}
      sending={sending}
      onSubmit={onSubmit}
    />
  )
}

const WindowRPC: FC<MessagePortItemProps> = ({ disabled, scope, connect }) => {
  const { emit } = useEventChat('', { group: messageGroup })
  const [sending, onSubmit] = useConnect({ scope, connect, emit })

  return <MessagePortItem disabled={disabled} scope={scope} sending={sending} onSubmit={onSubmit} />
}

export { ServiceWorkerRPC, WindowRPC, WorkerRPC }

export interface MessagePortInstance {
  connect: (port: MessagePort) => void
  destroy: () => void
}

interface MessagePortItemProps extends Pick<MessagePortCtx, 'connect'> {
  scope: string
  disabled?: boolean
}

type RPCInstance = ReturnType<
  typeof RPCDecorator<Transport, typeof mainCtx.actions, typeof workerCtx.actions>
>[0]

type ConnectInfoType = Pick<MessagePortItemProps, 'connect'> &
  Pick<MessagePortCtx, 'emit'> & {
    scope: string
    rpc?: RPCInstance
  }
