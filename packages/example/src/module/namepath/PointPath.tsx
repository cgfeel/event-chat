import FormEvent from '@event-chat/antd-item'
import { Divider, Input, Tag, Typography } from 'antd'
import type { FC } from 'react'

const { Title } = Typography

const PointPath: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <FormEvent form={form} group="point-path" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>
            和 <Tag>formily</Tag> 一致的 <Tag>.</Tag> 字段路径
          </Title>
        </FormEvent.Item>
        <FormEvent.Item label="主控表单" name="formily.origin.input">
          <Input
            onChange={({ target }) =>
              form.emit({ detail: target.value, name: 'formily.target.input' })
            }
          />
        </FormEvent.Item>
        <FormEvent.Item label="受控表单" name="formily.target.input">
          <Input />
        </FormEvent.Item>
      </div>
      <Divider />
      <div className="max-w-150">
        <FormEvent.Item colon={false} label={` `}>
          <Title level={5}>
            和 <Tag>antd</Tag> 一致的数组字段路径
          </Title>
        </FormEvent.Item>
        <FormEvent.Item label="主控表单" name={['antd', 'origin', 'input']}>
          <Input
            onChange={({ target }) =>
              form.emit({ detail: target.value, name: ['antd', 'target', 'input'] })
            }
          />
        </FormEvent.Item>
        <FormEvent.Item label="受控表单" name={['antd', 'target', 'input']}>
          <Input />
        </FormEvent.Item>
      </div>
    </FormEvent>
  )
}

export default PointPath
