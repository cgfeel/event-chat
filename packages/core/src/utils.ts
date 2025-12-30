import { ZodType, z } from 'zod';
import eventBus from './eventBus';

export const EventName = 'custom-event-chat-11.18';
export const createEvent = <Detail, Name extends string = string>(
  detail: EventDetailType<Detail, Name>
) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });

export const createToken = (key: string): string =>
  window.btoa(`${key}:${Math.random()}:${Date.now()}`);

export const getConditionKey = (name: string, id: string, type?: string) =>
  [name, id, type].filter(Boolean).join('-');

// 考虑空字符的情况
export const getEventName = <T extends string>(name: T) =>
  name ? `event-chart-${name}` : undefined;

export const isResultType = (data: unknown): data is ResultType =>
  typeof data === 'object' && data !== null && 'success' in data && !data.success;

export const isSafetyType = <T>(target: unknown, origin: T): target is T => target === origin;

export function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName && event.detail) {
    eventBus.emit(currentName, event.detail);
  }
}

export interface EventChatOptions<
  Name extends string,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> {
  async?: boolean;
  group?: Group;
  schema?: Schema;
  token?: Token;
  type?: Type;
  callback?: (target: DetailType<Name, Schema, Group, Type, Token>) => void;
  debug?: (result?: ResultType) => void;
}

export type DetailType<
  Name extends string,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = {
  __origin: string;
  id: string;
  name: Name;
  detail: WasProvided<Schema> extends true ? z.output<Exclude<Schema, undefined>> : unknown;
  group: WasProvided<Group> extends true ? Exclude<Group, undefined> : undefined;
  type: WasProvided<Type> extends true ? Exclude<Type, undefined> : undefined;
  token: Token extends true ? string : undefined;
  global?: boolean;
};

export type EventDetailType<Detail = unknown, Name extends string = string> = {
  __origin: string;
  id: string;
  name: Name;
  detail?: Detail;
  global?: boolean;
  group?: string;
  type?: string;
  token?: string;
};

export type ResultType<Schema = unknown> = Omit<z.ZodSafeParseError<Schema>, 'data'> & {
  data: unknown;
};

// 工具类型：判断在调用中，泛型 T 是否“实际上被提供了参数”
// 如果被提供了（无论具体值还是undefined），T会被实例化为具体的类型（如 string, number, undefined）
// 如果没被提供，T会保持其默认值或整个约束类型
export type WasProvided<T, Default = undefined> =
  // 关键判断：如果 T 不等于 Default，且不等于约束的“或undefined”部分，则认为它被提供了
  [T] extends [Default]
    ? false
    : [T] extends [undefined]
      ? false // 单独处理只传了 undefined 的情况，如果将其视为“已提供但值为空”
      : true;

interface CustomDetailEvent extends Event {
  detail?: EventDetailType;
}
