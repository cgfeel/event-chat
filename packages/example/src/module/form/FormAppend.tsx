import FormEvent, { type FormInputInstance, useFormEvent } from '@event-chat/antd-item'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Col, Divider, Input, type InputProps, Row, Tag, Typography } from 'antd'
import { type FC, useRef } from 'react'
import Button from '@/components/Button'

const { Title } = Typography
const InputEmit: FC<InputEmitProps> = ({ remove, ...props }) => {
  const { emit } = useFormEvent()
  return (
    <Row wrap={false} gutter={8}>
      <Col flex="auto">
        <Input
          {...props}
          onChange={(event) => {
            emit?.({ detail: event.target.value, name: '..[+].target-input' })
            props.onChange?.(event)
          }}
        />
      </Col>
      <Col flex="32px" className="flex items-center justify-center">
        <FontAwesomeIcon className="cursor-pointer" icon={faCircleXmark} onClick={remove} />
      </Col>
    </Row>
  )
}

const ListForm: FC = () => {
  return (
    <FormEvent group="list-form" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <FormEvent.Item colon={false} label={` `}>
        <Title level={5}>通过表单组件向相邻的表单项发起更新</Title>
      </FormEvent.Item>
      <FormEvent.List initialValue={[{ 'target-input': 'levi' }]} name="target-list">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <FormEvent.Item key={key} label={`受控表单${name + 1}`} name={[name, 'target-input']}>
                <InputEmit remove={() => remove(name)} />
              </FormEvent.Item>
            ))}
            <FormEvent.Item colon={false} label={` `}>
              {/* antd 非 6.0 把默认提供的按钮加到 Form.Item 会报 findDomNode 的 bug */}
              <Button onClick={add}>+ 添加受控表单</Button>
            </FormEvent.Item>
          </>
        )}
      </FormEvent.List>
    </FormEvent>
  )
}

const OriginForm: FC = () => {
  const inputRef = useRef<FormInputInstance>(null)
  return (
    <FormEvent group="origin-form" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <FormEvent.Item colon={false} label={` `}>
        <Title level={5}>
          通过 <Tag>ref</Tag> 由字段发起更新
        </Title>
      </FormEvent.Item>
      <FormEvent.Item item={inputRef} label="主控表单" name="origin-input">
        <Input
          onChange={({ target }) =>
            inputRef.current?.emit({ detail: target.value, name: 'target-input' })
          }
        />
      </FormEvent.Item>
      <FormEvent.Item label="受控表单" name="target-input">
        <Input />
      </FormEvent.Item>
    </FormEvent>
  )
}

const FormAppend: FC = () => (
  <>
    <div className="max-w-150">
      <OriginForm />
    </div>
    <Divider />
    <div className="max-w-150">
      <ListForm />
    </div>
  </>
)

export default FormAppend

interface InputEmitProps extends InputProps {
  remove?: () => void
}
