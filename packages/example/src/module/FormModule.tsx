import { FormEvent, FormItem, useForm } from '@event-chat/antd-item';
import {
  Divider,
  Flex,
  Form,
  type FormProps,
  Input,
  InputNumber,
  type InputProps,
  Rate,
  Tag,
  Typography,
} from 'antd';
import { type FC, type PropsWithChildren, type ReactNode, forwardRef, useState } from 'react';
import Button from '@/components/Button';
import { safetyPrint } from '@/utils/fields';

const { Title } = Typography;
const RateInput = forwardRef<HTMLSpanElement, { value?: number }>(({ value = 0 }, ref) => (
  <Flex gap={8}>
    <Rate value={value} disabled />
    <span ref={ref}>({value})</span>
  </Flex>
));

RateInput.displayName = 'RateInput';

const FormModule: FC<PropsWithChildren<FormModuleProps>> = ({ children, ...props }) => {
  return (
    <FormEvent {...props} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      {children}
      <FormItem
        label="受控表单"
        name={['target', 'input']}
        onChange={(rate, { emit }) => {
          emit({
            detail: !rate ? 0 : safetyPrint(rate).slice(-1).charCodeAt(0),
            name: ['target', 'rate'],
          });
        }}
      >
        <Input disabled />
      </FormItem>
      <FormItem name={['target', 'rate']} hidden>
        <InputNumber />
      </FormItem>
      <Form.Item dependencies={[['target', 'rate']]} label="受控响应">
        {(formIns) => {
          const value = (Number(formIns.getFieldValue(['target', 'rate']) ?? 0) % 10) / 2;
          return <RateInput value={value} />;
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

const FormWrapper: FC<PropsWithChildren<FormWrapper>> = ({ children, form, title, ...props }) => (
  <div className="max-w-150">
    <FormModule {...props} form={form}>
      <Form.Item colon={false} label={` `}>
        <Title level={5}>{title}</Title>
      </Form.Item>
      {children}
    </FormModule>
  </div>
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
  const [formEvent] = useForm({ group: 'form-emit' });
  const [formRaw] = Form.useForm();
  return (
    <>
      <FormWrapper
        form={formEvent}
        title={
          <>
            <Tag>emit</Tag> 触发更新会被 <Tag>dependencies</Tag> 监听
          </>
        }
      >
        <FormOrigin
          onChange={({ target }) =>
            formEvent.emit({ detail: target.value, name: ['target', 'input'] })
          }
        />
      </FormWrapper>
      <Divider />
      <FormWrapper
        form={formRaw}
        title={
          <>
            <Tag>setFieldValue</Tag> 触发更新不会被 <Tag>dependencies</Tag> 监听
          </>
        }
      >
        <FormOrigin
          onChange={({ target }) => {
            // 同时会更新 rate 值，反正不会被响应，这里给个固定值
            formRaw.setFieldValue(['target', 'input'], target.value);
            formRaw.setFieldValue(['target', 'rate'], 5);
          }}
        />
      </FormWrapper>
    </>
  );
};

export const FormUpdate: FC = () => {
  const [formEvent] = useForm({ group: 'form-update' });
  const [formRaw] = Form.useForm();
  const [alldata, setData] = useState<unknown[]>([]);
  return (
    <>
      <FormWrapper
        form={formEvent}
        title={
          <>
            <Tag>emit</Tag> 触发更新会被 <Tag>dependencies</Tag> 监听
          </>
        }
        onValuesChange={(...args) => {
          setData(args);
        }}
      >
        <Form.Item label="随机设值">
          <Button
            onClick={() => {
              formEvent.emit({ detail: String(Math.random()), name: ['target', 'input'] });
            }}
          >
            emit
          </Button>
        </Form.Item>
      </FormWrapper>
      <pre>{JSON.stringify(alldata, null, 2)}</pre>
      <Divider />
      <FormWrapper
        form={formRaw}
        title={
          <>
            <Tag>setFieldValue</Tag> 触发更新不会被 <Tag>dependencies</Tag> 监听
          </>
        }
      >
        <FormOrigin
          onChange={({ target }) => formRaw.setFieldValue(['target', 'input'], target.value)}
        />
      </FormWrapper>
    </>
  );
};

export default FormModule;

interface FormModuleProps extends Omit<
  FormProps,
  'labelCol' | 'onChange' | 'title' | 'wrapperCol'
> {}

interface FormWrapper extends FormModuleProps {
  title?: ReactNode;
}
