import { createToken, useEventChat } from '@event-chat/core';
import { Form, FormItemProps as FormItemRawProps } from 'antd';
import { FC, memo, useMemo } from 'react';
import z from 'zod';
import { getStringValue, namepathSchema, useFormEvent } from './utils';

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
const convertPath = (path?: InputProps['name']) =>
  (Array.isArray(path) ? path : [getStringValue([String(path)])]).filter(isDefined);

const InputInner: FC<InputProps> = ({ name }) => {
  const { group, parent } = useFormEvent();
  const formName = useMemo(() => {
    const namePaths = convertPath(name);
    const parentName = convertPath(parent);
    const inputName = namePaths.length === 0 ? [createToken('input-name')] : namePaths;

    try {
      return JSON.stringify(parentName.concat(inputName));
    } catch {
      return `["${createToken('input-name')}"]`;
    }
  }, [name, parent]);
  useEventChat(formName, { callback: () => {}, group });
  return null;
};

const Input = memo(InputInner);
const FormItem: FC<FormItemProps> = ({ children, ...props }) => {
  return (
    <>
      <Form.Item {...props}>{children}</Form.Item>
      <Form.Item name={props.name}>
        <Input />
      </Form.Item>
    </>
  );
};

export default FormItem;

interface FormItemProps extends Omit<FormItemRawProps, 'name'>, InputProps {
  //   parent: string | (string | number);
}

interface InputProps {
  name?: z.infer<typeof namepathSchema>;
}
