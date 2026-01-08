import { FormEvent, FormItem, useForm } from '@event-chat/antd-item';
import {
  Divider,
  Flex,
  Form,
  type FormProps,
  Input,
  type InputProps,
  Rate,
  Tag,
  Typography,
} from 'antd';
import type { FC, PropsWithChildren } from 'react';
import { safetyPrint } from '@/utils/fields';

const { Title } = Typography;

const FormModule: FC<PropsWithChildren<FormModuleProps>> = ({ children, ...props }) => {
  return (
    <FormEvent {...props} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      {children}
      <FormItem label="受控表单" name={['target', 'input']}>
        <Input disabled />
      </FormItem>
      <Form.Item dependencies={[['target', 'input']]} label="受控响应">
        {(formIns) => {
          const rate: unknown = formIns.getFieldValue(['target', 'input']);
          const value = !rate ? 0 : safetyPrint(rate).slice(-1).charCodeAt(0);
          return (
            <Flex gap={8}>
              <Rate disabled value={(value % 10) / 2} />
              <span>({value})</span>
            </Flex>
          );
        }}
      </Form.Item>
    </FormEvent>
  );
};

const FormOrigin: FC<Pick<InputProps, 'onChange'>> = ({ onChange }) => (
  <FormItem label="主控表单" name={['origin', 'input']}>
    <Input onChange={onChange} />
  </FormItem>
);

export const FooterTips: FC<PropsWithChildren> = ({ children }) => (
  <>
    <Divider orientation="left" plain>
      说明
    </Divider>
    <div>{children}</div>
  </>
);

export const FormEmit: FC = () => {
  const [formEvent] = useForm({ name: 'testst', group: 'test' });
  const [formRaw] = Form.useForm();
  return (
    <>
      <div className="max-w-150">
        <FormModule form={formEvent}>
          <Form.Item colon={false} label={` `}>
            <Title level={5}>
              <Tag>emit</Tag> 触发更新会被 <Tag>dependencies</Tag> 监听
            </Title>
          </Form.Item>
          <FormOrigin
            onChange={({ target }) =>
              formEvent.emit({ detail: target.value, name: ['target', 'input'] })
            }
          />
        </FormModule>
      </div>
      <Divider />
      <div className="max-w-150">
        <FormModule form={formRaw}>
          <Form.Item colon={false} label={` `}>
            <Title level={5}>
              <Tag>setFieldValue</Tag> 触发更新不会被 <Tag>dependencies</Tag> 监听
            </Title>
          </Form.Item>
          <FormOrigin
            onChange={({ target }) => formRaw.setFieldValue(['target', 'input'], target.value)}
          />
        </FormModule>
      </div>
    </>
  );
};

export default FormModule;

interface FormModuleProps extends Omit<FormProps, 'labelCol' | 'wrapperCol'> {}
