import FormEvent from '@event-chat/antd-item'
import { Input } from 'antd'
import type { FC } from 'react'

const EscapePath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="escape-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item extra="转义路径示例：target.\\\\,.input" label="主控表单" name="origin">
          <Input
            onChange={({ target }) =>
              form.emit({ detail: target.value, name: 'target.\\\\,.input' })
            }
          />
        </FormEvent.Item>
        <FormEvent.Item label="受控表单" name={['target', '\\,', 'input']}>
          <Input />
        </FormEvent.Item>
      </div>
    </FormEvent>
  )
}

export default EscapePath
