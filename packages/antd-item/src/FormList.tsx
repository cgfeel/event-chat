import { NamepathType } from '@event-chat/core';
import { ComponentProps, FC, PropsWithChildren, memo } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormBaseInstance, FormEventContext, convertName, useFormCom, useFormEvent } from './utils';

const FormListInner: FC<PropsWithChildren<FormListInnerProps>> = ({ children, name: parent }) => {
  const record = useFormEvent();
  return (
    <FormEventContext.Provider value={{ ...record, parent }}>{children}</FormEventContext.Provider>
  );
};

const ListItem = memo(FormListInner);
const FormList = <
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>({
  async,
  name,
  schema,
  type,
  callback,
  children,
  debug,
  onChange,
  ...props
}: FormListProps<Schema, Type>) => {
  const Form = useFormCom();
  return (
    <>
      <Form.List {...props} name={typeof name === 'object' ? [...name] : name}>
        {(fields, options, metas) => (
          <ListItem name={name}>{children(fields, options, metas)}</ListItem>
        )}
      </Form.List>
      <Form.Item name={convertName(name)}>
        <FormInput
          async={async}
          name={convertName(name)}
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

interface FormListInnerProps extends Pick<FormListProps, 'name'> {}

interface FormListProps<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>
  extends
    Omit<ComponentProps<NonNullable<FormBaseInstance['List']>>, 'name'>,
    Omit<FormInputProps<Schema, Type>, 'name'> {
  name: NamepathType;
}
