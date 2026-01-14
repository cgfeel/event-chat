import FormEvent from '@event-chat/antd-item';
import { Form, Input, InputNumber } from 'antd';
import { type FC, useState } from 'react';
import z from 'zod';
import { type EerrorItem, ErrorResultList } from '@/components/ErrorResultList';

const FormSchema: FC = () => {
  const [debug, setDebug] = useState<EerrorItem[]>([]);
  const [form] = FormEvent.useForm();
  return (
    <div className="max-w-150">
      <FormEvent form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item label="主控字符类型" name={['control', 'string']}>
          <Input
            onChange={({ target }) =>
              form.emit({ detail: target.value, name: ['target', 'number'] })
            }
          />
        </FormEvent.Item>
        <FormEvent.Item label="主控数值类型" name={['control', 'number']}>
          <InputNumber
            className="w-full"
            onChange={(number) => form.emit({ detail: number, name: ['target', 'number'] })}
          />
        </FormEvent.Item>
        <FormEvent.Item
          className="w-full"
          label="受控数值类型"
          name={['target', 'number']}
          schema={z.number().nullish()}
          debug={(log) => {
            if (log) setDebug((current) => current.concat([log]));
          }}
        >
          <InputNumber disabled />
        </FormEvent.Item>
        <Form.Item label="异常监听">
          <div className="rounded-xl bg-gray-800 p-4">
            <ErrorResultList errors={debug} />
          </div>
        </Form.Item>
      </FormEvent>
    </div>
  );
};

export default FormSchema;
