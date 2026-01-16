import { EventChatOptions, NamepathType, createToken, useEventChat } from '@event-chat/core';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import { ZodType } from 'zod';
import { useFormEvent } from './utils';

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
const convertPath = (path?: NamepathType) =>
  (typeof path === 'object' ? [...path] : [path]).filter(isDefined);

const InputInner = <
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>(
  { name, callback, onChange, ...props }: FormInputProps<Name, Schema, Type>,
  ref?: ForwardedRef<HTMLInputElement>
) => {
  const { group, parent } = useFormEvent();
  const formName = useMemo(() => {
    const itemName = convertPath(name);
    const namePaths = convertPath(parent).concat(itemName);
    return (
      (namePaths.length === 0 ? [createToken('input-name')] : undefined) ??
      (namePaths.length === 1 && typeof name !== 'object' ? (name ?? namePaths) : namePaths)
    );
  }, [name, parent]);

  const result = useEventChat(formName, {
    ...props,
    callback: (record) => {
      callback?.(record);
      onChange?.(record.detail, result);
    },
    group,
  });

  return <input ref={ref} />;
};

const FormInput = forwardRef(InputInner) as (<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>(
  props: FormInputProps<Name, Schema, Type> & { ref?: ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof InputInner>) & { displayName?: string };

if (process.env.NODE_ENV !== 'production') {
  FormInput.displayName = 'FormInput';
}

export default FormInput;

export interface FormInputProps<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
> extends Omit<EventChatOptions<NamepathType, Schema, string, Type, undefined>, 'group' | 'token'> {
  name?: Name;
  onChange?: (
    value: Parameters<
      NonNullable<EventChatOptions<NamepathType, Schema, string, Type, undefined>['callback']>
    >[0]['detail'],
    options: ReturnType<typeof useEventChat>
  ) => void;
}
