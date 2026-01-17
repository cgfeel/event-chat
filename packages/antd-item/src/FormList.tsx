import { NamepathType, checkDetail } from '@event-chat/core';
import { Form as FormRaw } from 'antd';
import { ComponentProps, FC, PropsWithChildren, memo, useMemo } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormEventContext, useFormCom, useFormEvent } from './utils';

const isNamepath = (value: unknown): value is number | string =>
  typeof value === 'string' || Number.isInteger(value);

const FormListInner: FC<PropsWithChildren<FormListInnerProps>> = ({ children, name: parent }) => {
  const record = useFormEvent();
  return (
    <FormEventContext.Provider value={{ ...record, parent }}>{children}</FormEventContext.Provider>
  );
};

const ListItem = memo(FormListInner);
const FormList = <Name extends NamepathType, Schema extends ZodType | undefined = undefined>({
  async,
  initialValue,
  name,
  rules,
  schema,
  type,
  callback,
  children,
  debug,
  onChange,
  ...props
}: FormListProps<Name, Schema>) => {
  const Form = useFormCom();
  const fieldName = useMemo(
    () =>
      (Array.isArray(name) ? name.filter(isNamepath) : undefined) ??
      (isNamepath(name) ? name : undefined),
    [name]
  );

  return !fieldName ? null : (
    <>
      <Form.List
        {...props}
        initialValue={initialValue}
        name={fieldName}
        rules={
          !schema
            ? rules
            : (rules ?? []).concat([
                {
                  validator: (_, value) => checkDetail(value, { async, schema }),
                },
              ])
        }
      >
        {(fields, options, metas) => (
          <ListItem name={name}>{children(fields, options, metas)}</ListItem>
        )}
      </Form.List>
      <Form.Item {...props} name={fieldName} hidden>
        <FormInput
          async={async}
          name={fieldName}
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

export default FormList;

interface FormListInnerProps extends Pick<FormListProps<NamepathType>, 'name'> {}

interface FormListProps<Name extends NamepathType, Schema extends ZodType | undefined = undefined>
  extends
    Omit<ComponentProps<typeof FormRaw.List>, 'name'>,
    Omit<FormInputProps<Name, Schema>, 'name'> {
  name: Name;
}
