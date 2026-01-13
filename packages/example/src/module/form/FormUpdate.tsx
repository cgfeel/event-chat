import FormEvent from '@event-chat/antd-item';
import { Divider, Form, Tag } from 'antd';
import { type FC, useState } from 'react';
import { FormButton, FormWrapper } from './FormModule';
import { fieldInput, fieldRate } from './utils';

const FormUpdate: FC = () => {
  const [formEvent] = FormEvent.useForm({ group: 'form-update' });
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
            <Tag>emit</Tag> 触发更新会被 <Tag>onValuesChange</Tag> 监听
          </>
        }
        onValuesChange={(...args) => {
          setData(args);
        }}
      >
        <FormButton
          label="随机设值"
          onClick={() => {
            formEvent.emit({ detail: String(Math.random()), name: fieldInput });
          }}
        >
          emit
        </FormButton>
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
            <Tag>setFieldValue</Tag> 触发更新不会被 <Tag>onFieldsChange</Tag> 监听
          </>
        }
      >
        <FormButton
          label="随机设值"
          onClick={() => {
            // 同时会更新 rate 值
            const value = String(Math.random());
            formRaw.setFieldValue(fieldInput, value);
            formRaw.setFieldValue(fieldRate, value);
          }}
        >
          emit
        </FormButton>
      </FormWrapper>
    </>
  );
};

export default FormUpdate;
