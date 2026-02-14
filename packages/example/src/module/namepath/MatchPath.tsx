import FormEvent from '@event-chat/antd-item'
import { Input } from 'antd'
import type { FC } from 'react'

const MatchPath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="match-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item label="全局匹配" name="full.origin">
          <Input />
        </FormEvent.Item>
      </div>
    </FormEvent>
  )
}

export default MatchPath
