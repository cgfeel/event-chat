import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { ZodType } from 'zod';
import eventBus from './eventBus';
import {
  createEvent,
  createToken,
  DetailType,
  EventChatOptions,
  EventDetailType,
  EventName,
  getConditionKey,
  getEventName,
  isSafetyType,
  mountEvent,
} from './utils';

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn);
  useEffect(() => {
    methodRef.current = fn;
  }, [fn]);

  return methodRef;
};

export const useEventChat = <Name extends string, Schema extends ZodType = ZodType>(
  name: Name,
  ops: EventChatOptions<Name, Schema>
) => {
  const eventName = useMemo(() => getEventName(name), [name]);
  const { callback, ...opsRecord } = ops;

  const callbackFn = useMemoFn(callback);
  const id = useId();

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(name, id, opsRecord.type)),
    [id, name, opsRecord.type]
  );

  const callbackHandle = useCallback(
    ({ name: subName, ...args }: DetailType<string, Schema>) => {
      if (callbackFn.current && isSafetyType(subName, name)) {
        callbackFn.current({ ...args, name: subName });
      }
    },
    [callbackFn, name]
  );

  const emit = useCallback(
    <Detail>(detail: Omit<EventDetailType<Detail>, '__origin' | 'group' | 'id' | 'type'>) => {
      // 业务提交 name 是空的，那么 __origin 就是空，当做匿名处理
      // 匿名事件只允许通过 emit 发送消息，不能通过 callback 接收消息
      const event = createEvent({
        ...detail,
        __origin: name,
        group: opsRecord.group,
        type: opsRecord.type,
        id,
      });
      document.body.dispatchEvent(event);
    },
    [id, name, opsRecord.group, opsRecord.type]
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

  useEffect(() => {
    eventBus.mount(callbackHandle, opsRecord);
    return () => {
      eventBus.unmount(callbackHandle);
    };
  }, [opsRecord, callbackHandle]);

  return { token, emit } as const;
};
