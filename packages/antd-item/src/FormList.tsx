import { Form } from 'antd';
import { ComponentProps, FC, PropsWithChildren, memo } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormEventContext, useFormEvent } from './utils';

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
  schema,
  type,
  callback,
  children,
  debug,
  onChange,
  ...props
}: FormListProps<Schema, Type>) => (
  <>
    <Form.List {...props}>
      {(fields, options, metas) => (
        <ListItem name={props.name}>{children(fields, options, metas)}</ListItem>
      )}
    </Form.List>
    <Form.Item name={props.name}>
      <FormInput
        async={async}
        schema={schema}
        type={type}
        callback={callback}
        debug={debug}
        onChange={onChange}
      />
    </Form.Item>
  </>
);

export default FormList;

interface FormListInnerProps extends Pick<FormListProps, 'name'> {}

interface FormListProps<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>
  extends ComponentProps<typeof Form.List>, Omit<FormInputProps<Schema, Type>, 'name'> {}
