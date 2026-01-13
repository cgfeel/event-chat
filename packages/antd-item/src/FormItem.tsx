import { FormItemProps as FormItemRawProps } from 'antd';
import { ReactNode } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormInsType, convertName, useFormCom, useFormInstance } from './utils';

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
  const formInstance = useFormInstance();
  const Form = useFormCom();
  return (
    <>
      <Form.Item {...props}>
        {typeof children === 'function' ? children(formInstance) : children}
      </Form.Item>
      {props.name !== undefined && (
        <Form.Item name={convertName(props.name)} hidden>
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
      )}
    </>
  );
};

export default FormItem;

interface FormItemProps<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>
  extends Omit<FormItemRawProps, 'children' | 'name'>, FormInputProps<Schema, Type> {
  children?: ReactNode | ((form: FormInsType) => ReactNode);
}
