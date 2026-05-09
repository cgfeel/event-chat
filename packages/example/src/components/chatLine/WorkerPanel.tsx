import { Input, type InputProps } from 'antd'
import { type FC, type PropsWithChildren, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import type { SendMessage } from './fields'
import { baseStyle } from './utils'

const styles = tv({
  extend: baseStyle,
  variants: {
    variant: {
      simple: {
        bar: 'h-12',
        inputBox: 'pr-4',
        selectUser: 'p-4 text-gray-500 select-none',
      },
    },
  },
})

const { bar, corner, inputBox, inputLine, scroll, selectUser, wrap } = styles({ variant: 'simple' })

const WorkerPanel: FC<PropsWithChildren<WorkerPanelProps>> = ({
  card,
  children,
  name: chatName,
  title,
  allowClear = true,
  ...props
}) => {
  return (
    <div className={wrap({ class: 'bg-gray-800' })}>
      <div className={corner()}>
        {chatName} {card && <span>{card}</span>}
      </div>
      <div className={scroll()}>{children}</div>
      <div className={bar()}>
        {title && <div className={selectUser()}>{title}:</div>}
        <div className={inputBox()}>
          <Input
            {...props}
            allowClear={allowClear}
            className={inputLine()}
            variant="borderless"
            style={{ padding: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkerPanel

interface WorkerPanelProps
  extends Pick<SendMessage, 'name'>, Omit<InputProps, 'name' | 'style' | 'title' | 'variant'> {
  card?: ReactNode
  title?: ReactNode
}
