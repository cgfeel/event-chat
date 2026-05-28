import { messageGroup } from '@/module/rpc/uitls'
import { titleRange } from '@/module/rpc/windowUitls'
import { createMessagePort, mainCtx, portWorkerCtx, workerCtx } from '@/services/messagePortService'
import { useEventChat } from '@event-chat/core'
import type { RPCDecorator, Transport } from '@event-chat/rpc'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import {
  type FC,
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'

const useConnect = (ref: ForwardedRef<MessagePortInstance>, { disabled, rpc }: ConnectInfoType) => {
  const [online, setLine] = useState(false)
  useImperativeHandle(ref, () => ({
    connect: (port) => {
      rpc?.request('connect', { payload: false, transfer: [port] }).catch(() => {})
    },
    destroy: () => {
      rpc?.request('destroy').catch(() => {})
    },
  }))

  const connect = useMemo(() => (!disabled ? !online : true), [disabled, online])
  mainCtx.provider({ connect: () => setLine(true), destroy: () => setLine(false) })

  return [connect] as const
}

const MessagePortItem: FC<Omit<MessagePortItemProps, 'connect'>> = ({ disabled, scope }) => {
  const [sending, setSending] = useState(false)
  const allow = useMemo(
    () => (sending ? 'Sending' : undefined) ?? (!disabled ? 'Connect' : 'Disconnect'),
    [disabled, sending]
  )

  return (
    <WorkerPanel
      disabled={disabled}
      name={`iframe:${scope}`}
      title={titleRange[allow]}
      onSubmit={() => {
        setSending(true)
      }}
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
        onConnect: () => connect?.(true),
        onDisconnect: () => connect?.(false),
      },
      consume: workerCtx.actions,
      event: mainCtx.actions,
      drive: createServiceWorkerRegistrationRPC,
      init: () =>
        navigator.serviceWorker.register(new URL('../../rpc/worker/msw.ts', import.meta.url), {
          scope,
        }),
    })

    const [connecting] = useConnect(ref, { disabled: !disabled ? !connected : true, rpc })
    return <MessagePortItem disabled={connecting} scope={scope} />
  }
)

const WorkerRPC = forwardRef<MessagePortInstance, MessagePortItemProps>(
  ({ disabled, scope, connect }, ref) => {
    const { connected, rpc } = useRPC({
      config: {
        channel: messageGroup,
        onConnect: () => connect?.(true),
        onDisconnect: () => connect?.(false),
      },
      consume: workerCtx.actions,
      event: mainCtx.actions,
      drive: createWorkerRPC,
      init: () =>
        new Worker(new URL('../../rpc/worker/mworker.ts', import.meta.url), {
          name: 'my-worker',
        }),
    })

    const [connecting] = useConnect(ref, { disabled: !disabled ? !connected : true, rpc })
    return <MessagePortItem disabled={connecting} scope={scope} />
  }
)

const WindowRPC = forwardRef<MessagePortInstance, MessagePortItemProps>(
  ({ disabled, scope, connect }, ref) => {
    const portRef = useRef<ReturnType<typeof createMessagePort> | null>(null)
    const [online, setLine] = useState(false)

    useEventChat('', {
      // 处理收到的消息，并转发到消息列表
      callback: () => {},
    })

    useEffect(() => {
      connect?.(true)
    }, [connect])

    useImperativeHandle(
      ref,
      () => ({
        connect: (port) => {
          portRef.current = createMessagePort(port, {
            onConnect: () => setLine(true),
            onDisconnect: () => setLine(false),
            scope,
          })
        },
        destroy: () => {
          portRef.current?.[1]?.()
          portRef.current = null
        },
      }),
      [scope]
    )

    portWorkerCtx.provider({})

    return <MessagePortItem disabled={!disabled ? !online : true} scope={scope} />
  }
)

if (process.env.NODE_ENV !== 'production') {
  ServiceWorkerRPC.displayName = 'ServiceWorkerRPC'
  WindowRPC.displayName = 'WindowRPC'
  WorkerRPC.displayName = 'WorkerRPC'
}

export { ServiceWorkerRPC, WindowRPC, WorkerRPC }

export interface MessagePortInstance {
  connect: (port: MessagePort) => void
  destroy: () => void
}

interface MessagePortItemProps {
  scope: string
  disabled?: boolean
  connect?: (online: boolean) => void
}

type RPCInstance = ReturnType<
  typeof RPCDecorator<Transport, typeof mainCtx.actions, typeof workerCtx.actions>
>[0]

type ConnectInfoType = Pick<MessagePortItemProps, 'disabled'> & {
  rpc?: RPCInstance
}
