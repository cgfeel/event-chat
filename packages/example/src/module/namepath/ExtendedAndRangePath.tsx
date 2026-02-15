import FormEvent from '@event-chat/antd-item'
import { Divider, Input, Typography } from 'antd'
import type { FC } from 'react'

const { Title } = Typography

const matchPath = {
  'test~': '扩展匹配',
  'aa.*[1:2].bb': '范围匹配',
  'aa.*[1:].bb': '范围匹配',
  'aa.*[:100].bb': '范围匹配',
}

const fields = ['test_111', 'test_222', 'aa.1.bb', 'aa.2.bb', 'aa.3.bb', 'aa.1000.bb']

const ExtendedAndRangePath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="extended-range" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>主控区域</Title>
        </FormEvent.Item>
        {Object.entries(matchPath).map(([name, text], i) => (
          <FormEvent.Item
            key={name}
            extra={`匹配路径：${name}`}
            label={`${text}-${i}`}
            name={`full.${i}.origin`}
          >
            <Input onChange={({ target }) => form.emit({ detail: target.value, name })} />
          </FormEvent.Item>
        ))}
      </div>
      <Divider />
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>受控区域</Title>
        </FormEvent.Item>
        {fields.map((field) => (
          <FormEvent.Item key={field} label={field} name={field}>
            <Input />
          </FormEvent.Item>
        ))}
      </div>
    </FormEvent>
  )
}

export default ExtendedAndRangePath
