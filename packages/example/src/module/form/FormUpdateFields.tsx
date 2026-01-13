import FormEvent from '@event-chat/antd-item';
import { Divider, Form, Tag } from 'antd';
import { type FC, useState } from 'react';
import { FormButton, FormButtonEmit, FormWrapper } from './FormModule';

const FormUpdateFields: FC = () => {
  const [formEvent] = FormEvent.useForm({ group: 'form-update-fields', name: 'fields-update' });
  const [formRaw] = Form.useForm();
  const [alldata, setData] = useState<unknown[]>([]);
  return (
    <>
      <FormWrapper
        footer={
          <Form.Item colon={false} label={` `}>
            <pre className="bg-gray-800 max-h-80 overflow-auto p-4 rounded-xl text-sm">
              {JSON.stringify(alldata, null, 2)}
            </pre>
          </Form.Item>
        }
        form={formEvent}
        title={
          <>
            <Tag>emit</Tag> 触发表单字段更新
          </>
        }
        onValuesChange={(...args) => {
          setData(args);
        }}
      >
        <FormButtonEmit label="随机设值">emit</FormButtonEmit>
      </FormWrapper>
      <Divider />
      <FormWrapper
        footer={
          <Form.Item colon={false} label={` `} shouldUpdate>
            {() => (
              <pre className="bg-gray-800 max-h-80 overflow-auto p-4 rounded-xl text-sm">
                {JSON.stringify(formRaw.getFieldsValue(), null, 2)}
              </pre>
            )}
          </Form.Item>
        }
        form={formRaw}
        title={
          <>
            <Tag>setField sValue</Tag> 触发表单字段更新
          </>
        }
      >
        <FormButton
          label="随机设值"
          onClick={() => {
            // 同时会更新 rate 值
            const value = String(Math.random());
            formRaw.setFieldsValue({
              target: {
                input: value,
                rate: value,
              },
            });
          }}
        >
          emit
        </FormButton>
      </FormWrapper>
    </>
  );
};

export default FormUpdateFields;
