import FormEvent from '@event-chat/antd-item';
import {
  Flex,
  Form,
  type FormProps,
  Input,
  InputNumber,
  type InputProps,
  Rate,
  Typography,
} from 'antd';
import { type FC, type PropsWithChildren, type ReactNode, forwardRef } from 'react';
import Button, { type ButtonProps } from '@/components/Button';
import { safetyPrint } from '@/utils/fields';
import { fieldInput, fieldOrigin, fieldRate } from './utils';

const { Title } = Typography;
const RateInput = forwardRef<HTMLSpanElement, { value?: number }>(({ value = 0 }, ref) => (
  <Flex gap={8}>
    <Rate value={value} disabled />
    <span ref={ref}>({value})</span>
  </Flex>
));

RateInput.displayName = 'RateInput';

export const FormButton: FC<PropsWithChildren<FormButtonProps>> = ({
  children,
  label,
  ...props
}) => (
  <Form.Item label={label}>
    <Button {...props}>{children}</Button>
  </Form.Item>
);

export const FormButtonEmit: FC<PropsWithChildren<FormButtonProps>> = ({
  children,
  onClick,
  ...props
}) => {
  const form = FormEvent.useFormInstance();
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
      <FormEvent.Item
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
      </FormEvent.Item>
      <FormEvent.Item name={fieldRate} hidden>
        <InputNumber />
      </FormEvent.Item>
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
  <FormEvent.Item label="主控表单" name={fieldOrigin}>
    <Input onChange={onChange} />
  </FormEvent.Item>
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
