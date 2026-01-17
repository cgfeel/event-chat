import { EventDetailType, NamepathType, createToken, useEventChat } from '@event-chat/core';
import { Form, FormItemProps } from 'antd';
import { ComponentProps, FC, ReactNode, createContext, useContext, useMemo } from 'react';
import z from 'zod';

export const AntdCom: {
  form?: FormBaseInstance;
} = {};

export const FormEventContext = createContext<FormEventContextInstance>({});
export const getStringValue = <T extends NamepathType | undefined>(values: T[]) =>
  values.find((item) => item !== undefined && (!Array.isArray(item) || item.length > 0));

export const useForm = <
  Name extends string,
  Group extends string | undefined = undefined,
  ValueType = unknown,
>(
  options?: FormOptions<Name, Group>,
  formInit?: FormEventInstance<Name, Group, ValueType>
) => {
  const { group, name, focusField } = formInit ?? {};
  const [form] = Form.useForm<ValueType>(
    formInit ? { ...formInit, focusField: focusField ?? (() => {}) } : undefined
  );

  const formName = useMemo(
    () => getStringValue([name, options?.name]) ?? createToken('form-event'),
    [name, options?.name]
  );

  const groupName = useMemo(() => getStringValue([group, options?.group]), [group, options?.group]);
  const { emit } = useEventChat(formName, {
    schema: z.array(
      z.object({
        name: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
        value: z.unknown(),
      })
    ),
    callback: ({ detail }) =>
      detail.forEach((item) => {
        emit({ detail: item.value, name: item.name });
      }),
    group: groupName,
  });

  const formInstance = Object.assign(form, { group: groupName, name: formName, emit });
  return [formInstance] as const;
};

export const useFormInstance = <ValueType>() => {
  const FormCom = useFormCom<ValueType>();
  const form = FormCom.useFormInstance<ValueType>();
  const { group, name, emit } = useFormEvent();
  return Object.assign(form, { group, name, emit });
};

export const useFormCom = <ValueType = unknown>(): FormBaseInstance<ValueType> => {
  // eslint 不让 AntdCom.form 定义为 any 所以断言，泛型在组件实例化后传入
  const CustomForm = AntdCom.form as FormBaseInstance<ValueType> | undefined;
  return CustomForm ?? Form;
};

export const useFormEvent = () => {
  const record = useContext(FormEventContext);
  return record;
};

export interface FormEventContextInstance {
  group?: string;
  name?: NamepathType; // 用于向 form 传递 detail
  parent?: NamepathType;
  emit?: <Detail, CustomName extends NamepathType>(
    record: Omit<EventDetailType<Detail, CustomName>, 'group' | 'id' | 'origin' | 'time' | 'type'>
  ) => void;
}

export interface FormEventInstance<
  Name extends NamepathType,
  Group extends string | undefined = undefined,
  ValueType = unknown,
>
  extends FormInsType<ValueType>, FormOptions<Name, Group> {
  emit?: <Detail, CustomName extends NamepathType>(
    record: Omit<EventDetailType<Detail, CustomName>, 'group' | 'id' | 'origin' | 'time' | 'type'>
  ) => void;
}

export type FormBaseInstance<ValueType = unknown> = FormType<ValueType> & {
  Item: FC<
    Pick<FormItemProps, 'hidden' | 'initialValue' | 'name' | 'rules'> & {
      children?: ReactNode | ((form: FormInsType<ValueType>) => ReactNode);
    }
  >;
  List: FC<Pick<ComponentProps<typeof Form.List>, 'children' | 'initialValue' | 'name' | 'rules'>>;
  useFormInstance: <Value>() => FormInsType<Value>;
};

// 内部剔除掉 6 的新特新改为可选项，保留公共属性
export type FormInsType<ValueType = unknown> = Omit<
  NonNullable<ComponentProps<typeof Form<ValueType>>['form']>,
  'focusField'
> & {
  focusField?: NonNullable<ComponentProps<typeof Form>['form']>['focusField'];
};

type FormOptions<Name extends NamepathType, Group extends string | undefined = undefined> = {
  group?: Group;
  name?: Name;
};

type FormType<ValueType = unknown> = (
  props: Pick<ComponentProps<typeof Form<ValueType>>, 'children' | 'form' | 'name'> &
    React.RefAttributes<FormInsType<ValueType>>
) => React.ReactElement;
