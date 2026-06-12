import { useEventChat } from '@event-chat/core'
import { Select, type SelectProps } from 'antd'
import { type FC, type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import { panelStyles } from './windowUitls'

const { item, itemTitle, worker } = panelStyles()

const WorkerGrid: FC<PropsWithChildren<WorkerGridProps>> = ({
  children,
  fallback,
  group,
  options,
  scope,
  title,
  onChange,
  defaultStatus = '',
}) => {
  const [status, setStatus] = useState(defaultStatus)
  const { emit } = useEventChat(`chat-${scope}`, { group })

  useEffect(() => {
    if (fallback) setStatus(defaultStatus)
  }, [defaultStatus, fallback])

  return (
    <div className={item()} data-theme="dark">
      <div className={itemTitle()}>
        <span>{title}</span>
        <Select
          options={options}
          size="small"
          value={status}
          onChange={(detail, option) => {
            emit({ name: `item-${scope}`, detail })
            onChange?.(detail, option)
            setStatus(detail)
          }}
        />
      </div>
      {fallback === undefined ? <div className={worker()}>{children}</div> : fallback}
    </div>
  )
}

export default WorkerGrid

interface WorkerGridProps extends Pick<SelectProps<string>, 'options' | 'onChange'> {
  group: string
  scope: string
  defaultStatus?: string
  fallback?: ReactNode
  title?: ReactNode
}
