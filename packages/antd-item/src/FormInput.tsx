import { EventChatOptions, NamepathType, createToken, useEventChat } from '@event-chat/core';
import { memo, useMemo } from 'react';
import { ZodType } from 'zod';
import { useFormEvent } from './utils';

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
const convertPath = (path?: NamepathType) =>
  (typeof path === 'object' ? [...path] : [path]).filter(isDefined);

const InputInner = <
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>({
  async,
  name,
  schema,
  type,
  callback,
  debug,
  onChange,
}: FormInputProps<Schema, Type>) => {
  const { group, parent } = useFormEvent();
  const formName = useMemo(() => {
    const itemName = convertPath(name);
    const namePaths = convertPath(parent).concat(itemName);
    return (
      (namePaths.length === 0 ? [createToken('input-name')] : undefined) ??
      (namePaths.length === 1 && typeof name !== 'object' ? (name ?? namePaths) : namePaths)
    );
  }, [name, parent]);

  useEventChat(formName, {
    callback: (record) => {
      callback?.(record);
      onChange?.(record.detail);
    },
    async,
    group,
    schema,
    type,
    debug,
  });

  return null;
};

const FormInput = memo(InputInner) as (<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
>(
  props: FormInputProps<Schema, Type>
) => ReturnType<typeof InputInner>) & { displayName?: string };

if (process.env.NODE_ENV !== 'production') {
  FormInput.displayName = 'FormInput';
}

export default FormInput;

export interface FormInputProps<
  Schema extends ZodType | undefined = undefined,
  Type extends string | undefined = undefined,
> extends Omit<EventChatOptions<NamepathType, Schema, string, Type, undefined>, 'group' | 'token'> {
  name?: NamepathType;
  onChange?: (
    value: Parameters<
      NonNullable<EventChatOptions<NamepathType, Schema, string, Type, undefined>['callback']>
    >[0]['detail']
  ) => void;
}
