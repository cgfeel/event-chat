import FormEvent from '@event-chat/antd-item'
import { Divider, Input, Typography } from 'antd'
import type { FC } from 'react'

const { Title } = Typography

const groupName = 'aa.*(bb,kk,dd,ee.*(oo,gg).gg).cc'
const reverseName = '*(!aa,bb,cc)'

const fields = ['kk', 'aa.bb.cc', 'aa.kk.cc', 'aa.dd.cc', 'aa.ee.oo.gg.cc', 'aa.ee.gg.gg.cc']

const GroupAndReversePath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="group-reverse" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>主控区域</Title>
        </FormEvent.Item>
        <FormEvent.Item extra={`广播路径：${groupName}，自身路径：aa`} label="广播匹配" name="aa">
          <Input onChange={({ target }) => form.emit({ detail: target.value, name: groupName })} />
        </FormEvent.Item>
        <FormEvent.Item extra={`反向路径：${reverseName}`} label="反向匹配" name="reverse.origin">
          <Input
            onChange={({ target }) => form.emit({ detail: target.value, name: reverseName })}
          />
        </FormEvent.Item>
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

export default GroupAndReversePath
