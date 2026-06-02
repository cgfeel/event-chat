import { useEventChat } from '@event-chat/core'
import { Select, type SelectProps } from 'antd'
import { type FC, type PropsWithChildren, type ReactNode, useState } from 'react'
import { panelStyles } from '../windowUitls'

const { item, itemTitle, worker } = panelStyles()

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({
  children,
  group,
  options,
  scope,
  title,
  defaultStatus = '',
}) => {
  const [status, setStatus] = useState(defaultStatus)
  const { emit } = useEventChat(`chat-${scope}`, { group })
  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <span>{title}</span>
        <Select
          options={options}
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

export default WorkerGrid

interface WorkerGridProps extends Pick<SelectProps, 'options'> {
  group: string
  scope: string
  defaultStatus?: string
  title?: ReactNode
}
