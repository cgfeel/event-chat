import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { ZodType } from 'zod';
import eventBus from './eventBus';
import {
  EventChatOptions,
  EventChatOptionsWithSchema,
  EventChatOptionsWithoutSchema,
  EventDetailType,
  EventName,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  hasSchema,
  isResultType,
  isSafetyType,
  mountEvent,
} from './utils';
import { validate } from './validate';

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn);
  useEffect(() => {
    methodRef.current = fn;
  }, [fn]);

  return methodRef;
};

export function useEventChat<Name extends string>(
  name: Name,
  ops?: EventChatOptionsWithoutSchema<Name>
): Readonly<ChatResult>;

export function useEventChat<Schema extends ZodType, Name extends string>(
  name: Name,
  ops?: EventChatOptionsWithSchema<Schema, Name>
): Readonly<ChatResult>;

export function useEventChat<Schema extends ZodType, Name extends string>(
  name: Name,
  ops?: EventChatOptions<Schema, Name>
): Readonly<ChatResult> {
  const eventName = useMemo(() => getEventName(name), [name]);
  const allowToken = useMemo(() => Boolean(ops?.token), [ops?.token]);
  const id = useId();

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(name, id, ops?.type)),
    [id, name, ops?.type]
  );

  const options = useMemoFn(ops);
  const callbackHandle = useCallback(
    (data: EventDetailType) => {
      const { name: subName, ...args } = data;
      const opitem = options.current;

      if (!opitem || !isSafetyType(subName, name)) return;

      if (hasSchema(opitem)) {
        validate({ ...data, name: subName }, { ...opitem, token: allowToken ? token : undefined })
          .then(opitem.callback)
          .catch((error) => {
            if (error instanceof Error && opitem.debug)
              opitem.debug(args, isResultType(error.cause) ? error.cause : undefined);
          });
        return;
      }

      opitem.callback?.({ ...args, name: subName });
    },
    [allowToken, name, options]
  );

  const emit = useCallback(
    <Detail, CustomName extends string = string>(
      detail: Omit<EventDetailType<Detail, CustomName>, '__origin' | 'group' | 'id' | 'type'>
    ) => {
      // 业务提交 name 是空的，那么 __origin 就是空，当做匿名处理
      // 匿名事件只允许通过 emit 发送消息，不能通过 callback 接收消息
      const event = createEvent({
        ...detail,
        __origin: name,
        group: ops?.group,
        type: ops?.type,
        id,
      });
      document.body.dispatchEvent(event);
    },
    [id, name, ops?.group, ops?.type]
  );

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent);
      document.body.dataset.globalIsListened = '1';
    }
  }, []);

  useEffect(() => {
    if (eventName) eventBus.on(eventName, callbackHandle);
    return () => {
      if (eventName) eventBus.off(eventName, callbackHandle);
    };
  }, [eventName, callbackHandle]);

  return { token, emit } as const;
}

type ChatResult = { token: string; emit: EmitType };
type EmitType = <Detail, CustomName extends string = string>(
  detail: Omit<EventDetailType<Detail, CustomName>, '__origin' | 'group' | 'id' | 'type'>
) => void;
