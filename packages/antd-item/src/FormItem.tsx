import { Form, FormItemProps as FormItemRawProps } from 'antd';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { convertName } from './utils';

const FormItem = <
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>({
  async,
  children,
  schema,
  type,
  callback,
  debug,
  onChange,
  ...props
}: FormItemProps<Schema, Type>) => {
  return (
    <>
      <Form.Item {...props}>{children}</Form.Item>
      <Form.Item name={convertName(props.name)}>
        <FormInput
          async={async}
          name={props.name}
          schema={schema}
          type={type}
          callback={callback}
          debug={debug}
          onChange={onChange}
        />
      </Form.Item>
    </>
  );
};

export default FormItem;

interface FormItemProps<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>
  extends Omit<FormItemRawProps, 'name'>, FormInputProps<Schema, Type> {}
