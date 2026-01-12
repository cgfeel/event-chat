import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { ZodType } from 'zod';
import eventBus from './eventBus';
import {
  EventChatOptions,
  EventDetailType,
  EventName,
  NamepathType,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  isResultType,
  isSafetyType,
  mountEvent,
} from './utils';
import { checkLiteral, validate } from './validate';

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn);
  useEffect(() => {
    methodRef.current = fn;
  }, [fn]);

  return methodRef;
};

export function useEventChat<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(name: Name, ops?: EventChatOptions<Name, Schema, Group, Type, Token>) {
  const eventName = useMemo(() => getEventName(name), [name]);
  const id = useId();

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(eventName, id, ops?.type)),
    [eventName, id, ops?.type]
  );

  const nameRc = useMemoFn(name);
  const options = useMemoFn(ops);
  const tokenRc = useMemoFn(token);

  const errorHandle = useCallback(
    (error: unknown, data: unknown) => {
      if (error instanceof Error && options.current?.debug)
        options.current.debug(isResultType(error.cause) ? { ...error.cause, data } : undefined);
    },
    [options]
  );

  const callbackHandle = useCallback(
    (data: EventDetailType) => {
      const { name: subName, ...args } = data;
      const opitem = options.current;

      if (!opitem || !isSafetyType(subName, nameRc.current)) return;
      const upRecord = { ...args, name: subName };

      if (opitem.schema !== undefined) {
        validate(upRecord, { ...opitem, schema: opitem.schema }, tokenRc.current)
          .then(opitem.callback)
          .catch((error) => errorHandle(error, data.detail));
      } else {
        checkLiteral(upRecord, { ...opitem, schema: undefined }, tokenRc.current)
          .then(opitem.callback)
          .catch((error) => errorHandle(error, data.detail));
      }
    },
    [nameRc, options, tokenRc, errorHandle]
  );

  const emit = useCallback(
    <Detail, CustomName extends NamepathType>(
      detail: Omit<EventDetailType<Detail, CustomName>, 'group' | 'id' | 'origin' | 'type'>
    ) => {
      // 业务提交 name 是空的，那么 origin 就是空，当做匿名处理
      const event = createEvent({
        ...detail,
        group: ops?.group,
        origin: nameRc.current,
        type: ops?.type,
        id,
      });
      document.body.dispatchEvent(event);
    },
    [id, nameRc, ops?.group, ops?.type]
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

  return Object.freeze({ token, emit });
}
