import FormEvent from '@event-chat/antd-item';
import { Form, type FormListOperation, Input } from 'antd';
import type { FC } from 'react';
import Button, { type ButtonProps } from '@/components/Button';
import { safetyPrint } from '@/utils/fields';

const ListFooter: FC<AddButtonProps> = ({ add, onClick, latest = -1 }) => (
  <>
    <Form.Item dependencies={[['name', latest]]} label={`受控字段${latest}`}>
      {(formIns) => {
        const value =
          latest > -1 ? safetyPrint(formIns.getFieldValue(['name', latest])) : undefined;
        return <Input value={value} disabled />;
      }}
    </Form.Item>
    <Form.Item colon={false} label={` `}>
      <Button onClick={() => add()}>+ add field</Button>
      <Button variant="text" onClick={onClick}>
        Update latest value
      </Button>
    </Form.Item>
  </>
);

const FormList: FC = () => {
  const [formEvent] = FormEvent.useForm({ group: 'form-list' });
  const [form] = Form.useForm();
  return (
    <div className="max-w-150">
      <FormEvent form={formEvent} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.List initialValue={['levi']} name="name">
          {(fields, { add }) => (
            <>
              {fields.map(({ key, name }) => (
                <FormEvent.Item
                  colon={key === 0}
                  key={key}
                  label={key === 0 ? 'name' : ` `}
                  name={name}
                >
                  <Input />
                </FormEvent.Item>
              ))}
              <ListFooter
                latest={fields.length - 1}
                add={add}
                onClick={() =>
                  formEvent.emit({ detail: Date.now(), name: ['name', fields.length - 1] })
                }
              />
            </>
          )}
        </FormEvent.List>
      </FormEvent>
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.List initialValue={['levi']} name="name">
          {(fields, { add }) => (
            <>
              {fields.map(({ key, name }) => (
                <Form.Item colon={key === 0} key={key} label={key === 0 ? 'name' : ` `} name={name}>
                  <Input />
                </Form.Item>
              ))}
              <ListFooter
                latest={fields.length - 1}
                add={add}
                onClick={() => form.setFieldValue(['name', fields.length - 1], Date.now())}
              />
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
};

export default FormList;

interface AddButtonProps extends Pick<ButtonProps, 'onClick'>, Pick<FormListOperation, 'add'> {
  latest?: number;
}
