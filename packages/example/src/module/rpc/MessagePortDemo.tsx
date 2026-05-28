import { useEventChat } from '@event-chat/core'
import { Select } from 'antd'
import { type FC, type PropsWithChildren, useReducer, useState } from 'react'
import z from 'zod'
import Button from '@/components/Button'
import { ChatScroll } from '@/components/chatLine'
import { isKey } from '@/utils/fields'
import MessagePortIframe from './MessagePortIframe'
import { messageGroup, messagePortService, messagePortWeb, messagePortWindow } from './uitls'
import { panelStyles } from './windowUitls'

const { item, itemTitle, logs, panel, worker, wrap } = panelStyles()
const itemList = [messagePortService, messagePortWeb, messagePortWindow] as const

const reducer = (state: WorkerStateType, action: Exclude<WorkerStateType['step'], 'loading'>) => {
  switch (action) {
    case 'loaded':
      return !['destroing', 'loading'].includes(state.step)
        ? state
        : { loading: false, step: action }
    case 'connecting':
      return state.step !== 'loaded' ? state : { loading: true, step: action }
    case 'connected':
      return state.step !== 'connecting' ? state : { loading: false, step: action }
    case 'destroing':
      return state.step !== 'connected' ? state : { loading: false, step: action }
    default:
      return state
  }
}

const actionRecord = Object.freeze({ loaded: 'connecting', connected: 'destroing' })
const stepText = Object.freeze({
  connecting: 'connecting',
  connected: 'destroy',
  destroing: 'destroing',
  loaded: 'connect',
  loading: 'loading',
})

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({ children, scope }) => {
  const [status, setStatus] = useState('normal')
  const [{ loading, step }, dispatch] = useReducer(reducer, { loading: true, step: 'loading' })

  const { emit } = useEventChat(`chat-${scope}`, {
    group: messageGroup,
    schema: z.enum(['connected', 'loaded']),
    callback: ({ detail }) => {
      dispatch(detail)
    },
  })

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <Button
          disabled={loading}
          loading={loading}
          variant={['connected', 'destroing'].includes(step) ? 'secondary' : 'primary'}
          onClick={() => {
            if (isKey(step, actionRecord)) {
              dispatch(actionRecord[step])
              emit({
                detail: { online: actionRecord[step] === 'connecting', type: 'connect' },
                name: `item-${scope}`,
              })
            }
          }}
        >
          {stepText[step]}
        </Button>
        <Select
          options={[
            { label: '单独发送', value: 'normal' },
            {
              label: '全局广播',
              value: 'broadcast',
            },
          ]}
          size="small"
          value={status}
          onChange={(detail) => {
            emit({ name: `item-${scope}`, detail })
            setStatus(detail)
          }}
        />
      </div>
      <div className={worker()}>{children}</div>
    </div>
  )
}

const WorkerLogs: FC = () => {
  return (
    <div className={logs()}>
      <ChatScroll direction="vertical" group={messageGroup} name={`chat-message-port`} />
    </div>
  )
}

const MessagePortDemo: FC = () => {
  return (
    <div className={wrap()}>
      <div className={panel()}>
        <WorkerLogs />
      </div>
      {itemList.map((itemkey) => (
        <WorkerGrid key={itemkey} scope={itemkey}>
          <MessagePortIframe sub={itemkey} />
        </WorkerGrid>
      ))}
    </div>
  )
}

export default MessagePortDemo

interface WorkerGridProps {
  scope: string
}

type WorkerStateType = {
  loading: boolean
  step: 'loading' | 'loaded' | 'connecting' | 'connected' | 'destroing'
}
