import { EventDetailType, NamepathType, createToken, useEventChat } from '@event-chat/core';
import { Form, FormInstance } from 'antd';
import { createContext, useContext, useMemo } from 'react';
import z from 'zod';

export const FormEventContext = createContext<FormEventContextInstance>({});
export const namepathSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.union([z.string(), z.number()])),
]);

export const getStringValue = <T extends NamepathType | undefined>(values: T[]) =>
  values.find((item) => item !== undefined && (!Array.isArray(item) || item.length > 0));

export const convertNamepath = (path: z.infer<typeof namepathSchema>) => {
  const namepath = Array.isArray(path) ? path : [path];
  return namepath.join('.');
};

export const useForm = <
  ValueType,
  Name extends NamepathType,
  Group extends string | undefined = undefined,
>(
  formInit?: FormEventInstance<ValueType, Name, Group>,
  options?: FormOptions<Name, Group>
) => {
  const { group, name } = formInit ?? {};
  const [form] = Form.useForm(formInit);
  const formName = useMemo(
    () => getStringValue([name, options?.name]) ?? createToken('form-event'),
    [name, options?.name]
  );

  const { emit } = useEventChat(formName, {
    schema: z.array(z.object({ name: namepathSchema, value: z.unknown() })),
    callback: ({ detail }) =>
      detail.forEach((item) => {
        const target = convertNamepath(item.name);
        emit({ detail: item.value, name: target });
      }),
    group: getStringValue([group, options?.group]),
  });

  const formInstance = Object.assign(form, { group, name, emit });
  return [formInstance] as const;
};

export const useFormEvent = () => {
  const record = useContext(FormEventContext);
  return record;
};

export interface FormEventContextInstance {
  group?: string;
  name?: NamepathType; // 用于向 form 传递 detail
  parent?: string | number | Array<string | number>;
  emit?: <Detail, CustomName extends NamepathType>(
    record: EventDetailType<Detail, CustomName>
  ) => void;
}

export interface FormEventInstance<
  ValueType,
  Name extends NamepathType,
  Group extends string | undefined = undefined,
>
  extends FormInstance<ValueType>, FormOptions<Name, Group> {
  emit?: <Detail, CustomName extends NamepathType>(
    record: EventDetailType<Detail, CustomName>
  ) => void;
}

type FormOptions<Name extends NamepathType, Group extends string | undefined = undefined> = {
  group?: Group;
  name?: Name;
};
