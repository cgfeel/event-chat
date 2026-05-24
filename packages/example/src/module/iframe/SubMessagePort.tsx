import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createServiceWorkerRegistrationRPC } from '@event-chat/rpc/serviceWorkerRegistration'
import { createWindowRPC } from '@event-chat/rpc/window'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import { type FC, useMemo, useState } from 'react'
import { ChatScroll, WorkerPanel } from '@/components/chatLine'
import { isKey } from '@/utils/fields'
import { messageGroup, messagePortService, messagePortWeb, messagePortWindow } from '../rpc/uitls'
import { titleRange } from '../rpc/windowUitls'

const MessagePortItem: FC<MessagePortItemProps> = ({ disabled, scope }) => {
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

const ServiceWorkerRPC: FC<MessagePortItemProps> = ({ disabled, scope }) => {
  const { connected } = useRPC({
    drive: createServiceWorkerRegistrationRPC,
    init: () =>
      navigator.serviceWorker.register(new URL('../rpc/worker/msw.ts', import.meta.url), { scope }),
  })

  const connecting = useMemo(() => !disabled && !connected, [connected, disabled])
  return <MessagePortItem disabled={connecting} scope={scope} />
}

const WindowRPC: FC<MessagePortItemProps> = (props) => {
  useEventChat('', {
    // 处理收到的消息，并转发到消息列表
    callback: () => {},
  })
  return <MessagePortItem {...props} />
}

const WorkerRPC: FC<MessagePortItemProps> = ({ disabled, scope }) => {
  const { connected } = useRPC({
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('../rpc/worker/mworker.ts', import.meta.url), {
        name: 'my-worker',
      }),
  })

  const connecting = useMemo(() => !disabled && !connected, [connected, disabled])

  return <MessagePortItem disabled={connecting} scope={scope} />
}

const RPCRecord = Object.freeze({
  [messagePortService]: ServiceWorkerRPC,
  [messagePortWeb]: WorkerRPC,
  [messagePortWindow]: WindowRPC,
})

const SubMessagePort: FC<SubMessagePortProps> = ({ group }) => {
  const ComRPC = useMemo(() => (isKey(group, RPCRecord) ? RPCRecord[group] : null), [group])
  const { connected } = useRPC({
    drive: createWindowRPC,
    init: () => window.parent,
  })
  return !ComRPC || !group ? null : <ComRPC disabled={connected} scope={group} />
}

export default SubMessagePort

interface MessagePortItemProps {
  scope: string
  disabled?: boolean
}

interface SubMessagePortProps {
  group?: string
}
