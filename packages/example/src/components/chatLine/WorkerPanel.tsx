import { SendOutlined, SyncOutlined } from '@ant-design/icons'
import { Input, type InputProps } from 'antd'
import { type FC, type PropsWithChildren, type ReactNode, useState } from 'react'
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

const { buttons, bar, corner, inputBox, inputLine, scroll, selectUser, sendBtn, wrap } = styles({
  variant: 'simple',
})

const WorkerPanel: FC<PropsWithChildren<WorkerPanelProps>> = ({
  button,
  card,
  children,
  defaultValue,
  disabled,
  loading,
  name: chatName,
  title,
  value,
  onChange,
  onSubmit,
  allowClear = true,
  ...props
}) => {
  const [text, setText] = useState(value ?? defaultValue)
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
            disabled={disabled}
            value={text}
            variant="borderless"
            style={{ padding: 0 }}
            onChange={(event) => {
              onChange?.(event)
              setText(event.target.value)
            }}
          />
        </div>
        {button && (
          <div className={buttons()}>
            <button
              className={sendBtn({ disabled: disabled ? true : !text })}
              disabled={disabled}
              type="button"
              onClick={() => {
                if (text) {
                  onSubmit?.(text)
                  setText('')
                }
              }}
            >
              {loading ? <SyncOutlined spin /> : <SendOutlined rotate={-20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerPanel

interface WorkerPanelProps
  extends
    Pick<SendMessage, 'name'>,
    Omit<InputProps, 'name' | 'onSubmit' | 'style' | 'title' | 'variant'> {
  button?: boolean
  card?: ReactNode
  loading?: boolean
  title?: ReactNode
  onSubmit?: (text: InputProps['value']) => void
}
