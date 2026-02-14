import FormEvent from '@event-chat/antd-item'
import { Input } from 'antd'
import type { FC } from 'react'

const PointPath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <div className="max-w-150">
      <FormEvent form={form} group="point-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item label="主控表单" name="origin.input.one">
          <Input
            onChange={({ target }) => form.emit({ detail: target.value, name: 'target.input.one' })}
          />
        </FormEvent.Item>
        <FormEvent.Item
          label="受控表单"
          name="target.input.one"
          debug={(detail) => console.log('a--ddd', detail?.error.message)}
        >
          <Input />
        </FormEvent.Item>
      </FormEvent>
    </div>
  )
}

export default PointPath
