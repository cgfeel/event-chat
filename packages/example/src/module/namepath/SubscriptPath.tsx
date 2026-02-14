import FormEvent from '@event-chat/antd-item'
import { Input } from 'antd'
import type { FC } from 'react'

const SubscriptPath: FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormEvent group="subscript-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item label="主控表单" name="origin-input" extra="namePath 支持数组形式的路径">
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="受控表单" name={['target', 'input']}>
          <Input />
        </FormEvent.Item>
      </FormEvent>
    </div>
  )
}

export default SubscriptPath
