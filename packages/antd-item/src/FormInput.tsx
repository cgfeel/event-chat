import { EventChatOptions, createToken, useEventChat } from '@event-chat/core';
import { memo, useMemo } from 'react';
import z, { ZodType } from 'zod';
import { getStringValue, namepathSchema, useFormEvent } from './utils';

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
const convertPath = (path?: FormInputProps['name']) =>
  (Array.isArray(path) ? path : [getStringValue([String(path)])]).filter(isDefined);

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
    const namePaths = convertPath(name);
    const parentName = convertPath(parent);
    const inputName = namePaths.length === 0 ? [createToken('input-name')] : namePaths;

    try {
      return JSON.stringify(parentName.concat(inputName));
    } catch {
      return `["${createToken('input-name')}"]`;
    }
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
> extends Omit<EventChatOptions<string, Schema, string, Type, undefined>, 'group' | 'token'> {
  name?: z.infer<typeof namepathSchema>;
  onChange?: (
    value: Parameters<
      NonNullable<EventChatOptions<string, Schema, string, Type, undefined>['callback']>
    >[0]['detail']
  ) => void;
}
