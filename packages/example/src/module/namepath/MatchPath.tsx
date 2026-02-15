import FormEvent from '@event-chat/antd-item'
import { Divider, Input, Typography } from 'antd'
import type { FC } from 'react'

const { Title } = Typography

const MatchPath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="match-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>全局匹配</Title>
        </FormEvent.Item>
        <FormEvent.Item extra="匹配路径：*" label="全局匹配" name="full.origin">
          <Input onChange={({ target }) => form.emit({ detail: target.value, name: '*' })} />
        </FormEvent.Item>
        <FormEvent.Item label="target 1" name="part.origin.all.1">
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="target 2" name="part.origin.all.2">
          <Input />
        </FormEvent.Item>
      </div>
      <Divider />
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>局部匹配</Title>
        </FormEvent.Item>
        <FormEvent.Item extra="匹配路径：part.*.partial.*" label="局部匹配" name="partial.origin">
          <Input
            onChange={({ target }) => form.emit({ detail: target.value, name: 'part.*.partial.*' })}
          />
        </FormEvent.Item>
        <FormEvent.Item label="partial 1" name="part.origin.partial.1">
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="partial 2" name="part.input.partial.2">
          <Input />
        </FormEvent.Item>
      </div>
    </FormEvent>
  )
}

export default MatchPath
