import { FormEvent, FormItem, useForm, useFormInstance } from '@event-chat/antd-item';
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
import Button, { type ButtonProps } from '@/components/Button';
import { safetyPrint } from '@/utils/fields';

const fieldInput = ['target', 'input'] as const;
const fieldOrigin = ['origin', 'input'] as const;
const fieldRate = ['target', 'rate'] as const;

const { Title } = Typography;
const RateInput = forwardRef<HTMLSpanElement, { value?: number }>(({ value = 0 }, ref) => (
  <Flex gap={8}>
    <Rate value={value} disabled />
    <span ref={ref}>({value})</span>
  </Flex>
));

RateInput.displayName = 'RateInput';

const FormButton: FC<PropsWithChildren<FormButtonProps>> = ({ children, label, ...props }) => (
  <Form.Item label={label}>
    <Button {...props}>{children}</Button>
  </Form.Item>
);

const FormButtonEmit: FC<PropsWithChildren<FormButtonProps>> = ({
  children,
  onClick,
  ...props
}) => {
  const form = useFormInstance();
  return (
    <FormButton
      {...props}
      onClick={(event) => {
        form.emit?.({
          detail: [
            {
              name: fieldInput,
              value: String(Math.random()),
            },
          ],
          name: 'fields-update',
        });
        onClick?.(event);
      }}
    >
      {children}
    </FormButton>
  );
};

const FormModule: FC<PropsWithChildren<FormModuleProps>> = ({ children, footer, ...props }) => {
  return (
    <FormEvent {...props} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      {children}
      <FormItem
        label="受控表单"
        name={fieldInput}
        onChange={(rate, { emit }) => {
          emit({
            detail: !rate ? 0 : safetyPrint(rate).slice(-1).charCodeAt(0),
            name: fieldRate,
          });
        }}
      >
        <Input disabled />
      </FormItem>
      <FormItem name={fieldRate} hidden>
        <InputNumber />
      </FormItem>
      <Form.Item dependencies={[fieldRate]} label="受控响应">
        {(formIns) => {
          const value = (Number(formIns.getFieldValue(fieldRate) ?? 0) % 10) / 2;
          return <RateInput value={value} />;
        }}
      </Form.Item>
      {footer}
    </FormEvent>
  );
};

export const FormOrigin: FC<Pick<InputProps, 'onChange'>> = ({ onChange }) => (
  <FormItem label="主控表单" name={fieldOrigin}>
    <Input onChange={onChange} />
  </FormItem>
);

export const FormWrapper: FC<PropsWithChildren<FormWrapper>> = ({
  children,
  footer,
  form,
  title,
  ...props
}) => (
  <div className="max-w-150">
    <FormModule {...props} footer={footer} form={form}>
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
          onChange={({ target }) => formEvent.emit({ detail: target.value, name: fieldInput })}
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
            // 同时会更新 rate 值
            formRaw.setFieldValue(fieldInput, target.value);
            formRaw.setFieldValue(fieldRate, String(Math.random()));
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

export const FormUpdateFields: FC = () => {
  const [formEvent] = useForm({ group: 'form-update-fields', name: 'fields-update' });
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
        <Form.Item label="随机设值">
          <Button
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
          </Button>
        </Form.Item>
      </FormWrapper>
    </>
  );
};

export default FormModule;

interface FormButtonProps extends ButtonProps {
  label?: ReactNode;
}

interface FormModuleProps extends Omit<
  FormProps,
  'labelCol' | 'onChange' | 'title' | 'wrapperCol'
> {
  footer?: ReactNode;
}

interface FormWrapper extends FormModuleProps {
  title?: ReactNode;
}
