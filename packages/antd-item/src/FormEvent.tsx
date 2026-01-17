import { FormProps as FormRawProps } from 'antd';
import { FC, PropsWithChildren, memo, useMemo } from 'react';
import {
  FormEventContext,
  FormEventContextInstance,
  FormEventInstance,
  getStringValue,
  useForm,
  useFormCom,
} from './utils';

const FormProviderInner: FC<PropsWithChildren<FormEventContextInstance>> = ({
  children,
  group,
  name,
  emit,
}) => (
  <FormEventContext.Provider value={{ group, name, emit }}>{children}</FormEventContext.Provider>
);

const FormProvider = memo(FormProviderInner);

const FormInitialization = <
  Name extends string,
  Group extends string | undefined = undefined,
  ValuesType = unknown,
>({
  children,
  form,
  group,
  name,
  ...props
}: PropsWithChildren<FormProps<Name, Group, ValuesType>>) => {
  const Form = useFormCom<ValuesType>();
  const [formInstance] = useForm({ group, name }, form);
  return (
    <Form {...props} form={formInstance} name={formInstance.name}>
      <FormProvider group={formInstance.group} name={formInstance.name} emit={formInstance.emit}>
        {children}
      </FormProvider>
    </Form>
  );
};

const FormEvent = <
  Name extends string,
  Group extends string | undefined = undefined,
  ValuesType = unknown,
>({
  children,
  form,
  group,
  name,
  ...props
}: PropsWithChildren<FormProps<Name, Group, ValuesType>>) => {
  // 组件 Form 的 name 优先于 useForm 外部配置的 form.name，因为这是 antd form 的默认配置
  // 而 group 外部配置 useForm 优先于当前组件配置，减少不必要的 rerender，如果配置不一样可以在 FormItem 通过 callback 进行排查
  const formName = useMemo(() => getStringValue([name, form?.name]), [form?.name, name]);
  const formGroup = useMemo(() => getStringValue([form?.group, group]), [form?.group, group]);
  const Form = useFormCom<ValuesType>();

  if (form?.emit && form.name === formName) {
    const { focusField, ...formIns } = form;
    formIns.group = formGroup;
    return (
      <Form {...props} form={{ ...formIns, focusField: focusField ?? (() => {}) }}>
        <FormProvider group={formGroup} name={formName} emit={form.emit}>
          {children}
        </FormProvider>
      </Form>
    );
  }

  return (
    <FormInitialization {...props} form={form} group={formGroup} name={formName}>
      {children}
    </FormInitialization>
  );
};

export default FormEvent;

// 这里的 Name 要适配 Form 组件，所以取 string
interface FormProps<
  Name extends string = string,
  Group extends string | undefined = undefined,
  ValuesType = unknown,
> extends Omit<FormRawProps<ValuesType>, 'form'> {
  form?: FormEventInstance<Name, Group, ValuesType>;
  group?: Group;
  name?: Name;
}
