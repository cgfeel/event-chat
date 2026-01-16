import { NamepathType, checkDetail } from '@event-chat/core';
import { FormItemProps as FormItemRawProps } from 'antd';
import { ReactNode } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormEventInstance, useFormCom, useFormInstance } from './utils';

const FormItem = <
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>({
  async,
  children,
  initialValue,
  name,
  rules,
  schema,
  type,
  callback,
  debug,
  onChange,
  transform,
  ...props
}: FormItemProps<Name, Schema, Type>) => {
  const { group, emit } = useFormInstance();
  const Form = useFormCom();
  return (
    <>
      <Form.Item
        {...props}
        initialValue={initialValue}
        name={name}
        rules={
          !schema
            ? rules
            : (rules ?? []).concat([
                {
                  validator: (_, value) => checkDetail(value, { async, schema }),
                  transform,
                },
              ])
        }
      >
        {typeof children === 'function'
          ? (form) => children({ ...form, group, name, emit })
          : children}
      </Form.Item>
      {name !== undefined && (
        <Form.Item {...props} name={name} hidden>
          <FormInput
            async={async}
            name={name}
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
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>
  extends
    Omit<FormItemRawProps, 'children' | 'initialValue' | 'name'>,
    FormInputProps<Name, Schema, Type> {
  children?: ReactNode | ((form: FormEventInstance<Name, string | undefined>) => ReactNode);
  initialValue?: unknown;
  transform?: (value: unknown) => unknown;
}
